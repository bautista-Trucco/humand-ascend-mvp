"use client"

import { Award } from "lucide-react"

interface TopSkillsProps {
  skills: { skill: string; count: number }[]
}

export function TopSkills({ skills }: TopSkillsProps) {
  if (skills.length === 0) {
    return null
  }

  const maxCount = Math.max(...skills.map(s => s.count))

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Top Skills Detectados</h3>
      </div>
      <div className="space-y-3">
        {skills.map((item, index) => (
          <div key={item.skill} className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-6">
              {index + 1}.
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {item.skill}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.count} {item.count === 1 ? "vez" : "veces"}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
