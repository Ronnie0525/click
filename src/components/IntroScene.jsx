import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * IntroScene — two layered systems, particles and a line skeleton, that
 * take turns being dominant across five distinct visual states:
 *
 *   stage 0  "Every brand wants attention"       → PARTICLES (cloud)
 *   stage 1  "Attention alone is not enough"     → LINES (streaks)
 *   stage 2  "Strategy turns it into growth"     → LINES (sphere)
 *   stage 3  "Creativity makes brands ..."       → LINES (broken / exploding)
 *   stage 4  "This is Click"                     → PARTICLES (hero glow disc)
 *
 * Each system has its own per-stage target positions; per-frame the
 * positions lerp between the two adjacent stages with a hold pattern
 * (20% rest → 60% ease-out → 20% rest) so the form settles long enough
 * to read. Opacity per stage tells you which layer leads the eye.
 */

const ORANGE = '#FF7A00'
const ORANGE_BRIGHT = '#FFD2A0'
const DEEP = '#C93600'

const NUM_PARTICLES = 600
const NUM_LINES = 60
const NUM_STAGES = 5

// Opacity per stage. Particles lead at the start and end; lines lead in
// the middle three beats.
const PARTICLE_OPACITY = [1.00, 0.18, 0.18, 0.45, 1.00]
const LINE_OPACITY     = [0.00, 0.95, 0.95, 0.65, 0.00]

/* ---------- Root ---------- */

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
      <ParticleField progress={progress} />
      <LineSkeleton progress={progress} />
    </Canvas>
  )
}

/* ---------- Shared stage math ----------
 * Returns the two adjacent stage indices and an eased lerp between them.
 * Hold pattern: lerp stays clamped at 0 / 1 for the first / last 20% of
 * each segment so each form rests visibly before launching to the next.
 */
function computeStage(progress) {
  const stageF = progress * (NUM_STAGES - 1)
  const stageA = Math.min(NUM_STAGES - 2, Math.floor(stageF))
  const stageB = stageA + 1
  const segT = Math.min(1, Math.max(0, stageF - stageA))
  let lerp
  if (segT < 0.2) lerp = 0
  else if (segT > 0.8) lerp = 1
  else lerp = 1 - Math.pow(1 - (segT - 0.2) / 0.6, 3)   // ease-out cubic
  const morphActivity = 4 * lerp * (1 - lerp)
  return { stageA, stageB, lerp, morphActivity }
}

function lerpScalar(a, b, t) { return a + (b - a) * t }

/* ---------- Camera ---------- */

