-- Migration: Create chat history tables
-- Description: Store chat sessions and messages for Mobi AI assistant
-- Created: 2025-01-25

-- Table: chat_sessions
-- Stores chat session metadata
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_ip VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table: chat_messages
-- Stores individual messages in chat sessions
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    response_time_ms INTEGER, -- Only for assistant messages
    tokens_used INTEGER, -- Token count for this message
    model_used VARCHAR(100), -- e.g., 'mistral-small-latest'
    context_used BOOLEAN DEFAULT FALSE, -- Whether PostgreSQL context was used
    error_occurred BOOLEAN DEFAULT FALSE,
    error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);

-- Function to update session timestamp
CREATE OR REPLACE FUNCTION update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions 
    SET updated_at = CURRENT_TIMESTAMP,
        total_messages = total_messages + 1
    WHERE session_id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update session on new message
DROP TRIGGER IF EXISTS trigger_update_session ON chat_messages;
CREATE TRIGGER trigger_update_session
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_timestamp();

-- Function to get chat history for a session
CREATE OR REPLACE FUNCTION get_chat_history(p_session_id VARCHAR(255), p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    message_id INTEGER,
    created_at TIMESTAMP,
    role VARCHAR(20),
    content TEXT,
    response_time_ms INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.message_id,
        cm.created_at,
        cm.role,
        cm.content,
        cm.response_time_ms
    FROM chat_messages cm
    WHERE cm.session_id = p_session_id
    ORDER BY cm.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get session statistics
CREATE OR REPLACE FUNCTION get_session_stats(p_session_id VARCHAR(255))
RETURNS TABLE (
    session_id VARCHAR(255),
    created_at TIMESTAMP,
    total_messages INTEGER,
    total_tokens INTEGER,
    avg_response_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.session_id,
        cs.created_at,
        cs.total_messages,
        cs.total_tokens,
        COALESCE(AVG(cm.response_time_ms), 0)::NUMERIC as avg_response_time_ms
    FROM chat_sessions cs
    LEFT JOIN chat_messages cm ON cs.session_id = cm.session_id AND cm.role = 'assistant'
    WHERE cs.session_id = p_session_id
    GROUP BY cs.session_id, cs.created_at, cs.total_messages, cs.total_tokens;
END;
$$ LANGUAGE plpgsql;

-- Sample query to get recent sessions
-- SELECT * FROM chat_sessions ORDER BY updated_at DESC LIMIT 10;

-- Sample query to get messages for a session
-- SELECT * FROM get_chat_history('session_123', 50);

-- Sample query to get session statistics
-- SELECT * FROM get_session_stats('session_123');

