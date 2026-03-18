-- Create users table for employees/workers
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  employee_id TEXT UNIQUE,
  department TEXT,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table for recordings/responses
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  file_size_bytes INTEGER DEFAULT 0,
  mime_type TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('voice', 'text')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  audio_url TEXT,
  transcript TEXT,
  question TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create skills table for extracted skills from AI analysis
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  extracted_from TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_recorded_at ON sessions(recorded_at);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_session_id ON skills(session_id);

-- Insert some sample data for demonstration
INSERT INTO users (name, email, employee_id, department, position) VALUES
  ('Martin Rodriguez', 'martin.rodriguez@example.com', 'EMP-001', 'Operaciones', 'Playero'),
  ('Ana Garcia', 'ana.garcia@example.com', 'EMP-002', 'Ventas', 'Vendedora'),
  ('Carlos Lopez', 'carlos.lopez@example.com', 'EMP-003', 'Logistica', 'Operario de Depósito'),
  ('Maria Fernandez', 'maria.fernandez@example.com', 'EMP-004', 'Atencion al Cliente', 'Cajera'),
  ('Juan Perez', 'juan.perez@example.com', 'EMP-005', 'Mantenimiento', 'Tecnico')
ON CONFLICT (email) DO NOTHING;

-- Insert sample sessions
INSERT INTO sessions (session_id, user_id, recorded_at, duration_seconds, file_size_bytes, mime_type, input_type, status, question, transcript) 
SELECT 
  'TP-' || UPPER(SUBSTRING(md5(random()::text), 1, 7)),
  u.id,
  NOW() - (random() * interval '7 days'),
  FLOOR(random() * 180 + 30)::integer,
  FLOOR(random() * 500000 + 50000)::integer,
  'audio/webm',
  'voice',
  (ARRAY['pending', 'processing', 'completed'])[FLOOR(random() * 3 + 1)],
  'Cuentame sobre un momento en tu trabajo donde resolviste algo dificil. Que hiciste, como lo abordaste y que aprendiste de eso?',
  CASE WHEN random() > 0.5 THEN 'Hubo un dia que se cayo el sistema de cobro y habia una fila enorme de clientes. Tuve que calmarlos, organizar la fila y cobrar en efectivo mientras mi compañero arreglaba el problema. Aprendí que mantener la calma es clave.' ELSE NULL END
FROM users u
LIMIT 5;

-- Insert some sample skills for completed sessions
INSERT INTO skills (session_id, user_id, skill_name, skill_category, confidence_score, extracted_from)
SELECT 
  s.id,
  s.user_id,
  skill_data.skill_name,
  skill_data.skill_category,
  skill_data.confidence,
  'Análisis de transcripción por IA'
FROM sessions s
CROSS JOIN (
  VALUES 
    ('Resolución de conflictos', 'Habilidades Blandas', 0.85),
    ('Trabajo bajo presión', 'Habilidades Blandas', 0.90),
    ('Comunicación con clientes', 'Comunicación', 0.78),
    ('Manejo de efectivo', 'Habilidades Técnicas', 0.82),
    ('Trabajo en equipo', 'Habilidades Blandas', 0.75)
) AS skill_data(skill_name, skill_category, confidence)
WHERE s.status = 'completed'
LIMIT 10;
