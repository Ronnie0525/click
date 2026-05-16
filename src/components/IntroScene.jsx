import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * IntroScene — a 60-segment "line skeleton" that morphs its endpoints
 * through 5 distinct geometric forms as scroll progress goes 0 → 1.
 *
 *   stage 0   "Every brand wants attention"      → short tangent specks
 *   stage 1   "Attention alone is not enough"    → 60 vertical streaks
 *   stage 2   "Strategy turns it into growth"    → network edges
 *   stage 3   "Creativity makes brands ..."      → icosahedron edges
 *   stage 4   "This is Click"                    → radial spokes on the
 *                                                  hero glow disc
 *
 * Each "line" is a thin cylinder mesh whose mid-point, orientation, and
 * length are recomputed per frame from the lerp between two adjacent
 * stages' (from, to) targets. Because the SAME 60 cylinders morph,
 * the user sees actual lines reshape — not a particle cloud arranged
 * in different patterns.
 *
 * A faint ambient particle field drifts behind everything for
 * atmosphere; it doesn't morph.
 */

const ORANGE = '#FF7A00'
const ORANGE_BRIGHT = '#FFD2A0'
const DEEP = '#C93600'

const NUM_LINES = 60
const NUM_STAGES = 5

/* ---------- IntroScene root ---------- */

export default function IntroScene({ progress = 0 }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 7], fov: 55, near: 0.1, far: 100 }}
    >
      <color attach="background" args={['#040404']} />
      <fog attach="fog" args={['#040404', 8, 28]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 4, 6]} color={ORANGE_BRIGHT} intensity={6} distance={20} />
      <pointLight position={[-6, -3, 4]} color={DEEP} intensity={4} distance={20} />

      <CameraRig progress={progress} />
      <AmbientParticles />
      <MorphingLines progress={progress} />
    </Canvas>
  )
}

/* ---------- Camera ---------- */

