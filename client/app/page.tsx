"use client"

import { useState, useEffect } from "react"
import { Mic, Square, RotateCcw, PenLine, Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AudioWaveform } from "@/components/audio-waveform"
import { SessionCard } from "@/components/session-card"
import { useAudioRecorder, type RecordingPayload } from "@/hooks/use-audio-recorder"

type Screen = "recording" | "writing"
type InputMode = "voice" | "text"
type RecordingPhase = "question" | "transitioning" | "recorder" | "review"

export default function TalentPulse() {
  const [screen, setScreen] = useState<Screen>("recording")
  const [isTransitioningScreen, setIsTransitioningScreen] = useState(false)
  const [payload, setPayload] = useState<RecordingPayload | null>(null)
  const [textResponse, setTextResponse] = useState("")
  const [inputMode, setInputMode] = useState<InputMode>("voice")
  const [recordingPhase, setRecordingPhase] = useState<RecordingPhase>("question")
  const [showContinueHint, setShowContinueHint] = useState(false)
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const { isRecording, analyser, startRecording, stopRecording, error } = useAudioRecorder()

  // Show "Pulsa para continuar" after 4 seconds
  useEffect(() => {
    if (screen === "recording" && recordingPhase === "question") {
      const timer = setTimeout(() => {
        setShowContinueHint(true)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [screen, recordingPhase])

  const handleContinueClick = () => {
    if (recordingPhase !== "question") return
    setRecordingPhase("transitioning")
    setShowContinueHint(false)
    // After fade out (500ms), show recorder
    setTimeout(() => {
      setRecordingPhase("recorder")
    }, 500)
  }

  const handleScreenChange = (newScreen: Screen) => {
    setIsTransitioningScreen(true)
    setTimeout(() => {
      setScreen(newScreen)
      setIsTransitioningScreen(false)
    }, 300) // 300ms fade out
  }

  const handleMicClick = async () => {
    // Animate button press
    setIsButtonPressed(true)
    
    // Wait for press animation
    await new Promise(resolve => setTimeout(resolve, 150))
    
    if (isRecording) {
      const result = await stopRecording()
      setIsButtonPressed(false)
      if (result) {
        setPayload(result)
        setRecordingPhase("review")
      }
    } else {
      await startRecording()
      setIsButtonPressed(false)
    }
  }

  const handleNewSession = () => {
    handleScreenChange("recording")
    setTimeout(() => {
      setPayload(null)
      setTextResponse("")
      setInputMode("voice")
      setRecordingPhase("question")
      setShowContinueHint(false)
    }, 300)
  }

  const submitHardcodedRecording = async () => {
    try {
      const response = await fetch("/api/recordings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_identifier: "user_123",
          transcription: "Texto transcrito del audio...",
          duration_seconds: 45,
          language: "es"
        }),
      });
      const data = await response.json();
      console.log("Upload success:", data);
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  const handleTextSubmit = async () => {
    if (!textResponse.trim()) return
    
    const textPayload: RecordingPayload = {
      session_id: `TP-${Date.now().toString(36).toUpperCase()}`,
      recorded_at: new Date().toISOString(),
      duration_seconds: 0,
      file_size_bytes: new Blob([textResponse]).size,
      mime_type: "text/plain",
      blob: new Blob([textResponse], { type: "text/plain" }),
    }
    
    setPayload(textPayload)
    setInputMode("text")
    console.log("Subiendo texto...", textPayload)
    await submitHardcodedRecording()
  }

  return (
    <main className="min-h-screen bg-[#e0e5ec] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className={`w-full max-w-lg relative z-10 transition-opacity duration-300 ease-in-out ${isTransitioningScreen ? 'opacity-0' : 'opacity-100'}`}>


        {screen === "recording" ? (
          <div className="relative min-h-[400px] flex items-center justify-center">
            {/* Question Phase */}
            {recordingPhase !== "recorder" && (
              <div
                onClick={handleContinueClick}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out cursor-pointer ${
                  recordingPhase === "question"
                    ? "opacity-100 animate-in fade-in duration-[3000ms]"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="text-center px-4">
                  <p className="text-xl leading-relaxed text-balance text-primary">
                    Cuentame sobre un momento en tu trabajo donde resolviste algo dificil.
                    Que hiciste, como lo abordaste y que aprendiste de eso?
                  </p>
                </div>
                <div
                  className={`mt-16 transition-opacity duration-1000 ease-in-out ${
                    showContinueHint ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <button
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium text-primary transition-transform duration-200 active:scale-95 animate-pulse"
                    style={{
                      background: 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
                      boxShadow: '6px 6px 15px rgba(163,177,198,0.6), -6px -6px 15px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px rgba(163,177,198,0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      animationDuration: '3s'
                    }}
                  >
                    Continuar
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Recorder Phase */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
                recordingPhase === "recorder" || recordingPhase === "review"
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Waveform - fixed height */}
              <div className="h-16 flex items-center justify-center mb-8">
                <AudioWaveform isRecording={isRecording} analyser={analyser} />
              </div>

              {/* Mic Button Container */}
              <div className="flex justify-center relative">
                {/* Main Mic Button - Skeuomorphic Style with Press Effect */}
                <button
                  onClick={handleMicClick}
                  disabled={isButtonPressed || recordingPhase === "review"}
                  className="w-40 h-40 rounded-full flex items-center justify-center relative z-10"
                  style={{
                    background: isRecording 
                      ? 'linear-gradient(145deg, #ff6b6b, #ee5a5a)'
                      : recordingPhase === "review"
                        ? 'linear-gradient(145deg, #e6ebf2, #c1c8d1)'
                        : 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
                    boxShadow: isButtonPressed
                      ? isRecording
                        ? 'inset 6px 6px 12px rgba(150, 30, 30, 0.4), inset -6px -6px 12px rgba(255, 150, 150, 0.3)'
                        : 'inset 6px 6px 12px rgba(163,177,198,0.6), inset -6px -6px 12px rgba(255, 255, 255, 0.8)'
                      : isRecording
                        ? '6px 6px 16px rgba(200, 80, 80, 0.4), -6px -6px 16px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.1)'
                        : recordingPhase === "review"
                          ? 'inset 4px 4px 8px rgba(163,177,198,0.5), inset -4px -4px 8px rgba(255,255,255,0.8)'
                          : '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(163,177,198,0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    transform: isButtonPressed ? 'scale(0.95)' : 'scale(1)',
                    opacity: recordingPhase === "review" ? 0.6 : 1,
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <div 
                    className="flex items-center justify-center"
                    style={{
                      transform: isButtonPressed ? 'scale(0.9)' : 'scale(1)',
                      transition: 'transform 0.15s ease-in-out',
                    }}
                  >
                    {isRecording ? (
                      <Square 
                        className="w-12 h-12 text-white" 
                        fill="currentColor"
                        style={{
                          filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.2))'
                        }}
                      />
                    ) : (
                      <Mic 
                        className={`w-14 h-14 transition-colors duration-300 ${recordingPhase === "review" ? "text-slate-400" : "text-primary"}`} 
                        strokeWidth={2.5}
                        style={{
                          filter: 'drop-shadow(1px 1px 1px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 1px rgba(163,177,198,0.4))'
                        }}
                      />
                    )}
                  </div>
                  <span className="sr-only">
                    {isRecording ? "Detener grabacion" : "Iniciar grabacion"}
                  </span>
                </button>

                {/* Reset Option - Small satellite button (Left) */}
                <button
                  onClick={() => {
                    setPayload(null)
                    setRecordingPhase("recorder")
                  }}
                  disabled={recordingPhase !== "review"}
                  className={`absolute -bottom-6 -left-12 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-out z-20 ${
                    recordingPhase !== "review" 
                      ? "opacity-50 cursor-not-allowed scale-95" 
                      : "opacity-100 scale-100 hover:scale-105 active:scale-95"
                  }`}
                  style={{
                    background: 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
                    boxShadow: recordingPhase !== "review"
                      ? 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)'
                      : '4px 4px 10px rgba(163,177,198,0.6), -4px -4px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px rgba(163,177,198,0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                  title="Volver a grabar"
                >
                  <RotateCcw 
                    className={`w-5 h-5 transition-colors duration-300 ${recordingPhase !== "review" ? "text-slate-400" : "text-slate-700"}`} 
                    strokeWidth={2.5}
                    style={{
                      filter: recordingPhase !== "review"
                        ? 'none'
                        : 'drop-shadow(1px 1px 1px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 1px rgba(163,177,198,0.4))'
                    }}
                  />
                  <span className="sr-only">Volver a grabar</span>
                </button>

                {/* Write Option - Small satellite button (Right) */}
                <button
                  onClick={() => handleScreenChange("writing")}
                  disabled={isRecording || recordingPhase === "review"}
                  className={`absolute -bottom-6 -right-12 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-out z-20 ${
                    isRecording || recordingPhase === "review" 
                      ? "opacity-50 cursor-not-allowed scale-95" 
                      : "opacity-100 scale-100 hover:scale-105 active:scale-95"
                  }`}
                  style={{
                    background: 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
                    boxShadow: isRecording || recordingPhase === "review"
                      ? 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)'
                      : '4px 4px 10px rgba(163,177,198,0.6), -4px -4px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px rgba(163,177,198,0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                  title="Prefiero escribir"
                >
                  <PenLine 
                    className={`w-5 h-5 transition-colors duration-300 ${isRecording || recordingPhase === "review" ? "text-slate-400" : "text-primary"}`} 
                    strokeWidth={2.5}
                    style={{
                      filter: isRecording || recordingPhase === "review"
                        ? 'none'
                        : 'drop-shadow(1px 1px 1px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 1px rgba(163,177,198,0.4))'
                    }}
                  />
                  <span className="sr-only">Prefiero escribir</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="grid mt-12 px-4 max-w-sm mx-auto w-full">
                <p 
                  className={`col-start-1 row-start-1 text-center text-sm italic text-muted-foreground transition-opacity duration-500 ${
                    recordingPhase === "review" ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  Cuentame sobre un momento en tu trabajo donde resolviste algo dificil. Que hiciste, como lo abordaste y que aprendiste de eso?
                </p>
                <p 
                  className={`col-start-1 row-start-1 text-center text-sm text-muted-foreground transition-opacity duration-1000 ${
                    recordingPhase === "review" ? "opacity-100 delay-[600ms]" : "opacity-0 pointer-events-none"
                  }`}
                >
                  El resumen de tu día está listo para enviarse. Registrar tus logros nos ayuda a reconocer tu esfuerzo y potenciar tu crecimiento.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center mt-14 relative w-full h-24">
                {/* Upload Option */}
                <button
                  onClick={async () => {
                    console.log("Subiendo audio...", payload)
                    await submitHardcodedRecording()
                  }}
                  disabled={recordingPhase !== "review"}
                  className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ease-out ${
                    recordingPhase !== "review"
                      ? "opacity-50 cursor-not-allowed scale-95"
                      : "opacity-100 scale-100 hover:scale-105 active:scale-95"
                  }`}
                  style={{
                    background: 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
                    boxShadow: recordingPhase !== "review"
                      ? 'inset 4px 4px 8px rgba(163,177,198,0.5), inset -4px -4px 8px rgba(255,255,255,0.8)'
                      : '8px 8px 20px rgba(163,177,198,0.6), -8px -8px 20px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(163,177,198,0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <Send 
                    className={`w-10 h-10 transition-colors duration-300 ${recordingPhase !== "review" ? "text-slate-400" : "text-primary"}`} 
                    strokeWidth={2}
                    style={{
                      filter: recordingPhase !== "review"
                        ? 'none'
                        : 'drop-shadow(1px 1px 1px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 1px rgba(163,177,198,0.4))'
                    }}
                  />
                  <span className="sr-only">Subir grabación</span>
                </button>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-center text-sm text-destructive mt-4">{error}</p>
              )}
            </div>
          </div>
        ) : screen === "writing" ? (
          <div className="space-y-8">
            {/* Back button */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleScreenChange("recording")}
                className="gap-2 text-slate-500 hover:text-slate-700 -ml-2"
              >
                <ArrowLeft 
                  className="w-4 h-4" 
                  strokeWidth={2.5}
                  style={{
                    filter: 'drop-shadow(1px 1px 1px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 1px rgba(163,177,198,0.3))'
                  }}
                />
                Volver
              </Button>
            </div>

            {/* Question Card */}
            <div 
              className="mx-2 p-6 rounded-3xl"
              style={{
                background: 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
                boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <p className="text-base text-center font-medium leading-relaxed text-slate-700">
                Cuéntame sobre un momento en tu trabajo donde resolviste algo difícil. 
                <span className="block mt-2 text-sm font-normal text-slate-500 italic">
                  ¿Qué hiciste, cómo lo abordaste y qué aprendiste de eso?
                </span>
              </p>
            </div>

            {/* Text Input */}
            <div className="space-y-4 px-2">
              <div 
                className="relative rounded-3xl overflow-hidden transition-all duration-300"
                style={{
                  background: '#e0e5ec',
                  boxShadow: 'inset 6px 6px 12px rgba(163,177,198,0.6), inset -6px -6px 12px rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Describe cómo fue tu jornada aquí..."
                  className="min-h-[220px] w-full bg-transparent border-none text-slate-700 placeholder:text-slate-400 resize-none focus-visible:ring-0 p-6 text-base leading-relaxed"
                />
              </div>
              <p className="text-xs font-medium text-slate-400 text-right px-4">
                {textResponse.length} caracteres
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleTextSubmit}
                disabled={!textResponse.trim()}
                className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 ease-out ${
                  !textResponse.trim() 
                    ? "text-muted-foreground/50 cursor-not-allowed" 
                    : "text-primary active:scale-95 hover:shadow-md"
                }`}
                style={{
                  background: 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
                  boxShadow: !textResponse.trim()
                    ? 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)'
                    : '6px 6px 15px rgba(163,177,198,0.6), -6px -6px 15px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(163,177,198,0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <Send 
                  className={`w-4 h-4 transition-all duration-300 ${!textResponse.trim() ? "opacity-50" : "opacity-100"}`} 
                  strokeWidth={2.5}
                  style={{
                    filter: !textResponse.trim() 
                      ? 'none' 
                      : 'drop-shadow(1px 1px 1px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 1px rgba(163,177,198,0.4))'
                  }}
                />
                Enviar respuesta
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
