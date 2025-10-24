import { Pool } from 'pg';

// Create a singleton connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.warn('[DB] DATABASE_URL not found, database features disabled');
      // Return a dummy pool that won't be used
      pool = new Pool({ 
        connectionString: 'postgresql://localhost:5432/dummy',
        max: 0 
      });
      return pool;
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client', err);
    });

    console.log('[DB] PostgreSQL connection pool created');
  }

  return pool;
}

// Helper function to execute queries with error handling
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  
  if (!process.env.DATABASE_URL) {
    console.warn('[DB] Skipping query, DATABASE_URL not configured');
    return [];
  }

  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error: any) {
    console.error('[DB] Query error:', error.message);
    throw error;
  }
}

// Session management functions
export async function createOrGetSession(sessionId: string, userId?: string) {
  try {
    // Try to get existing session
    const existing = await query(
      'SELECT * FROM chat_sessions WHERE session_id = $1',
      [sessionId]
    );

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new session
    const result = await query(
      'INSERT INTO chat_sessions (session_id, user_id) VALUES ($1, $2) RETURNING *',
      [sessionId, userId || null]
    );

    return result[0];
  } catch (error: any) {
    console.error('[DB] createOrGetSession error:', error.message);
    return null;
  }
}

// Save a chat message
export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
) {
  try {
    const result = await query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [sessionId, role, content]
    );

    console.log(`[DB] Message saved: ${role} - ${content.substring(0, 50)}...`);
    return result[0];
  } catch (error: any) {
    console.error('[DB] saveMessage error:', error.message);
    return null;
  }
}

// Get chat history for a session
export async function getChatHistory(sessionId: string, limit: number = 50) {
  try {
    const messages = await query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC LIMIT $2',
      [sessionId, limit]
    );

    console.log(`[DB] Retrieved ${messages.length} messages for session ${sessionId}`);
    return messages;
  } catch (error: any) {
    console.error('[DB] getChatHistory error:', error.message);
    return [];
  }
}

// Update session timestamp
export async function updateSessionTimestamp(sessionId: string) {
  try {
    await query(
      'UPDATE chat_sessions SET updated_at = NOW() WHERE session_id = $1',
      [sessionId]
    );
  } catch (error: any) {
    console.error('[DB] updateSessionTimestamp error:', error.message);
  }
}

// Get context data from PostgreSQL
export async function getContextData(category: string, keyName?: string) {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[DB] Skipping context query, DATABASE_URL not configured');
      return null;
    }

    let result;
    if (keyName) {
      // Get specific key data
      result = await query(
        'SELECT data FROM context_data WHERE category = $1 AND key_name = $2',
        [category, keyName]
      );
    } else {
      // Get all data for category
      result = await query(
        'SELECT data FROM context_data WHERE category = $1',
        [category]
      );
    }

    if (result.length === 0) {
      console.warn(`[DB] No context data found for category: ${category}, key: ${keyName || 'all'}`);
      return null;
    }

    if (keyName) {
      return result[0].data;
    } else {
      // Return array of all data for category
      return result.map(row => row.data);
    }
  } catch (error: any) {
    console.error('[DB] getContextData error:', error.message);
    return null;
  }
}

