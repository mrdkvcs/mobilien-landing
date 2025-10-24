// Test PostgreSQL connection
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load DATABASE_URL from key.env
const envPath = path.resolve(__dirname, '../key.env');
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync(envPath)) {
  // Read file with explicit encoding and strip BOM
  let envContent = fs.readFileSync(envPath, 'utf8');
  // Remove BOM if present
  if (envContent.charCodeAt(0) === 0xFEFF) {
    envContent = envContent.slice(1);
  }
  
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('DATABASE_URL=')) {
      databaseUrl = trimmedLine.substring('DATABASE_URL='.length).trim();
      break;
    }
  }
}

console.log('🔍 Testing PostgreSQL connection...');
console.log('DATABASE_URL found:', !!databaseUrl);

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in key.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('📡 Connecting to database...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Server time:', result.rows[0].now);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_sessions', 'chat_messages')
    `);
    
    console.log('\n📊 Tables found:');
    tablesResult.rows.forEach(row => {
      console.log('  ✓', row.table_name);
    });
    
    if (tablesResult.rows.length === 0) {
      console.log('\n⚠️  No chat tables found. Run the migration SQL script first!');
    } else if (tablesResult.rows.length === 2) {
      console.log('\n✅ All required tables exist!');
      
      // Test insert
      console.log('\n🧪 Testing insert...');
      const testSessionId = `test_${Date.now()}`;
      
      await client.query(
        'INSERT INTO chat_sessions (session_id) VALUES ($1)',
        [testSessionId]
      );
      console.log('✅ Session created:', testSessionId);
      
      await client.query(
        'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
        [testSessionId, 'user', 'Test message']
      );
      console.log('✅ Message saved');
      
      // Cleanup
      await client.query('DELETE FROM chat_messages WHERE session_id = $1', [testSessionId]);
      await client.query('DELETE FROM chat_sessions WHERE session_id = $1', [testSessionId]);
      console.log('✅ Test data cleaned up');
    }
    
    client.release();
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();

