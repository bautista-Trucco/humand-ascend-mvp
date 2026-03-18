'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionWithUser } from '@/lib/supabase'
import { formatDuration, formatFileSize, formatDate } from '@/lib/utils'
import { Search, Mic, FileText, ChevronDown, ChevronUp } from 'lucide-react'

interface SessionsTableProps {
  sessions: SessionWithUser[]
}

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'secondary' as const, className: 'bg-amber-100 text-amber-800 border-amber-200' },
  processing: { label: 'Procesando', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Completado', variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed: { label: 'Fallido', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' },
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const filteredSessions = sessions.filter((session) => {
    const userName = session.users?.name?.toLowerCase() || ''
    const department = session.users?.department?.toLowerCase() || ''
    const sessionId = session.session_id.toLowerCase()
    const search = searchTerm.toLowerCase()

    return (
      userName.includes(search) ||
      department.includes(search) ||
      sessionId.includes(search)
    )
  })

  const toggleRow = (sessionId: string) => {
    setExpandedRow(expandedRow === sessionId ? null : sessionId)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Sesiones de Grabacion</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="hidden md:table-cell">Area</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Duracion</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron sesiones
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <React.Fragment key={session.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleRow(session.id)}
                  >
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" className="h-6 w-6">
                        {expandedRow === session.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {session.users?.name || 'Usuario anonimo'}
                        </span>
                        <span className="text-xs text-muted-foreground md:hidden">
                          {session.users?.department || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {session.users?.department || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {session.input_type === 'voice' ? (
                          <Mic className="h-4 w-4 text-primary" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="hidden sm:inline text-sm">
                          {session.input_type === 'voice' ? 'Voz' : 'Texto'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDuration(session.duration_seconds)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[session.status].className}>
                        {statusConfig[session.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(session.recorded_at)}
                    </TableCell>
                  </TableRow>
                  {expandedRow === session.id && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={7}>
                        <div className="p-4 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Pregunta</h4>
                              <p className="text-sm text-muted-foreground">
                                {session.question || 'Sin pregunta registrada'}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">ID Sesion:</span>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {session.session_id}
                                </code>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Tamaño:</span>
                                <span className="text-sm text-muted-foreground">
                                  {formatFileSize(session.file_size_bytes)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 sm:hidden">
                                <span className="text-sm font-medium">Duracion:</span>
                                <span className="text-sm text-muted-foreground">
                                  {formatDuration(session.duration_seconds)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {session.transcript && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Transcripcion</h4>
                              <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg border">
                                {session.transcript}
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
