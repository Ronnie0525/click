import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * IntroScene — the scroll-driven 3D backdrop for the storytelling intro.
 *
 * Five visual beats keyed off a single `progress` value (0..1) coming from
 * the parent scroll listener:
 *   0  drifting orange particles in deep space
 *   1  light trails streaking past the camera (motion of "signals")
 *   2  particles linking into a glowing network
 *   3  a 3D brand mark forming from the network and rotating
 *   4  pull back, soft lens haze, ready for the CTA
 *
 * Each beat fades in/out based on its sub-window of progress and runs its
 * own per-frame animation. The camera slowly dollies forward across the
 * whole intro to give continuity between beats.
 */

const ORANGE = '#FF7A00'
const ORANGE_BRIGHT = '#FFD2A0'
const DEEP = '#C93600'
const TOTAL = 5

function sceneWeight(progress, idx) {
  const start = idx / TOTAL
  const end = (idx + 1) / TOTAL
  const ramp = (end - start) * 0.3
  if (progress < start - ramp * 0.5) return 0
  if (progress > end + ramp * 0.5 && idx !== TOTAL - 1) return 0
  if (idx === TOTAL - 1 && progress >= end) return 1   // pin final scene visible
  if (progress < start + ramp) return Math.max(0, (progress - (start - ramp * 0.5)) / (ramp * 1.5))
  if (progress > end - ramp) return Math.max(0, 1 - (progress - (end - ramp)) / (ramp * 1.5))
  return 1
}

export default function IntroScene({ progress = 0 }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 7], fov: 55, near: 0.1, far: 100 }}
    >
      <color attach="background" args={['#040404']} />
      <fog attach="fog" args={['#040404', 8, 26]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 4, 6]} color={ORANGE_BRIGHT} intensity={6} distance={20} />
      <pointLight position={[-6, -3, 4]} color={DEEP} intensity={4} distance={20} />

      <CameraRig progress={progress} />

      <Scene0 weight={sceneWeight(progress, 0)} progress={progress} />
      <Scene1 weight={sceneWeight(progress, 1)} progress={progress} />
      <Scene2 weight={sceneWeight(progress, 2)} progress={progress} />
      <Scene3 weight={sceneWeight(progress, 3)} progress={progress} />
      <Scene4 weight={sceneWeight(progress, 4)} progress={progress} />
    </Canvas>
  )
}

/* ---------- Camera ---------- */

