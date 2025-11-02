-- Create chat_messages table for storing chat conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at DESC);

-- Create a function to get chat history for a session
CREATE OR REPLACE FUNCTION get_chat_history(session_id_param VARCHAR)
RETURNS TABLE (
  id INTEGER,
  role VARCHAR,
  content TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.role,
    cm.content,
    cm.created_at
  FROM chat_messages cm
  WHERE cm.session_id = session_id_param
  ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql;

