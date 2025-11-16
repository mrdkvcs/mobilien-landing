// OpenRouter API Helper Module
const axios = require('axios');
const config = require('./config');

/**
 * Send a chat completion request to OpenRouter
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters (model, max_tokens, temperature, etc.)
 * @returns {Promise<Object>} - The API response
 */
async function chatCompletion(messages, options = {}) {
  const {
    model = config.openrouter.model,
    max_tokens = config.openrouter.defaultMaxTokens,
    min_tokens,
    temperature = config.openrouter.defaultTemperature,
    timeout = 30000,
  } = options;

  if (!config.openrouter.apiKey) {
    throw new Error('API_KEY is not configured');
  }

  try {
    const requestBody = {
      model,
      messages,
      max_tokens,
      temperature,
    };

    // Add min_tokens if provided
    if (min_tokens) {
      requestBody.min_tokens = min_tokens;
    }

    const response = await axios.post(
      `${config.openrouter.baseUrl}/chat/completions`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${config.openrouter.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mobilien.app',
          'X-Title': 'Mobilien AI Agent',
        },
        timeout,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`OpenRouter API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(`OpenRouter API timeout or network error: ${error.message}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`OpenRouter request setup error: ${error.message}`);
    }
  }
}

/**
 * Get the reply text from a chat completion response
 * @param {Object} response - The OpenRouter API response
 * @returns {string} - The assistant's reply text
 */
function getReplyText(response) {
  return response?.choices?.[0]?.message?.content || '';
}

/**
 * Create a system message
 * @param {string} content - The system message content
 * @returns {Object} - Message object
 */
function systemMessage(content) {
  return { role: 'system', content };
}

/**
 * Create a user message
 * @param {string} content - The user message content
 * @returns {Object} - Message object
 */
function userMessage(content) {
  return { role: 'user', content };
}

/**
 * Create an assistant message
 * @param {string} content - The assistant message content
 * @returns {Object} - Message object
 */
function assistantMessage(content) {
  return { role: 'assistant', content };
}

/**
 * Build a simple chat with system prompt and user message
 * @param {string} systemPrompt - The system prompt
 * @param {string} userMsg - The user's message
 * @returns {Array} - Array of message objects
 */
function buildSimpleChat(systemPrompt, userMsg) {
  return [
    systemMessage(systemPrompt),
    userMessage(userMsg)
  ];
}

module.exports = {
  chatCompletion,
  getReplyText,
  systemMessage,
  userMessage,
  assistantMessage,
  buildSimpleChat,
};

