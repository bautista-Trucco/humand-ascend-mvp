"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "./stats-cards"
import { RecordingsTable } from "./recordings-table"
import { TopSkills } from "./top-skills"
import { RefreshCw } from "lucide-react"

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

interface Stats {
  total: number
  completed: number
  processing: number
  pending: number
  uniqueUsers: number
  topSkills: { skill: string; count: number }[]
}

export function DashboardContent() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchData = async () => {
    try {
      const response = await fetch("/api/recordings?stats=true")
      const data = await response.json()
      setRecordings(data.recordings)
      setStats(data.stats)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching recordings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    fetchData()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Grabaciones de Trabajadores
          </h2>
          <p className="text-muted-foreground mt-1">
            Visualiza y gestiona las respuestas recopiladas de los usuarios
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <RecordingsTable recordings={recordings} />
        </div>
        <div className="lg:col-span-1">
          {stats && <TopSkills skills={stats.topSkills} />}
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Ultima actualizacion: {lastUpdate.toLocaleTimeString("es-AR")}
        {" | "}
        Se actualiza automaticamente cada 10 segundos
      </div>
    </div>
  )
}