function CameraRig({ progress }) {
  useFrame((state) => {
    const { camera, mouse } = state
    const stageF = progress * (NUM_STAGES - 1)
    const segT = Math.min(1, Math.max(0, stageF - Math.floor(stageF)))
    let lerp
    if (segT < 0.2) lerp = 0
    else if (segT > 0.8) lerp = 1
    else lerp = 1 - Math.pow(1 - (segT - 0.2) / 0.6, 3)
    const morphActivity = 4 * lerp * (1 - lerp)

    const baseZ = progress < 0.8 ? 7 - progress * 5 : 3 - (progress - 0.8) * 12
    const z = baseZ + morphActivity * 2.0  // pull back during morphs
    camera.position.z += (z - camera.position.z) * 0.12

    const tx = mouse.x * 0.3
    const ty = mouse.y * 0.2
    camera.position.x += (tx - camera.position.x) * 0.04
    camera.position.y += (ty - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ---------- Ambient particle backdrop ---------- */

function makeGlowSprite() {
  if (typeof document === 'undefined') return null
  const size = 64
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 220, 180, 0.9)')
  g.addColorStop(0.4, 'rgba(255, 160, 80, 0.45)')
  g.addColorStop(1, 'rgba(255, 90, 31, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

function AmbientParticles() {
  const ref = useRef()
  const COUNT = 300
  const sprite = useMemo(() => makeGlowSprite(), [])
  const { positions, basePos, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const basePos = new Float32Array(COUNT * 3)
    const phases = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const r = 4 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi) * 0.7 - 2
      positions[i * 3] = x;     basePos[i * 3]     = x
      positions[i * 3 + 1] = y; basePos[i * 3 + 1] = y
      positions[i * 3 + 2] = z; basePos[i * 3 + 2] = z
      phases[i] = Math.random() * Math.PI * 2
    }
    return { positions, basePos, phases }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    const arr = ref.current.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = basePos[i * 3]     + Math.sin(t * 0.22 + phases[i]) * 0.5
      arr[i * 3 + 1] = basePos[i * 3 + 1] + Math.cos(t * 0.27 + phases[i] * 1.3) * 0.45
      arr[i * 3 + 2] = basePos[i * 3 + 2] + Math.sin(t * 0.18 + phases[i] * 0.7) * 0.4
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    const breath = 0.85 + Math.sin(t * 0.9) * 0.15
    ref.current.material.size = 0.22 * breath
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        map={sprite}
        color={ORANGE_BRIGHT}
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ---------- The morphing line skeleton ---------- */

function MorphingLines({ progress }) {
  const groupRef = useRef()
  const meshRefs = useRef([])

  const stages = useMemo(() => [
    generateCloudPairs(NUM_LINES),
    generateStreakPairs(NUM_LINES),
    generateNetworkPairs(NUM_LINES),
    generateSpherePairs(NUM_LINES),
    generateDiscPairs(NUM_LINES),
  ], [])

  // Scratch vectors reused across the per-frame loop to avoid allocations.
  const tmp = useMemo(() => ({
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    mid: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
    quat: new THREE.Quaternion(),
  }), [])

  useFrame(() => {
    if (!groupRef.current) return

    // Hold pattern + cubic ease-out for snappy morphs that settle.
    const stageF = progress * (NUM_STAGES - 1)
    const stageA = Math.min(NUM_STAGES - 2, Math.floor(stageF))
    const stageB = stageA + 1
    const segT = Math.min(1, Math.max(0, stageF - stageA))
    let lerp
    if (segT < 0.2) lerp = 0
    else if (segT > 0.8) lerp = 1
    else lerp = 1 - Math.pow(1 - (segT - 0.2) / 0.6, 3)
    const morphActivity = 4 * lerp * (1 - lerp)
    const a = stages[stageA]
    const b = stages[stageB]

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
      tmp.mid.copy(tmp.from).lerp(tmp.to, 0.5)
      tmp.dir.copy(tmp.to).sub(tmp.from)
      const length = tmp.dir.length() || 0.001
      tmp.dir.divideScalar(length)
      tmp.quat.setFromUnitVectors(tmp.up, tmp.dir)

      const group = meshRefs.current[i]
      if (!group) continue
      group.position.copy(tmp.mid)
      group.quaternion.copy(tmp.quat)
      group.scale.set(1, length, 1)
      const core = group.children[0]
      const halo = group.children[1]
      if (core?.material) core.material.opacity = 1.0 * (1 + morphActivity * 0.3)
      if (halo?.material) halo.material.opacity = 0.35 * (1 + morphActivity * 0.55)
    }

    // Subtle rotation only — full rotation was twisting the streaks
    // sideways so they no longer pointed along the camera axis.
    groupRef.current.rotation.y = progress * Math.PI * 0.35
    groupRef.current.rotation.x = Math.sin(progress * Math.PI) * 0.06

    // Fade away as the intro reveals the hero.
    const fade = progress < 0.92 ? 1 : Math.max(0, 1 - (progress - 0.92) / 0.08)
    groupRef.current.visible = fade > 0
    if (fade < 1) {
      for (let i = 0; i < NUM_LINES; i++) {
        const group = meshRefs.current[i]
        if (!group) continue
        const core = group.children[0]
        const halo = group.children[1]
        if (core?.material) core.material.opacity *= fade
        if (halo?.material) halo.material.opacity *= fade
      }
    }
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: NUM_LINES }, (_, i) => (
        <group key={i} ref={(el) => { meshRefs.current[i] = el }}>
          {/* Bright orange core. Native length 1 along Y — we scale Y to
              the segment's length and rotate so Y points along the
              segment. The group ref carries both the core + halo so
              they transform together. */}
          <mesh>
            <cylinderGeometry args={[0.012, 0.012, 1, 10]} />
            <meshBasicMaterial
              color={ORANGE}
              transparent
              opacity={1.0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Soft halo so each line reads as a glowing beam, not just a
              hairline. Additive on top of the core boosts the brightness
              along the centre while the edges falloff via the wider
              cylinder's lower opacity. */}
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
            <meshBasicMaterial
              color={ORANGE}
              transparent
              opacity={0.35}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------- Stage generators ----------
 * Each returns an array of NUM_LINES { from, to } Vector3 pairs.
 */

function generateCloudPairs(n) {
  // Short tangents scattered through a sphere shell — reads as floating
  // specks / dust at distance.
  const arr = []
  for (let i = 0; i < n; i++) {
    const r = 3 + Math.random() * 5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const cx = r * Math.sin(phi) * Math.cos(theta)
    const cy = r * Math.sin(phi) * Math.sin(theta)
    const cz = r * Math.cos(phi) * 0.7 - 1
    const dirT = Math.random() * Math.PI * 2
    const dirP = Math.acos(2 * Math.random() - 1)
    const half = 0.15
    const dx = half * Math.sin(dirP) * Math.cos(dirT)
    const dy = half * Math.sin(dirP) * Math.sin(dirT)
    const dz = half * Math.cos(dirP)
    arr.push({
      from: new THREE.Vector3(cx - dx, cy - dy, cz - dz),
      to:   new THREE.Vector3(cx + dx, cy + dy, cz + dz),
    })
  }
  return arr
}

function generateStreakPairs(n) {
  // Long lines along the camera-facing axis (z).
  const arr = []
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 12
    const y = (Math.random() - 0.5) * 6
    const len = 8 + Math.random() * 5
    arr.push({
      from: new THREE.Vector3(x, y, -len / 2),
      to:   new THREE.Vector3(x, y, len / 2),
    })
  }
  return arr
}

function generateNetworkPairs(n) {
  // Compact web — fewer nodes, tighter spread, every line connects to a
  // nearest neighbour so the result reads as a connected mesh rather than
  // a scattered pile of edges.
  const NUM_NODES = 18
  const nodes = []
  for (let i = 0; i < NUM_NODES; i++) {
    nodes.push(new THREE.Vector3(
      (Math.random() - 0.5) * 3.6,
      (Math.random() - 0.5) * 2.4,
      (Math.random() - 0.5) * 2.2 - 0.5,
    ))
  }
  const arr = []
  for (let i = 0; i < n; i++) {
    const aIdx = i % NUM_NODES
    const a = nodes[aIdx]
    const candidates = nodes
      .map((p, j) => ({ j, d: a.distanceTo(p) }))
      .filter(({ j }) => j !== aIdx)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)                                  // always one of the 3 nearest
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    arr.push({ from: a.clone(), to: nodes[pick.j].clone() })
  }
  return arr
}

function generateSpherePairs(n) {
  // Edges of an icosahedron (detail=1 has 80 faces; EdgesGeometry returns
  // every triangle edge that survives the angle threshold).
  const geo = new THREE.IcosahedronGeometry(1.85, 1)
  const edges = new THREE.EdgesGeometry(geo, 1)   // 1° threshold → all edges
  const pos = edges.attributes.position.array
  const edgeCount = pos.length / 6
  const arr = []
  for (let i = 0; i < n; i++) {
    const idx = (i * 2654435761) % edgeCount  // hash-spread so all 60 lines pick distinct edges
    const base = idx * 6
    arr.push({
      from: new THREE.Vector3(pos[base],     pos[base + 1], pos[base + 2]),
      to:   new THREE.Vector3(pos[base + 3], pos[base + 4], pos[base + 5]),
    })
  }
  return arr
}

function generateDiscPairs(n) {
  // Sunburst: every line emanates outward from the hero glow anchor
  // (centred at y ≈ -1.6, matching the homepage hero's --my: 65%).
  // Evenly spaced around 360° with a little jitter so it doesn't look
  // mechanically perfect. Inner ends sit just outside the glow's hot
  // centre; outer ends extend into the glow's falloff so the rays
  // appear to dissolve into the orange light.
  const cx = 0
  const cy = -1.6
  const ASPECT_Y = 0.55         // squashed vertically to match the hero glow's elliptical look
  const arr = []
  for (let i = 0; i < n; i++) {
    const baseAngle = (i / n) * Math.PI * 2
    const theta = baseAngle + (Math.random() - 0.5) * 0.1
    const innerR = 0.25 + Math.random() * 0.25
    const outerR = innerR + 0.8 + Math.random() * 0.9
    const dx = Math.cos(theta)
    const dy = Math.sin(theta) * ASPECT_Y
    arr.push({
      from: new THREE.Vector3(cx + dx * innerR, cy + dy * innerR, 0),
      to:   new THREE.Vector3(cx + dx * outerR, cy + dy * outerR, 0),
    })
  }
  return arr
}
