// Quick test for Mistral API key
require('dotenv').config({ path: require('path').resolve(__dirname, '../key.env') });

const API_KEY = process.env.AGENT_API_KEY || process.env.MISTRAL_API_KEY;

console.log('API Key found:', !!API_KEY);
console.log('API Key preview:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'N/A');

async function testKey() {
  if (!API_KEY) {
    console.error('❌ No API key in .env');
    return;
  }

  try {
    console.log('🚀 Testing Mistral API...');
    
    const response = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key is valid!');
      console.log('Available models:', data.data?.slice(0, 3).map(m => m.id) || 'N/A');
    } else {
      const text = await response.text();
      console.error('❌ API key invalid or error:', text);
    }
  } catch (err) {
    console.error('❌ Network error:', err.message);
  }
}

testKey();
