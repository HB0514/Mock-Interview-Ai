import { useEffect, useRef, useState } from 'react'
import { VideoOff } from 'lucide-react'

export default function UserCamera({ userName }) {
  const videoRef = useRef(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let stream = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setHasCamera(true)
        }
      } catch {
        setError(true)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  if (error || !hasCamera) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-800 rounded-xl gap-3">
        <VideoOff size={40} className="text-slate-600" />
        <p className="text-slate-500 text-sm">Camera unavailable</p>
        <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-glow">
          {userName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <p className="text-slate-400 text-sm font-medium">{userName}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover rounded-xl"
        style={{ transform: 'scaleX(-1)' }} // mirror effect
      />
      {/* Name label */}
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
        <p className="text-white text-sm font-medium">{userName}</p>
      </div>
    </div>
  )
}
