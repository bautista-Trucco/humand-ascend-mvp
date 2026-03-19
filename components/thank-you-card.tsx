"use client"

import { Check } from "lucide-react"

export function ThankYouCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      {/* Success Icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
        style={{
          background: 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
          boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(163,177,198,0.2)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <Check 
          className="w-12 h-12 text-emerald-500" 
          strokeWidth={2.5}
          style={{
            filter: 'drop-shadow(1px 1px 1px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 1px rgba(163,177,198,0.4))'
          }}
        />
      </div>

      {/* Thank You Message */}
      <div 
        className="w-full max-w-sm p-8 rounded-3xl text-center"
        style={{
          background: 'linear-gradient(145deg, #e6ebf2, #c1c8d1)',
          boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          Gracias por compartir tu día
        </h2>
        <p className="text-base text-slate-600 leading-relaxed mb-6">
          Tu aporte ha sido registrado. Descansa, recarga energías y nos vemos mañana.
        </p>
        <p className="text-sm text-slate-500 italic">
          Que tengas una excelente tarde.
        </p>
      </div>
    </div>
  )
}
