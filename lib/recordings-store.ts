// In-memory store for recordings (MVP - can be replaced with a database later)

export interface Recording {
  id: string
  session_id: string
  user_id: string
  user_name: string
  recorded_at: string
  duration_seconds: number
  file_size_bytes: number
  mime_type: string
  transcript?: string
  skills?: string[]
  status: "pending" | "processing" | "completed"
  created_at: string
}

// In-memory storage
const recordings: Recording[] = []

// Seed with some demo data
const demoRecordings: Recording[] = [
  {
    id: "rec_001",
    session_id: "TP-ABC1234",
    user_id: "usr_001",
    user_name: "Martin Lopez",
    recorded_at: "2026-03-18T08:30:00Z",
    duration_seconds: 145,
    file_size_bytes: 234500,
    mime_type: "audio/webm",
    transcript: "Hoy tuve un problema en la estacion cuando se cayo el sistema de cobro. Habia una fila larga y la gente estaba enojada. Tuve que calmarlos, cobrar en efectivo y coordinar con mi companero para resolver un derrame de aceite al mismo tiempo.",
    skills: ["Manejo de crisis", "Atencion al cliente", "Trabajo en equipo", "Resolucion de problemas"],
    status: "completed",
    created_at: "2026-03-18T08:32:00Z"
  },
  {
    id: "rec_002",
    session_id: "TP-DEF5678",
    user_id: "usr_002",
    user_name: "Ana Garcia",
    recorded_at: "2026-03-18T09:15:00Z",
    duration_seconds: 98,
    file_size_bytes: 156000,
    mime_type: "audio/webm",
    transcript: "En el almacen tuvimos un pedido urgente que nadie sabia como procesar. Yo me tome el tiempo de leer el manual y explicarle al equipo el procedimiento. Al final logramos enviarlo a tiempo.",
    skills: ["Liderazgo", "Comunicacion", "Aprendizaje autonomo", "Trabajo bajo presion"],
    status: "completed",
    created_at: "2026-03-18T09:17:00Z"
  },
  {
    id: "rec_003",
    session_id: "TP-GHI9012",
    user_id: "usr_003",
    user_name: "Carlos Rodriguez",
    recorded_at: "2026-03-18T10:00:00Z",
    duration_seconds: 0,
    file_size_bytes: 450,
    mime_type: "text/plain",
    transcript: "Cuando un cliente se quejaba porque su producto vino defectuoso, en lugar de solo darle el reembolso, le ofreci un descuento extra para su proxima compra. El cliente quedo tan contento que dejo una resena positiva.",
    skills: ["Atencion al cliente", "Negociacion", "Pensamiento creativo", "Fidelizacion"],
    status: "completed",
    created_at: "2026-03-18T10:02:00Z"
  },
  {
    id: "rec_004",
    session_id: "TP-JKL3456",
    user_id: "usr_001",
    user_name: "Martin Lopez",
    recorded_at: "2026-03-17T14:20:00Z",
    duration_seconds: 112,
    file_size_bytes: 178000,
    mime_type: "audio/webm",
    status: "processing",
    created_at: "2026-03-17T14:22:00Z"
  },
  {
    id: "rec_005",
    session_id: "TP-MNO7890",
    user_id: "usr_004",
    user_name: "Laura Martinez",
    recorded_at: "2026-03-17T16:45:00Z",
    duration_seconds: 87,
    file_size_bytes: 142000,
    mime_type: "audio/webm",
    status: "pending",
    created_at: "2026-03-17T16:47:00Z"
  }
]

// Initialize with demo data
recordings.push(...demoRecordings)

export function getAllRecordings(): Recording[] {
  return [...recordings].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getRecordingById(id: string): Recording | undefined {
  return recordings.find(r => r.id === id)
}

export function addRecording(recording: Omit<Recording, "id" | "created_at">): Recording {
  const newRecording: Recording = {
    ...recording,
    id: `rec_${Date.now().toString(36)}`,
    created_at: new Date().toISOString()
  }
  recordings.push(newRecording)
  return newRecording
}

export function updateRecording(id: string, updates: Partial<Recording>): Recording | null {
  const index = recordings.findIndex(r => r.id === id)
  if (index === -1) return null
  recordings[index] = { ...recordings[index], ...updates }
  return recordings[index]
}

export function getStats() {
  const total = recordings.length
  const completed = recordings.filter(r => r.status === "completed").length
  const processing = recordings.filter(r => r.status === "processing").length
  const pending = recordings.filter(r => r.status === "pending").length
  const uniqueUsers = new Set(recordings.map(r => r.user_id)).size
  
  const allSkills = recordings
    .filter(r => r.skills)
    .flatMap(r => r.skills || [])
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }))

  return {
    total,
    completed,
    processing,
    pending,
    uniqueUsers,
    topSkills
  }
}
