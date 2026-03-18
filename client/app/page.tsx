"use client"

import { useState, useEffect } from "react"
import { Mic, Square, RotateCcw, PenLine, Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AudioWaveform } from "@/components/audio-waveform"
import { SessionCard } from "@/components/session-card"
import { useAudioRecorder, type RecordingPayload } from "@/hooks/use-audio-recorder"

type Screen = "recording" | "writing" | "confirmation"
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

  const handleTextSubmit = () => {
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
    handleScreenChange("confirmation")
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans">
      <div className={`w-full max-w-lg transition-opacity duration-300 ease-in-out ${isTransitioningScreen ? 'opacity-0' : 'opacity-100'}`}>


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
                  className={`mt-12 transition-opacity duration-1000 ease-in-out ${
                    showContinueHint ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <p
                    className="text-lg font-medium text-muted-foreground animate-pulse"
                    style={{ animationDuration: '3s' }}
                  >
                    Pulsa para continuar
                  </p>
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
                        ? 'linear-gradient(145deg, #f5f5f5, #e0e0e0)'
                        : 'linear-gradient(145deg, #ffffff, #e6e6e6)',
                    boxShadow: isButtonPressed
                      ? isRecording
                        ? 'inset 6px 6px 12px rgba(150, 30, 30, 0.4), inset -6px -6px 12px rgba(255, 150, 150, 0.3)'
                        : 'inset 6px 6px 12px rgba(0, 0, 0, 0.2), inset -6px -6px 12px rgba(255, 255, 255, 0.5)'
                      : isRecording
                        ? '6px 6px 16px rgba(200, 80, 80, 0.4), -6px -6px 16px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.1)'
                        : recordingPhase === "review"
                          ? 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)'
                          : '8px 8px 20px rgba(0, 0, 0, 0.15), -8px -8px 20px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
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
                      <Square className="w-12 h-12 text-white drop-shadow-sm" />
                    ) : (
                      <Mic className="w-14 h-14 drop-shadow-sm text-primary" />
                    )}
                  </div>
                  <span className="sr-only">
                    {isRecording ? "Detener grabacion" : "Iniciar grabacion"}
                  </span>
                </button>

                {/* Write Option - Small satellite button */}
                <button
                  onClick={() => handleScreenChange("writing")}
                  className={`absolute -bottom-6 -right-12 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-out active:scale-95 z-20 ${
                    isRecording || recordingPhase === "review" ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100 hover:scale-105"
                  }`}
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
                    boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1), -4px -4px 10px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                  }}
                  title="Prefiero escribir"
                >
                  <PenLine className="w-5 h-5 text-primary drop-shadow-sm" />
                  <span className="sr-only">Prefiero escribir</span>
                </button>
              </div>

              {/* Instructions - fixed height */}
              <p className="text-center text-sm italic text-muted-foreground mt-8 h-10 transition-opacity duration-300 px-4 max-w-sm mx-auto">
                {recordingPhase === "review"
                  ? "Grabacion lista"
                  : "Cuentame sobre un momento en tu trabajo donde resolviste algo dificil. Que hiciste, como lo abordaste y que aprendiste de eso?"}
              </p>

              {/* Actions - fixed height container to prevent layout shift */}
              <div className="h-14 flex items-center justify-center mt-4 relative w-full">
                {/* Upload Option */}
                <button
                  onClick={() => handleScreenChange("confirmation")}
                  className={`absolute flex items-center justify-center gap-3 px-10 py-4 rounded-full font-medium text-lg text-primary transition-all duration-700 ease-out active:scale-95 ${
                    recordingPhase === "review" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
                    boxShadow: '8px 8px 20px rgba(0, 0, 0, 0.15), -8px -8px 20px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <Send className="w-5 h-5 drop-shadow-sm" />
                  Subir grabación
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
                className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </div>

            {/* Question */}
            <div className="text-center px-4">
              <p className="text-lg leading-relaxed text-balance text-primary">
                Cuentame sobre un momento en tu trabajo donde resolviste algo dificil.
                Que hiciste, como lo abordaste y que aprendiste de eso?
              </p>
            </div>

            {/* Text Input */}
            <div className="space-y-4">
              <Textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder="Escribe tu respuesta aqui..."
                className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {textResponse.length} caracteres
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleTextSubmit}
                disabled={!textResponse.trim()}
                className="gap-2 px-8"
              >
                <Send className="w-4 h-4" />
                Enviar respuesta
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success message */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {inputMode === "text" ? "Respuesta enviada" : "Grabacion completada"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tu respuesta ha sido registrada
              </p>
            </div>

            {/* Session Card */}
            {payload && (
              <div className="flex justify-center">
                <SessionCard
                  payload={{
                    session_id: payload.session_id,
                    recorded_at: payload.recorded_at,
                    duration_seconds: payload.duration_seconds,
                    file_size_bytes: payload.file_size_bytes,
                    mime_type: payload.mime_type,
                  }}
                />
              </div>
            )}

            {/* New session button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleNewSession}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Nueva sesion
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
