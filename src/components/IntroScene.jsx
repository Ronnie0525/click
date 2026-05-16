import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * IntroScene — one continuous morph through six visual states. Real
 * post-processing bloom on top, drei <Line> for proper screen-space
 * line thickness, sprite-based particles. Same 800 particles + 60
 * lines persist across the whole intro; only their target positions
 * change with scroll progress.
 *
 *   0%   cloud         — particles only
 *   20%  horizontal    — particles align on x-axis, single bright band
 *   40%  network       — particles cluster, lines connect them
 *   60%  sphere        — Fibonacci shell + icosahedron wireframe
 *   80%  broken        — sphere bursts outward
 *   100% background    — particles spread, line skeleton gone, hero glow
 */

const ORANGE = '#FF7A00'
const ORANGE_BRIGHT = '#FFD2A0'
const DEEP = '#C93600'

const NUM_PARTICLES = 800
const NUM_LINES = 60
const NUM_STAGES = 6

// Per-stage opacity. Particles lead the cloud + background bookends;
// the line skeleton leads the line/network/sphere/broken beats.
const PARTICLE_OPACITY = [1.00, 0.45, 0.35, 0.20, 0.55, 1.00]
const LINE_OPACITY     = [0.00, 1.00, 1.00, 1.00, 0.70, 0.00]

/* ---------- Root ---------- */

export default function IntroScene({ progress = 0 }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 7], fov: 55, near: 0.1, far: 100 }}
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 9, 30]} />
      <ambientLight intensity={0.3} />

      <CameraRig progress={progress} />
      <ParticleField progress={progress} />
      <LineSystem progress={progress} />

      {/* Real bloom on the bright orange pixels — this is what makes the
          particles and lines actually look luminous instead of like dots
          and sticks. */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom
          intensity={1.35}
          luminanceThreshold={0.08}
          luminanceSmoothing={0.8}
          mipmapBlur
          radius={0.75}
        />
      </EffectComposer>
    </Canvas>
  )
}

/* ---------- Shared stage math ----------
 * Hold pattern: first 20% / last 20% of each segment is stationary,
 * middle 60% is the morph with cubic ease-out.
 */
function computeStage(progress) {
  const stageF = progress * (NUM_STAGES - 1)
  const stageA = Math.min(NUM_STAGES - 2, Math.floor(stageF))
  const stageB = stageA + 1
  const segT = Math.min(1, Math.max(0, stageF - stageA))
  let lerp
  if (segT < 0.2) lerp = 0
  else if (segT > 0.8) lerp = 1
  else lerp = 1 - Math.pow(1 - (segT - 0.2) / 0.6, 3)
  const morphActivity = 4 * lerp * (1 - lerp)
  return { stageA, stageB, lerp, morphActivity }
}

const lerpScalar = (a, b, t) => a + (b - a) * t

/* ---------- Camera ---------- */