function CameraRig({ progress }) {
  useFrame((state) => {
    const { camera, mouse } = state
    const { morphActivity } = computeStage(progress)
    const baseZ = progress < 0.8 ? 7 - progress * 5 : 3 - (progress - 0.8) * 12
    const z = baseZ + morphActivity * 2.0
    camera.position.z += (z - camera.position.z) * 0.12
    camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.04
    camera.position.y += (mouse.y * 0.2 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ---------- Particle field ----------
 * 600 soft-glow particles. Leads stages 0 (cloud) and 4 (hero disc); on
 * stages 1–3 it sits in the background at low opacity. The 5 stage
 * arrays let it interpolate continuously so the particles physically
 * move with the morph instead of just fading.
 */

function makeGlowSprite() {
  if (typeof document === 'undefined') return null
  const size = 64
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 220, 180, 1)')
  g.addColorStop(0.3, 'rgba(255, 160, 80, 0.7)')
  g.addColorStop(0.7, 'rgba(255, 90, 31, 0.2)')
  g.addColorStop(1, 'rgba(255, 90, 31, 0)')
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
  const { positions, stages, phases } = useMemo(() => {
    const positions = new Float32Array(NUM_PARTICLES * 3)
    const stages = Array.from({ length: NUM_STAGES }, () => new Float32Array(NUM_PARTICLES * 3))
    const phases = new Float32Array(NUM_PARTICLES)
    for (let i = 0; i < NUM_PARTICLES; i++) phases[i] = Math.random() * Math.PI * 2

    // Stage 0 — scattered sphere-shell cloud.
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const r = 3 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      stages[0][i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      stages[0][i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      stages[0][i * 3 + 2] = r * Math.cos(phi) * 0.7 - 1
    }
    // Stage 1 — particles align along 60 vertical lines so they read as
    // the "dust" inside the streaks the line skeleton is drawing.
    const NUM_LANES = 60
    const PER_LANE = Math.ceil(NUM_PARTICLES / NUM_LANES)
    for (let l = 0; l < NUM_LANES; l++) {
      const lx = (Math.random() - 0.5) * 12
      const ly = (Math.random() - 0.5) * 6
      for (let p = 0; p < PER_LANE; p++) {
        const i = l * PER_LANE + p
        if (i >= NUM_PARTICLES) break
        stages[1][i * 3]     = lx + (Math.random() - 0.5) * 0.1
        stages[1][i * 3 + 1] = ly + (Math.random() - 0.5) * 0.1
        stages[1][i * 3 + 2] = -8 + Math.random() * 16
      }
    }
    // Stage 2 — Fibonacci-distributed sphere shell so particles sit on
    // the same surface as the icosahedron the line skeleton draws.
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const sphereR = 1.85
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const y = 1 - (i / (NUM_PARTICLES - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i
      stages[2][i * 3]     = Math.cos(theta) * radius * sphereR
      stages[2][i * 3 + 1] = y * sphereR
      stages[2][i * 3 + 2] = Math.sin(theta) * radius * sphereR
    }
    // Stage 3 — broken / exploded: stage-2 positions pushed radially
    // outward by 2-3× so the sphere visibly bursts apart.
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const sx = stages[2][i * 3], sy = stages[2][i * 3 + 1], sz = stages[2][i * 3 + 2]
      const len = Math.sqrt(sx * sx + sy * sy + sz * sz) || 0.001
      const k = 2.4 + Math.random() * 0.8
      stages[3][i * 3]     = (sx / len) * len * k
      stages[3][i * 3 + 1] = (sy / len) * len * k
      stages[3][i * 3 + 2] = (sz / len) * len * k
    }
    // Stage 4 — hero glow disc at the same anchor as the homepage hero
    // backlight (centred at y = -1.6, vertically squashed 0.55).
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const r = Math.pow(Math.random(), 0.55) * 2.4
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
    const { stageA, stageB, lerp, morphActivity } = computeStage(progress)
    const a = stages[stageA]
    const b = stages[stageB]
    const arr = ref.current.geometry.attributes.position.array

    // Drift is loudest at rest, quiet during morph so the form change reads.
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

    // Opacity blends between the per-stage targets — particles dim away
    // when the line skeleton owns the beat and re-emerge for stage 4.
    const opA = PARTICLE_OPACITY[stageA]
    const opB = PARTICLE_OPACITY[stageB]
    const baseOpacity = lerpScalar(opA, opB, lerp)
    const breath = 0.9 + Math.sin(t * 1.0) * 0.1
    ref.current.material.opacity = baseOpacity * breath * (1 + morphActivity * 0.2)

    // Final fade as the seam-glow takes over.
    const fade = progress < 0.93 ? 1 : Math.max(0, 1 - (progress - 0.93) / 0.07)
    if (fade < 1) ref.current.material.opacity *= fade
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={NUM_PARTICLES} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
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

/* ---------- Line skeleton ----------
 * 60 thin orange "beams" (cylinder core + soft halo). Leads stages
 * 1 (streaks), 2 (sphere), 3 (broken). Invisible at stages 0 and 4 so
 * the particle field is the only thing the eye sees on those beats.
 */

function LineSkeleton({ progress }) {
  const groupRef = useRef()
  const meshRefs = useRef([])

  const stages = useMemo(() => [
    generateCloudPairs(NUM_LINES),
    generateStreakPairs(NUM_LINES),
    generateSpherePairs(NUM_LINES),
    generateBrokenPairs(NUM_LINES),
    generateConvergedPairs(NUM_LINES),
  ], [])

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
    const { stageA, stageB, lerp, morphActivity } = computeStage(progress)
    const a = stages[stageA]
    const b = stages[stageB]

    const opA = LINE_OPACITY[stageA]
    const opB = LINE_OPACITY[stageB]
    const baseOpacity = lerpScalar(opA, opB, lerp)
    const fade = progress < 0.93 ? 1 : Math.max(0, 1 - (progress - 0.93) / 0.07)
    const layerOpacity = baseOpacity * fade

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
      if (core?.material) core.material.opacity = layerOpacity * (1 + morphActivity * 0.3)
      if (halo?.material) halo.material.opacity = layerOpacity * 0.4 * (1 + morphActivity * 0.5)
    }

    // Mild rotation only, applied progress > 0.2 so the streak stage isn't
    // twisted off-axis.
    const rotProg = Math.max(0, progress - 0.2) / 0.8
    groupRef.current.rotation.y = rotProg * Math.PI * 0.4
    groupRef.current.rotation.x = Math.sin(rotProg * Math.PI) * 0.08
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: NUM_LINES }, (_, i) => (
        <group key={i} ref={(el) => { meshRefs.current[i] = el }}>
          <mesh>
            <cylinderGeometry args={[0.012, 0.012, 1, 10]} />
            <meshBasicMaterial color={ORANGE} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
            <meshBasicMaterial color={ORANGE} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------- Line stage generators ---------- */

function generateCloudPairs(n) {
  // Tiny tangents (essentially invisible — opacity is 0 in stage 0).
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
      to:   new THREE.Vector3(cx + 0.05, cy + 0.05, cz + 0.05),
    })
  }
  return arr
}

function generateStreakPairs(n) {
  // 60 long lines parallel to the camera z-axis.
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

function generateSpherePairs(n) {
  // Icosahedron edges — clean wireframe sphere look.
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
  // Sphere shattered outward: take sphere edges and push their endpoints
  // radially outward by 2.4–3.2× so the wireframe bursts apart.
  const sphere = generateSpherePairs(n)
  return sphere.map(({ from, to }) => {
    const fLen = from.length() || 0.001
    const tLen = to.length() || 0.001
    const kF = 2.4 + Math.random() * 0.8
    const kT = 2.4 + Math.random() * 0.8
    return {
      from: from.clone().multiplyScalar(kF),
      to:   to.clone().multiplyScalar(kT),
    }
  })
}

function generateConvergedPairs(n) {
  // Stage 4 placeholder — lines are invisible here (opacity 0) and the
  // particle field owns the beat. Collapse them to tiny segments at the
  // hero anchor so any lingering opacity is invisible too.
  const arr = []
  for (let i = 0; i < n; i++) {
    arr.push({
      from: new THREE.Vector3(0, -1.6, 0),
      to:   new THREE.Vector3(0.001, -1.6, 0),
    })
  }
  return arr
}
