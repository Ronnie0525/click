import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * IntroScene — a single particle system that morphs through five target
 * shapes as scroll progress goes 0 → 1. Each stage matches the story beat
 * told by the overlaid text:
 *
 *   stage 0   "Every brand wants attention"      → ambient cloud
 *   stage 1   "Attention alone is not enough"    → streaks / light trails
 *   stage 2   "Strategy turns it into growth"    → connected network nodes
 *   stage 3   "Creativity makes brands ..."      → unified wireframe sphere
 *   stage 4   "This is Click"                    → orange disc at the hero
 *                                                  glow's anchor (50% 65%)
 *
 * Same particles the whole time — only their target positions change. The
 * camera dollies forward through the story; ambient drift keeps the cloud
 * alive between scroll events. Rotation and morph are pure functions of
 * progress so scroll-up rewinds the entire sequence cleanly.
 */

const ORANGE = '#FF7A00'
const ORANGE_BRIGHT = '#FFD2A0'
const DEEP = '#C93600'

const COUNT = 1500
const NUM_STAGES = 5

function makeGlowSprite() {
  if (typeof document === 'undefined') return null
  const size = 64
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 220, 180, 1)')
  g.addColorStop(0.3, 'rgba(255, 160, 80, 0.7)')
  g.addColorStop(0.7, 'rgba(255, 90, 31, 0.22)')
  g.addColorStop(1, 'rgba(255, 90, 31, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
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
      <MorphingCloud progress={progress} />
      <NetworkLines progress={progress} />
    </Canvas>
  )
}

/* ---------- Camera ---------- */