function CameraRig({ progress }) {
  useFrame((state) => {
    const { camera, mouse } = state
    const { morphActivity } = computeStage(progress)
    // Forward dolly through the story; the camera pulls back when a
    // morph is in flight so the whole transformation is visible.
    const baseZ = 7 - progress * 4.5
    const z = baseZ + morphActivity * 1.6
    camera.position.z += (z - camera.position.z) * 0.1
    camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.04
    camera.position.y += (mouse.y * 0.25 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ---------- Particle field ---------- */

function makeGlowSprite() {
  if (typeof document === 'undefined') return null
  const size = 64
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0,   'rgba(255, 220, 180, 1)')
  g.addColorStop(0.3, 'rgba(255, 150, 70, 0.7)')
  g.addColorStop(0.7, 'rgba(255, 90, 31, 0.18)')
  g.addColorStop(1,   'rgba(255, 90, 31, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

function ParticleField({ progress }) {
  const ref = useRef()
  const sprite = useMemo(() => makeGlowSprite(), [])

  const { positions, stages, phases, nodes } = useMemo(() => {
    const positions = new Float32Array(NUM_PARTICLES * 3)
    const stages = Array.from({ length: NUM_STAGES }, () => new Float32Array(NUM_PARTICLES * 3))
    const phases = new Float32Array(NUM_PARTICLES)
    for (let i = 0; i < NUM_PARTICLES; i++) phases[i] = Math.random() * Math.PI * 2

    // 0 — sphere-shell cloud
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const r = 3 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      stages[0][i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      stages[0][i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      stages[0][i * 3 + 2] = r * Math.cos(phi) * 0.7 - 1
    }
    // 1 — horizontal band along x
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const t = i / (NUM_PARTICLES - 1)
      stages[1][i * 3]     = (t - 0.5) * 12 + (Math.random() - 0.5) * 0.15
      stages[1][i * 3 + 1] = (Math.random() - 0.5) * 0.18
      stages[1][i * 3 + 2] = (Math.random() - 0.5) * 0.35
    }
    // 2 — network nodes (deterministic so the line component aligns)
    const NUM_NODES = 24
    const rng = mulberry32(0xC11C)
    const nodes = []
    for (let n = 0; n < NUM_NODES; n++) {
      nodes.push([
        (rng() - 0.5) * 5,
        (rng() - 0.5) * 3,
        (rng() - 0.5) * 2.4 - 0.5,
      ])
    }
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const n = nodes[i % NUM_NODES]
      stages[2][i * 3]     = n[0] + (Math.random() - 0.5) * 0.5
      stages[2][i * 3 + 1] = n[1] + (Math.random() - 0.5) * 0.5
      stages[2][i * 3 + 2] = n[2] + (Math.random() - 0.5) * 0.5
    }
    // 3 — Fibonacci sphere shell
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const sphereR = 1.85
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const y = 1 - (i / (NUM_PARTICLES - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i
      stages[3][i * 3]     = Math.cos(theta) * radius * sphereR
      stages[3][i * 3 + 1] = y * sphereR
      stages[3][i * 3 + 2] = Math.sin(theta) * radius * sphereR
    }
    // 4 — sphere bursting outward
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const sx = stages[3][i * 3], sy = stages[3][i * 3 + 1], sz = stages[3][i * 3 + 2]
      const k = 2.5 + Math.random() * 0.9
      stages[4][i * 3]     = sx * k
      stages[4][i * 3 + 1] = sy * k
      stages[4][i * 3 + 2] = sz * k
    }
    // 5 — spread background, gentle bias toward the hero glow anchor
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const r = Math.pow(Math.random(), 0.5) * 4.5
      const theta = Math.random() * Math.PI * 2
      stages[5][i * 3]     = Math.cos(theta) * r
      stages[5][i * 3 + 1] = Math.sin(theta) * r * 0.55 - 1.0
      stages[5][i * 3 + 2] = (Math.random() - 0.5) * 1.6
    }

    positions.set(stages[0])
    return { positions, stages, phases, nodes }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    const { stageA, stageB, lerp, morphActivity } = computeStage(progress)
    const a = stages[stageA]
    const b = stages[stageB]
    const arr = ref.current.geometry.attributes.position.array

    // Drift is loudest at rest, quiet during morph so the transformation
    // reads as a deliberate motion not just shimmer.
    const driftAmt = (1 - morphActivity) * 0.22

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const ax = a[i * 3], ay = a[i * 3 + 1], az = a[i * 3 + 2]
      const bx = b[i * 3], by = b[i * 3 + 1], bz = b[i * 3 + 2]
      const ph = phases[i]
      arr[i * 3]     = ax + (bx - ax) * lerp + Math.sin(t * 0.3 + ph) * driftAmt
      arr[i * 3 + 1] = ay + (by - ay) * lerp + Math.cos(t * 0.35 + ph * 1.3) * driftAmt
      arr[i * 3 + 2] = az + (bz - az) * lerp + Math.sin(t * 0.25 + ph * 0.7) * driftAmt
    }
    ref.current.geometry.attributes.position.needsUpdate = true

    const opA = PARTICLE_OPACITY[stageA]
    const opB = PARTICLE_OPACITY[stageB]
    const baseOpacity = lerpScalar(opA, opB, lerp)
    const breath = 0.92 + Math.sin(t * 1.0) * 0.08
    ref.current.material.opacity = baseOpacity * breath * (1 + morphActivity * 0.25)
    ref.current.material.size = 0.32 * (1 + morphActivity * 0.4)
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={NUM_PARTICLES} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.32}
        map={sprite}
        color={ORANGE_BRIGHT}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ---------- Line system ----------
 * 60 drei <Line> components — Line2 internally, so lineWidth is true
 * screen-space pixels (not the 1px WebGL limit). Each line stores its
 * own 5-stage targets and lerps endpoints per frame. Bloom does the
 * heavy lifting on visual luminance.
 */

function LineSystem({ progress }) {
  const groupRef = useRef()
  const lineRefs = useRef([])

  const stages = useMemo(() => [
    generateCloudPairs(NUM_LINES),
    generateHorizontalPairs(NUM_LINES),
    generateNetworkPairs(NUM_LINES),
    generateSpherePairs(NUM_LINES),
    generateBrokenPairs(NUM_LINES),
    generateConvergedPairs(NUM_LINES),
  ], [])

  const tmp = useMemo(() => ({
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
  }), [])

  useFrame(() => {
    if (!groupRef.current) return
    const { stageA, stageB, lerp, morphActivity } = computeStage(progress)
    const a = stages[stageA]
    const b = stages[stageB]
    const opA = LINE_OPACITY[stageA]
    const opB = LINE_OPACITY[stageB]
    const baseOpacity = lerpScalar(opA, opB, lerp)
    const layerOpacity = baseOpacity * (1 + morphActivity * 0.3)

    for (let i = 0; i < NUM_LINES; i++) {
      const af = a[i].from, at_ = a[i].to
      const bf = b[i].from, bt = b[i].to
      tmp.from.set(
        af.x + (bf.x - af.x) * lerp,
        af.y + (bf.y - af.y) * lerp,
        af.z + (bf.z - af.z) * lerp,
      )
      tmp.to.set(
        at_.x + (bt.x - at_.x) * lerp,
        at_.y + (bt.y - at_.y) * lerp,
        at_.z + (bt.z - at_.z) * lerp,
      )
      const line = lineRefs.current[i]
      if (!line) continue
      // Line2 stores positions on the geometry; setPositions takes a flat
      // [x,y,z, x,y,z, ...] array.
      if (line.geometry?.setPositions) {
        line.geometry.setPositions([tmp.from.x, tmp.from.y, tmp.from.z, tmp.to.x, tmp.to.y, tmp.to.z])
      }
      if (line.material) line.material.opacity = layerOpacity
    }
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: NUM_LINES }, (_, i) => (
        <Line
          key={i}
          ref={(el) => { lineRefs.current[i] = el }}
          points={[[0, 0, 0], [0.01, 0, 0]]}
          color={ORANGE}
          lineWidth={2.4}
          transparent
          opacity={0}
        />
      ))}
    </group>
  )
}

/* ---------- Line stage generators ---------- */

function generateCloudPairs(n) {
  const arr = []
  for (let i = 0; i < n; i++) {
    const r = 3 + Math.random() * 5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const cx = r * Math.sin(phi) * Math.cos(theta)
    const cy = r * Math.sin(phi) * Math.sin(theta)
    const cz = r * Math.cos(phi) * 0.7 - 1
    arr.push({
      from: new THREE.Vector3(cx, cy, cz),
      to:   new THREE.Vector3(cx + 0.05, cy, cz),
    })
  }
  return arr
}

function generateHorizontalPairs(n) {
  const SPAN = 12
  const arr = []
  for (let i = 0; i < n; i++) {
    const t = i / n
    const segWidth = (SPAN * 1.1) / n
    const cx = (t - 0.5) * SPAN
    const y = (Math.random() - 0.5) * 0.05
    const z = (Math.random() - 0.5) * 0.15
    arr.push({
      from: new THREE.Vector3(cx - segWidth / 2, y, z),
      to:   new THREE.Vector3(cx + segWidth / 2, y, z),
    })
  }
  return arr
}

function generateNetworkPairs(n) {
  const NUM_NODES = 24
  const rng = mulberry32(0xC11C)
  const nodes = []
  for (let i = 0; i < NUM_NODES; i++) {
    nodes.push(new THREE.Vector3(
      (rng() - 0.5) * 5,
      (rng() - 0.5) * 3,
      (rng() - 0.5) * 2.4 - 0.5,
    ))
  }
  const arr = []
  for (let i = 0; i < n; i++) {
    const aIdx = i % NUM_NODES
    const a = nodes[aIdx]
    const cand = nodes
      .map((p, j) => ({ j, d: a.distanceTo(p) }))
      .filter(({ j }) => j !== aIdx)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
    const pick = cand[Math.floor(Math.random() * cand.length)]
    arr.push({ from: a.clone(), to: nodes[pick.j].clone() })
  }
  return arr
}

function generateSpherePairs(n) {
  const geo = new THREE.IcosahedronGeometry(1.85, 1)
  const edges = new THREE.EdgesGeometry(geo, 1)
  const pos = edges.attributes.position.array
  const edgeCount = pos.length / 6
  const arr = []
  for (let i = 0; i < n; i++) {
    const idx = (i * 2654435761) % edgeCount
    const base = idx * 6
    arr.push({
      from: new THREE.Vector3(pos[base],     pos[base + 1], pos[base + 2]),
      to:   new THREE.Vector3(pos[base + 3], pos[base + 4], pos[base + 5]),
    })
  }
  return arr
}

function generateBrokenPairs(n) {
  return generateSpherePairs(n).map(({ from, to }) => ({
    from: from.clone().multiplyScalar(2.5 + Math.random() * 0.8),
    to:   to.clone().multiplyScalar(2.5 + Math.random() * 0.8),
  }))
}

function generateConvergedPairs(n) {
  // Lines invisible at stage 5; collapse to a point so any residual
  // opacity stays invisible.
  const arr = []
  for (let i = 0; i < n; i++) {
    arr.push({
      from: new THREE.Vector3(0, -1.2, 0),
      to:   new THREE.Vector3(0.001, -1.2, 0),
    })
  }
  return arr
}

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
