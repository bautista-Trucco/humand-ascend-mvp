"use client"

import { Users, Mic, Clock, CheckCircle } from "lucide-react"

interface Stats {
  total: number
  completed: number
  processing: number
  pending: number
  uniqueUsers: number
  topSkills: { skill: string; count: number }[]
}

interface StatsCardsProps {
  stats: Stats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Grabaciones",
      value: stats.total,
      icon: Mic,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Usuarios Unicos",
      value: stats.uniqueUsers,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Completadas",
      value: stats.completed,
      icon: CheckCircle,
      color: "bg-green-500/10 text-green-600"
    },
    {
      title: "En Proceso",
      value: stats.processing + stats.pending,
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600"
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{card.title}</span>
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-semibold text-foreground">
            {card.value}
          </span>
        </div>
      ))}
    </div>
  )
}
