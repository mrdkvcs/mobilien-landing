// OpenRouter API Configuration
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('[config] Loading configuration from Agent/.env');

const config = {
  // OpenRouter API settings
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || process.env.AGENT_API_KEY,
    baseUrl: 'https://openrouter.ai/api/v1',
    model: process.env.GPT_MODEL || 'openai/gpt-4-turbo',
    defaultMaxTokens: 500,
    defaultTemperature: 0.7,
  },

  // Database settings
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  },

  // Server settings
  server: {
    port: process.env.PORT || 3000,
    corsOrigins: [
      'https://mobilien.app',
      'https://www.mobilien.app',
      'https://mobilien.hu',
      'https://www.mobilien.hu',
      'http://localhost:8000',
      'http://localhost:3000'
    ],
  },

  // Available GPT models through OpenRouter
  availableModels: {
    'gpt-4-turbo': 'openai/gpt-4-turbo',
    'gpt-4': 'openai/gpt-4',
    'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4o-mini': 'openai/gpt-4o-mini',
  },
};

// Validation
if (!config.openrouter.apiKey) {
  console.warn('[config] WARNING: OPENROUTER_API_KEY not found in environment variables');
} else {
  console.log('[config] ✅ OpenRouter API key configured');
  console.log('[config] 🤖 Using model:', config.openrouter.model);
}

module.exports = config;

