import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard-content"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Humand Ascend
                </h1>
                <p className="text-sm text-muted-foreground">
                  Backoffice - Panel de Administracion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Hackathon MVP
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-200">
                En vivo
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  )
}
