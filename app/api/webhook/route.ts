import { NextResponse } from "next/server"

interface WebhookPayload {
  type: string
  question: string
  timestamp: string
  source: string
  automatic: boolean
}

export async function POST(request: Request) {
  try {
    const body: WebhookPayload = await request.json()

    // Validate required fields
    if (!body.type || !body.question) {
      return NextResponse.json(
        { error: "Missing required fields: type and question are required" },
        { status: 400 }
      )
    }

    // Validate webhook type
    if (body.type !== "reflection_question") {
      return NextResponse.json(
        { error: `Unsupported webhook type: ${body.type}` },
        { status: 400 }
      )
    }

    // Extract the question from the payload
    const question = body.question

    // Log the received webhook for debugging
    console.log("Webhook received:", {
      type: body.type,
      question: question,
      timestamp: body.timestamp,
      source: body.source,
      automatic: body.automatic,
    })

    // Return success with the extracted question and a redirect URL
    const baseUrl = request.headers.get("host") || "localhost:3000"
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const redirectUrl = `${protocol}://${baseUrl}?question=${encodeURIComponent(question)}`

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      data: {
        question: question,
        redirectUrl: redirectUrl,
        receivedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook payload" },
      { status: 500 }
    )
  }
}

// Optional: Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is active",
    supportedTypes: ["reflection_question"],
  })
}
