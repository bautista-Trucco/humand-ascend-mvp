-- Create recordings table to store user responses
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_name TEXT,
  question TEXT NOT NULL,
  response_type TEXT NOT NULL CHECK (response_type IN ('audio', 'text')),
  transcription TEXT,
  text_response TEXT,
  duration_seconds INTEGER DEFAULT 0,
  file_size_bytes INTEGER DEFAULT 0,
  mime_type TEXT,
  audio_url TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_recordings_recorded_at ON recordings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_recordings_session_id ON recordings(session_id);

-- Enable RLS but allow public read for back office (we'll add auth later)
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (for the client app)
CREATE POLICY "Allow public insert" ON recordings
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow anyone to read (for back office - we can restrict later with auth)
CREATE POLICY "Allow public read" ON recordings
  FOR SELECT
  USING (true);
