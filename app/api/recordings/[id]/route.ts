import { NextRequest, NextResponse } from "next/server"
import { getRecordingById, updateRecording } from "@/lib/recordings-store"

// GET a single recording
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const recording = getRecordingById(id)
  
  if (!recording) {
    return NextResponse.json(
      { error: "Recording not found" },
      { status: 404 }
    )
  }
  
  return NextResponse.json({ recording })
}

// PATCH to update a recording (e.g., after processing)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    const updated = updateRecording(id, body)
    
    if (!updated) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ recording: updated })
  } catch (error) {
    console.error("Error updating recording:", error)
    return NextResponse.json(
      { error: "Failed to update recording" },
      { status: 500 }
    )
  }
}