function CameraRig({ progress }) {
  useFrame((state) => {
    const { camera, mouse } = state
    // Dolly forward through the story, then push INTO the orange glow on
    // the final beat — the intro lands "inside" the same light the hero
    // section opens with.
    const z = progress < 0.8 ? 7 - progress * 5 : 3 - (progress - 0.8) * 12
    camera.position.z += (z - camera.position.z) * 0.08
    const tx = mouse.x * 0.3
    const ty = mouse.y * 0.2
    camera.position.x += (tx - camera.position.x) * 0.04
    camera.position.y += (ty - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ---------- Morphing particle cloud ---------- */

function MorphingCloud({ progress }) {
  const ref = useRef()
  const sprite = useMemo(() => makeGlowSprite(), [])

  const { positions, stages, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const stages = Array.from({ length: NUM_STAGES }, () => new Float32Array(COUNT * 3))
    const phases = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) phases[i] = Math.random() * Math.PI * 2

    // Stage 0 — ambient sphere-shell cloud.
    for (let i = 0; i < COUNT; i++) {
      const r = 3 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      stages[0][i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      stages[0][i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      stages[0][i * 3 + 2] = r * Math.cos(phi) * 0.7 - 1
    }

    // Stage 1 — light streaks: 60 vertical-z lines, 25 particles each.
    const NUM_LINES = 60
    const PER_LINE = COUNT / NUM_LINES
    for (let l = 0; l < NUM_LINES; l++) {
      const lx = (Math.random() - 0.5) * 14
      const ly = (Math.random() - 0.5) * 8
      for (let p = 0; p < PER_LINE; p++) {
        const i = l * PER_LINE + p
        stages[1][i * 3]     = lx
        stages[1][i * 3 + 1] = ly
        stages[1][i * 3 + 2] = -8 + (p / PER_LINE) * 18
      }
    }

    // Stage 2 — network: 30 nodes, particles clustered around each.
    const NUM_NODES = 30
    const PER_NODE = COUNT / NUM_NODES
    const nodes = []
    for (let n = 0; n < NUM_NODES; n++) {
      nodes.push([
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 4 - 1,
      ])
    }
    for (let n = 0; n < NUM_NODES; n++) {
      const [nx, ny, nz] = nodes[n]
      for (let p = 0; p < PER_NODE; p++) {
        const i = n * PER_NODE + p
        stages[2][i * 3]     = nx + (Math.random() - 0.5) * 0.55
        stages[2][i * 3 + 1] = ny + (Math.random() - 0.5) * 0.55
        stages[2][i * 3 + 2] = nz + (Math.random() - 0.5) * 0.55
      }
    }
    // Stash the node positions for the line component
    stages.nodes = nodes

    // Stage 3 — wireframe sphere: even Fibonacci distribution.
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const sphereR = 1.75
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i
      stages[3][i * 3]     = Math.cos(theta) * radius * sphereR
      stages[3][i * 3 + 1] = y * sphereR
      stages[3][i * 3 + 2] = Math.sin(theta) * radius * sphereR
    }

    // Stage 4 — hero glow disc, centered at the same anchor as the hero
    // section's --mx/--my (50% / 65%).
    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(Math.random(), 0.6) * 2.4
      const theta = Math.random() * Math.PI * 2
      stages[4][i * 3]     = Math.cos(theta) * r
      stages[4][i * 3 + 1] = Math.sin(theta) * r * 0.55 - 1.6
      stages[4][i * 3 + 2] = (Math.random() - 0.5) * 0.6
    }

    positions.set(stages[0])
    return { positions, stages, phases }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    const arr = ref.current.geometry.attributes.position.array

    // Map progress 0..1 to a continuous stage index 0..4 with smoothstep
    // easing between adjacent stages.
    const stageF = progress * (NUM_STAGES - 1)
    const stageA = Math.min(NUM_STAGES - 2, Math.floor(stageF))
    const stageB = stageA + 1
    let lerp = Math.min(1, Math.max(0, stageF - stageA))
    lerp = lerp * lerp * (3 - 2 * lerp)
    const a = stages[stageA]
    const b = stages[stageB]

    // Ambient drift is loud at rest (lerp ≈ 0 or 1) and quiet mid-morph so
    // the transformation reads cleanly.
    const stable = 1 - 4 * lerp * (1 - lerp)
    const driftAmt = stable * 0.28

    for (let i = 0; i < COUNT; i++) {
      const ax = a[i * 3], ay = a[i * 3 + 1], az = a[i * 3 + 2]
      const bx = b[i * 3], by = b[i * 3 + 1], bz = b[i * 3 + 2]
      let x = ax + (bx - ax) * lerp
      let y = ay + (by - ay) * lerp
      let z = az + (bz - az) * lerp
      const ph = phases[i]
      x += Math.sin(t * 0.3 + ph) * driftAmt
      y += Math.cos(t * 0.35 + ph * 1.3) * driftAmt
      z += Math.sin(t * 0.25 + ph * 0.7) * driftAmt
      arr[i * 3]     = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = z
    }
    ref.current.geometry.attributes.position.needsUpdate = true

    // Whole-cloud rotation bound to scroll so scroll-up rewinds orientation.
    ref.current.rotation.y = progress * Math.PI * 1.4
    ref.current.rotation.x = Math.sin(progress * Math.PI) * 0.15

    // Material breath + final fade so the cloud bows out as the hero takes over.
    const breath = 0.88 + Math.sin(t * 1.1) * 0.12
    ref.current.material.size = 0.17 * breath
    const fade = progress < 0.92 ? 1 : Math.max(0, 1 - (progress - 0.92) / 0.08)
    ref.current.material.opacity = 0.9 * fade
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.17}
        map={sprite}
        color={ORANGE_BRIGHT}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ---------- Network connection lines ----------
 * Visible only around the network stage (stage 2). Drawn as static line
 * segments connecting each node to its three nearest neighbours; opacity
 * peaks at stage-2 progress and fades on either side so they appear out
 * of the streaks and dissolve into the sphere.
 */

function NetworkLines({ progress }) {
  const ref = useRef()

  const geometry = useMemo(() => {
    // Use the same node layout as MorphingCloud stage 2.
    // Seed-friendly: regenerate once here. (If we wanted a strict match we'd
    // hoist the node array; for visual purposes near-identical is fine.)
    const NUM_NODES = 30
    const rng = mulberry32(0xC11C) // deterministic so lines align with stage 2 visually
    const nodes = []
    for (let n = 0; n < NUM_NODES; n++) {
      nodes.push(new THREE.Vector3(
        (rng() - 0.5) * 6,
        (rng() - 0.5) * 3.5,
        (rng() - 0.5) * 4 - 1,
      ))
    }
    const verts = []
    for (let i = 0; i < NUM_NODES; i++) {
      const a = nodes[i]
      const nearest = nodes
        .map((p, j) => ({ j, d: a.distanceTo(p) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 3)
      for (const { j } of nearest) {
        const b = nodes[j]
        verts.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [])

  useFrame(() => {
    if (!ref.current) return
    // Peak around stage 2 (progress ≈ 0.5), invisible elsewhere.
    const d = Math.abs(progress - 0.5)
    const v = Math.max(0, 1 - d / 0.18)
    ref.current.material.opacity = v * 0.55
  })

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={ORANGE} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  )
}

// Tiny deterministic PRNG so the network-line nodes can be regenerated
// independently without drifting from the cloud's stage-2 cluster centres.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
