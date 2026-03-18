import { NextRequest, NextResponse } from "next/server"
import { getAllRecordings, addRecording, getStats } from "@/lib/recordings-store"

// GET all recordings
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const includeStats = searchParams.get("stats") === "true"
  
  const recordings = getAllRecordings()
  
  if (includeStats) {
    const stats = getStats()
    return NextResponse.json({ recordings, stats })
  }
  
  return NextResponse.json({ recordings })
}

// POST a new recording
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const session_id = formData.get("session_id") as string
    const user_id = formData.get("user_id") as string || `usr_${Date.now().toString(36)}`
    const user_name = formData.get("user_name") as string || "Usuario Anonimo"
    const recorded_at = formData.get("recorded_at") as string
    const duration_seconds = parseInt(formData.get("duration_seconds") as string) || 0
    const file_size_bytes = parseInt(formData.get("file_size_bytes") as string) || 0
    const mime_type = formData.get("mime_type") as string
    const audioFile = formData.get("audio") as File | null
    const textContent = formData.get("text_content") as string | null
    
    if (!session_id || !recorded_at || !mime_type) {
      return NextResponse.json(
        { error: "Missing required fields: session_id, recorded_at, mime_type" },
        { status: 400 }
      )
    }
    
    // For text submissions, store the content directly as transcript
    let transcript: string | undefined
    if (mime_type === "text/plain" && textContent) {
      transcript = textContent
    }
    
    // In a real app, we would:
    // 1. Store the audio file in blob storage
    // 2. Send it to a transcription service (Whisper)
    // 3. Send the transcript to an LLM to extract skills
    
    const recording = addRecording({
      session_id,
      user_id,
      user_name,
      recorded_at,
      duration_seconds,
      file_size_bytes,
      mime_type,
      transcript,
      status: transcript ? "completed" : "pending"
    })
    
    return NextResponse.json({ recording }, { status: 201 })
  } catch (error) {
    console.error("Error creating recording:", error)
    return NextResponse.json(
      { error: "Failed to create recording" },
      { status: 500 }
    )
  }
}
