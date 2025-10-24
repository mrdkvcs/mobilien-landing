// Test context loading from PostgreSQL
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

console.log('🔍 Testing context loading from PostgreSQL...');
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

async function testContextLoading() {
  try {
    console.log('📡 Connecting to database...');
    
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test context table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'context_data'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ context_data table not found. Run migration first!');
      process.exit(1);
    }
    
    console.log('✅ context_data table exists');
    
    // Test context data loading
    console.log('\n🧪 Testing context data loading...');
    
    const result = await client.query(
      'SELECT data FROM context_data WHERE category = $1 AND key_name = $2',
      ['charging_prices', 'hungary_2025']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No context data found for charging_prices/hungary_2025');
      console.log('💡 Run the migration script to insert data');
    } else {
      console.log('✅ Context data found!');
      const data = result.rows[0].data;
      console.log('📊 Data preview:');
      console.log('  - Description:', data.description);
      console.log('  - Last updated:', data.last_updated);
      console.log('  - Providers count:', Object.keys(data.providers).length);
      console.log('  - Sample provider:', Object.keys(data.providers)[0]);
      
      // Test the get_context_data function
      console.log('\n🔧 Testing get_context_data function...');
      const functionResult = await client.query(
        'SELECT get_context_data($1, $2) as context',
        ['charging_prices', 'hungary_2025']
      );
      
      if (functionResult.rows[0].context) {
        console.log('✅ get_context_data function works!');
      } else {
        console.log('❌ get_context_data function returned empty result');
      }
    }
    
    client.release();
    
    console.log('\n🎉 Context loading test completed!');
    
  } catch (error) {
    console.error('\n❌ Context loading test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testContextLoading();
