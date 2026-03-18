"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Play, FileText, ChevronDown, ChevronUp, Clock, CheckCircle, Loader2 } from "lucide-react"
import { formatBytes, formatDuration } from "@/lib/utils"

interface Recording {
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

interface RecordingsTableProps {
  recordings: Recording[]
}

function StatusBadge({ status }: { status: Recording["status"] }) {
  const config = {
    pending: {
      label: "Pendiente",
      icon: Clock,
      className: "bg-amber-500/10 text-amber-600 border-amber-200"
    },
    processing: {
      label: "Procesando",
      icon: Loader2,
      className: "bg-blue-500/10 text-blue-600 border-blue-200"
    },
    completed: {
      label: "Completado",
      icon: CheckCircle,
      className: "bg-green-500/10 text-green-600 border-green-200"
    }
  }

  const { label, icon: Icon, className } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className={`w-3 h-3 ${status === "processing" ? "animate-spin" : ""}`} />
      {label}
    </span>
  )
}

function SkillBadge({ skill }: { skill: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
      {skill}
    </span>
  )
}

export function RecordingsTable({ recordings }: RecordingsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  if (recordings.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground">Cargando grabaciones...</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                Usuario
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                Session ID
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                Tipo
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                Duracion
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                Fecha
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                Estado
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                Detalles
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recordings.map((recording) => (
              <>
                <tr 
                  key={recording.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {recording.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {recording.user_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                      {recording.session_id}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {recording.mime_type.startsWith("audio") ? (
                        <>
                          <Play className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Audio</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Texto</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">
                      {formatDuration(recording.duration_seconds)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({formatBytes(recording.file_size_bytes)})
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">
                        {format(new Date(recording.recorded_at), "d MMM yyyy", { locale: es })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(recording.recorded_at), "HH:mm", { locale: es })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={recording.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRow(recording.id)}
                      className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      {expandedRow === recording.id ? (
                        <>
                          Ocultar
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Ver mas
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRow === recording.id && (
                  <tr key={`${recording.id}-expanded`} className="bg-secondary/20">
                    <td colSpan={7} className="px-6 py-6">
                      <div className="space-y-4">
                        {recording.transcript && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Transcripcion
                            </h4>
                            <p className="text-sm text-muted-foreground bg-background p-4 rounded-lg border border-border">
                              {recording.transcript}
                            </p>
                          </div>
                        )}
                        {recording.skills && recording.skills.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Skills Detectados
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {recording.skills.map((skill) => (
                                <SkillBadge key={skill} skill={skill} />
                              ))}
                            </div>
                          </div>
                        )}
                        {!recording.transcript && !recording.skills && (
                          <p className="text-sm text-muted-foreground italic">
                            Esta grabacion aun no ha sido procesada. Los skills seran detectados automaticamente cuando se complete el procesamiento.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
