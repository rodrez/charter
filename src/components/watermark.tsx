import React from 'react'

interface WatermarkProps {
  text?: string
  color?: string
  opacity?: number
  className?: string
}

export default function Watermark({
  text = 'Watermark',
  color = 'text-gray-400',
  opacity = 0.2,
  className = ''
}: WatermarkProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      <div 
        className={`text-9xl font-bold transform -rotate-45 ${color} select-none ${className}`}
        style={{ opacity }}
      >
        {text}
      </div>
    </div>
  )
}