function CameraRig({ progress }) {
  useFrame((state) => {
    const { camera, mouse } = state
    // Dolly forward through the story, then pull back on the final beat.
    const z = progress < 0.8 ? 7 - progress * 5 : 3 + (progress - 0.8) * 18
    camera.position.z += (z - camera.position.z) * 0.06
    // Subtle parallax from cursor — makes the scene feel "alive" even when static
    const tx = mouse.x * 0.3
    const ty = mouse.y * 0.2
    camera.position.x += (tx - camera.position.x) * 0.04
    camera.position.y += (ty - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ---------- Scene 0: drifting particle cloud ---------- */

function Scene0({ weight, progress }) {
  const ref = useRef()
  const COUNT = 1200
  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const r = 3 + Math.random() * 7
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.7 - 2
      sizes[i] = Math.random() * 0.06 + 0.02
    }
    return { positions, sizes }
  }, [])

  useFrame(() => {
    if (!ref.current) return
    // Rotation bound to global progress so scrolling up rewinds the spin.
    ref.current.rotation.y = progress * Math.PI * 1.8
    ref.current.rotation.x = progress * Math.PI * 0.6
    ref.current.material.opacity = weight * 0.95
  })

  if (weight <= 0.001) return null
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={COUNT} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color={ORANGE}
        transparent
        opacity={weight}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ---------- Scene 1: light trails streaking past ---------- */

function Scene1({ weight, progress }) {
  const groupRef = useRef()
  const COUNT = 60
  const RANGE = 18                          // -10..+8 wrap distance per trail
  const trails = useMemo(() => {
    const arr = []
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 8,
        zBase: Math.random() * RANGE,        // each trail's starting offset along the wrap
        speed: 1.2 + Math.random() * 2.5,    // how much it moves per unit of progress
        len: 0.8 + Math.random() * 2.2,
        hue: Math.random() > 0.5 ? ORANGE : ORANGE_BRIGHT,
      })
    }
    return arr
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((mesh, i) => {
      const t = trails[i]
      // z position is a pure function of progress, so scrolling up reverses the streak.
      const z = ((t.zBase + progress * 30 * t.speed) % RANGE) - 10
      mesh.position.set(t.x, t.y, z)
      mesh.material.opacity = weight * 0.9
    })
  })

  if (weight <= 0.001) return null
  return (
    <group ref={groupRef}>
      {trails.map((t, i) => (
        <mesh key={i} position={[t.x, t.y, t.z]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, t.len, 6]} />
          <meshBasicMaterial
            color={t.hue}
            transparent
            opacity={weight}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ---------- Scene 2: glowing network (nodes + connecting lines) ---------- */

function Scene2({ weight, progress }) {
  const NODES = 28
  const groupRef = useRef()
  const linesRef = useRef()

  const { nodePositions, lineGeometry } = useMemo(() => {
    const nodePositions = []
    for (let i = 0; i < NODES; i++) {
      nodePositions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4 - 1
        )
      )
    }
    // Connect each node to its 2-3 nearest neighbors
    const linePositions = []
    for (let i = 0; i < NODES; i++) {
      const a = nodePositions[i]
      const distances = nodePositions
        .map((p, j) => ({ j, d: a.distanceTo(p) }))
        .filter(({ j }) => j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 3)
      for (const { j } of distances) {
        const b = nodePositions[j]
        linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    return { nodePositions, lineGeometry }
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = progress * Math.PI * 1.4
    groupRef.current.rotation.x = Math.sin(progress * Math.PI * 2) * 0.12
    if (linesRef.current) linesRef.current.material.opacity = weight * 0.5
    groupRef.current.children.forEach((c) => {
      if (c.material && c !== linesRef.current) c.material.opacity = weight * 0.95
    })
  })

  if (weight <= 0.001) return null
  return (
    <group ref={groupRef}>
      {nodePositions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color={ORANGE_BRIGHT} transparent opacity={weight} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color={ORANGE} transparent opacity={weight * 0.5} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}

/* ---------- Scene 3: wireframe icosahedron with orbiting sparks ---------- */

function Scene3({ weight, progress }) {
  const wireRef = useRef()
  const coreRef = useRef()
  const orbitRef = useRef()
  const SPARKS = 240

  const sparkPositions = useMemo(() => {
    const arr = new Float32Array(SPARKS * 3)
    for (let i = 0; i < SPARKS; i++) {
      const r = 1.8 + Math.random() * 1.3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((state) => {
    // Subtle time-based pulse keeps the mark alive even when scroll is still;
    // primary rotations are bound to progress so scroll-up rewinds them.
    const t = state.clock.getElapsedTime()
    const pulse = 1 + Math.sin(t * 2.2) * 0.04
    if (wireRef.current) {
      wireRef.current.rotation.y = progress * Math.PI * 3
      wireRef.current.rotation.x = progress * Math.PI * 1.6
      wireRef.current.material.opacity = weight
      wireRef.current.scale.setScalar(pulse * (0.4 + weight * 0.9))
    }
    if (coreRef.current) {
      coreRef.current.material.opacity = weight * 0.85
      coreRef.current.scale.setScalar(0.3 + Math.sin(t * 3) * 0.04)
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y = -progress * Math.PI * 2.2
      orbitRef.current.rotation.z = progress * Math.PI * 0.4
      orbitRef.current.material.opacity = weight * 0.85
    }
  })

  if (weight <= 0.001) return null
  return (
    <group>
      {/* Bright core glow */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshBasicMaterial color={ORANGE_BRIGHT} transparent opacity={weight * 0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Wireframe icosahedron — the iconic brand mark */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshBasicMaterial color={ORANGE} wireframe transparent opacity={weight} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Orbiting spark field */}
      <points ref={orbitRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={SPARKS} array={sparkPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.045} color={ORANGE_BRIGHT} transparent opacity={weight * 0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}

/* ---------- Scene 4: soft lens flare / haze for the final beat ---------- */

function Scene4({ weight, progress }) {
  const haloRef = useRef()
  const sparksRef = useRef()
  const COUNT = 600
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(Math.random(), 0.6) * 5
      const theta = Math.random() * Math.PI * 2
      arr[i * 3] = Math.cos(theta) * r
      arr[i * 3 + 1] = Math.sin(theta) * r
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    return arr
  }, [])

  useFrame(() => {
    if (haloRef.current) {
      haloRef.current.rotation.z = progress * Math.PI * 0.8
      haloRef.current.material.opacity = weight * 0.55
    }
    if (sparksRef.current) {
      sparksRef.current.rotation.z = -progress * Math.PI * 0.4
      sparksRef.current.material.opacity = weight
    }
  })

  if (weight <= 0.001) return null
  return (
    <group>
      <mesh ref={haloRef} position={[0, 0, -1]}>
        <circleGeometry args={[3.4, 64]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={weight * 0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={ORANGE_BRIGHT} transparent opacity={weight} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}
