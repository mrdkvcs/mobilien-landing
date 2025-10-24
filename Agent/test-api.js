// Agent API Test Script
// This script tests if the API key is working correctly

// Load environment variables from .env file
require('dotenv').config();

const API_KEY = process.env.AGENT_API_KEY;

console.log('🔑 API Key loaded:', API_KEY ? '✅ Yes' : '❌ No');
console.log('📝 API Key value:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'Not found');

// Test API connection
async function testAgentAPI() {
  if (!API_KEY) {
    console.error('❌ No API key found in environment variables');
    return;
  }

  try {
    console.log('🚀 Testing Agent API connection...');
    
    // Example API call (replace with actual Agent API endpoint)
    const response = await fetch('https://api.agent.com/test', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ API connection successful!');
      const data = await response.json();
      console.log('📊 Response:', data);
    } else {
      console.log('⚠️ API responded with status:', response.status);
    }
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    console.log('💡 Make sure the API endpoint is correct and accessible');
  }
}

// Run the test
testAgentAPI();
