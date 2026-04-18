import { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// Head-only morph targets for RPM avatars (standard naming)
const MOUTH_MORPHS = ['mouthOpen', 'viseme_aa', 'viseme_O']

function RPMModel({ url, isTalking }) {
  const group = useRef()
  const { scene } = useGLTF(url)
  const clock = useRef(0)

  // Clone scene to avoid mutation issues
  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true
      }
    })
  }, [scene])

  useFrame((state, delta) => {
    clock.current += delta
    if (!group.current) return

    // Subtle idle breathing
    group.current.position.y = Math.sin(clock.current * 0.8) * 0.008

    // Find head/teeth meshes for lip sync
    scene.traverse((node) => {
      if (!node.isMesh || !node.morphTargetDictionary || !node.morphTargetInfluences) return

      MOUTH_MORPHS.forEach((morphName) => {
        const idx = node.morphTargetDictionary[morphName]
        if (idx === undefined) return

        if (isTalking) {
          // Realistic talking: random mouth movement
          const wave = Math.abs(Math.sin(clock.current * 7 + idx)) * 0.6
          const noise = Math.abs(Math.sin(clock.current * 13 + idx * 2)) * 0.3
          node.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
            node.morphTargetInfluences[idx],
            wave + noise,
            0.25
          )
        } else {
          // Close mouth smoothly
          node.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
            node.morphTargetInfluences[idx],
            0,
            0.15
          )
        }
      })

      // Subtle eye blink
      const blinkIdx = node.morphTargetDictionary['eyeBlinkLeft']
      const blinkIdxR = node.morphTargetDictionary['eyeBlinkRight']
      const blinkCycle = clock.current % 4
      const isBlinking = blinkCycle > 3.8

      if (blinkIdx !== undefined) {
        node.morphTargetInfluences[blinkIdx] = THREE.MathUtils.lerp(
          node.morphTargetInfluences[blinkIdx],
          isBlinking ? 1 : 0,
          0.3
        )
      }
      if (blinkIdxR !== undefined) {
        node.morphTargetInfluences[blinkIdxR] = THREE.MathUtils.lerp(
          node.morphTargetInfluences[blinkIdxR],
          isBlinking ? 1 : 0,
          0.3
        )
      }
    })

    // Subtle head sway when talking
    if (isTalking && group.current) {
      group.current.rotation.y = Math.sin(clock.current * 1.5) * 0.04
      group.current.rotation.z = Math.sin(clock.current * 1.1) * 0.015
    } else if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, 0.05)
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, 0.05)
    }
  })

  return (
    <group ref={group} position={[0, -0.8, 0]}>
      <primitive object={scene} />
    </group>
  )
}

function FallbackAvatar({ isTalking }) {
  const meshRef = useRef()
  const clock = useRef(0)

  useFrame((_, delta) => {
    clock.current += delta
    if (!meshRef.current) return
    meshRef.current.position.y = Math.sin(clock.current * 0.8) * 0.05
    meshRef.current.rotation.y = isTalking ? Math.sin(clock.current * 3) * 0.08 : 0
  })

  return (
    <group ref={meshRef}>
      {/* Head */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Body */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.8, 32]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.3} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.18, 0.56, 0.44]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.18, 0.56, 0.44]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.18, 0.56, 0.5]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[0.18, 0.56, 0.5]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      {/* Mouth - scales when talking */}
      <TalkingMouth isTalking={isTalking} />
    </group>
  )
}

function TalkingMouth({ isTalking }) {
  const ref = useRef()
  const clock = useRef(0)

  useFrame((_, delta) => {
    clock.current += delta
    if (!ref.current) return
    const scale = isTalking ? 0.5 + Math.abs(Math.sin(clock.current * 8)) * 0.5 : 0.15
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, scale, 0.3)
  })

  return (
    <mesh ref={ref} position={[0, 0.3, 0.48]} scale={[1, 0.15, 1]}>
      <sphereGeometry args={[0.12, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshStandardMaterial color="#1e1b4b" />
    </mesh>
  )
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  )
}

export default function Avatar3D({ avatarUrl, isTalking }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 1.8], fov: 35 }}
      shadows
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[2, 3, 2]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-2, 2, 1]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[2, -1, 1]} intensity={0.2} color="#06b6d4" />

      <Suspense fallback={<Loader />}>
        {avatarUrl ? (
          <RPMModel url={avatarUrl} isTalking={isTalking} />
        ) : (
          <FallbackAvatar isTalking={isTalking} />
        )}
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.4}
          scale={3}
          blur={2}
          far={2}
        />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}
