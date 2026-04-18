import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Three.js 패키지 정상 번들링을 위해 optimizeDeps에 명시적으로 포함
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
})
