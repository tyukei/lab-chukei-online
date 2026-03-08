import { component$ } from '@builder.io/qwik'

export type RocketPhase =
  | 'idle' | 'boarding' | 'launch'
  | 'orbit' | 'reentry' | 'landed' | 'done'

export const ROCKET_FRAMES: Record<string, number> = {
  boarding: 60,
  launch:   180,   // room → space
  orbit:    360,   // one full orbit around Earth (~6s at 60fps)
  reentry:  200,   // space → room
  landed:   80,    // overlay fades out
}

interface RocketProps {
  phase: RocketPhase
  frame: number
  launchStartX: number
  launchStartY: number
  timeOfDay: 'morning' | 'day' | 'evening' | 'night'
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
function easeIn(t: number): number { return t * t * t }
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3) }

// Deterministic stars in space section (top 24% of background strip)
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: Math.abs(Math.sin(i * 127.1 + 1.4)) * 100,
  y: Math.abs(Math.sin(i * 311.7 + 2.8)) * 23,
  s: 1 + Math.round(Math.abs(Math.sin(i * 74.7 + 0.9)) * 1.5),
  o: 0.3 + Math.abs(Math.sin(i * 53.3 + 5.1)) * 0.65,
}))

// ── Earth (shown during orbit + early reentry) ──────────────────────────
const Earth = component$<{ cx: number; cy: number; opacity: number }>(
  ({ cx, cy, opacity }) => {
    const r = 85
    return (
      <div
        style={{
          position: 'absolute',
          left: `${cx - r}px`,
          top:  `${cy - r}px`,
          width:  `${r * 2}px`,
          height: `${r * 2}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, #4a90cc 0%, #1e5090 50%, #0c2040 100%)',
          boxShadow: 'inset -18px -10px 28px rgba(0,0,0,0.55), 0 0 28px rgba(60,120,220,0.25)',
          overflow: 'hidden',
          opacity,
          pointerEvents: 'none',
        }}
      >
        {/* Continents (stylized blobs) */}
        <div style={{ position:'absolute', left:'12%', top:'22%', width:'36%', height:'28%', background:'#3a7030', borderRadius:'40% 60% 55% 45% / 50% 40% 60% 50%', opacity:0.9 }} />
        <div style={{ position:'absolute', left:'50%', top:'28%', width:'28%', height:'22%', background:'#4a7a38', borderRadius:'50% 30% 60% 40% / 40% 60% 40% 60%', opacity:0.85 }} />
        <div style={{ position:'absolute', left:'20%', top:'54%', width:'38%', height:'26%', background:'#3a7030', borderRadius:'40% 60% 45% 55% / 50% 45% 55% 45%', opacity:0.9 }} />
        <div style={{ position:'absolute', left:'58%', top:'52%', width:'22%', height:'20%', background:'#507838', borderRadius:'50%', opacity:0.7 }} />
        {/* Polar caps */}
        <div style={{ position:'absolute', top:0, left:'28%', right:'28%', height:'13%', background:'rgba(230,240,255,0.75)', borderRadius:'0 0 50% 50%' }} />
        <div style={{ position:'absolute', bottom:0, left:'34%', right:'34%', height:'10%', background:'rgba(220,235,255,0.65)', borderRadius:'50% 50% 0 0' }} />
        {/* Atmosphere rim */}
        <div style={{ position:'absolute', inset:'-5px', borderRadius:'50%', border:'5px solid rgba(80,150,230,0.28)', filter:'blur(3px)' }} />
      </div>
    )
  }
)

// ── Rocket body ─────────────────────────────────────────────────────────
const RocketBody = component$<{ scale: number; flameVisible: boolean; rotation: number }>(
  ({ scale, flameVisible, rotation }) => (
    <div
      style={{
        width: '60px', height: '120px',
        position: 'relative',
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
      aria-hidden="true"
    >
      {flameVisible && (
        <div style={{
          position:'absolute', bottom:'-18px', left:'50%',
          transform:'translateX(-50%)',
          width:'24px', height:'30px',
          background:'radial-gradient(ellipse at top, #fff8c0 0%, #ff9900 40%, #ff440080 80%, transparent 100%)',
          borderRadius:'0 0 50% 50%', filter:'blur(2px)',
          animation:'flame-flicker 0.12s ease-in-out infinite alternate',
        }} />
      )}
      {/* Fins */}
      <div style={{ position:'absolute', bottom:'10px', left:'-14px', width:0, height:0, borderTop:'36px solid transparent', borderRight:'18px solid #5a6070', borderBottom:'0 solid transparent' }} />
      <div style={{ position:'absolute', bottom:'10px', right:'-14px', width:0, height:0, borderTop:'36px solid transparent', borderLeft:'18px solid #5a6070', borderBottom:'0 solid transparent' }} />
      {/* Body */}
      <div style={{ position:'absolute', bottom:0, left:'10px', width:'40px', height:'84px', background:'#dcd8d0', borderRadius:'4px 4px 0 0', border:'2px solid #b0a898' }} />
      {/* Nose cone */}
      <div style={{ position:'absolute', top:0, left:'10px', width:'40px', height:'48px', background:'#c84030', clipPath:'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      {/* Window */}
      <div style={{ position:'absolute', top:'52px', left:'20px', width:'20px', height:'20px', borderRadius:'50%', background:'#1c2a3a', border:'2px solid #b0a898' }} />
      {/* Nozzle */}
      <div style={{ position:'absolute', bottom:'-4px', left:'22px', width:'16px', height:'8px', background:'#5a5040', borderRadius:'0 0 4px 4px' }} />
    </div>
  )
)

export const Rocket = component$<RocketProps>(
  ({ phase, frame, launchStartX, launchStartY, timeOfDay }) => {
    if (phase === 'idle' || phase === 'done') return null

    const vw = typeof window !== 'undefined' ? window.innerWidth  : 1200
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800

    // ── Background strip setup ───────────────────────────────────────────
    // Gradient: SPACE at top (0%) → room at bottom (100%)
    // bgTranslateY=-maxPan → room visible   bgTranslateY=0 → space visible
    // During launch:  -maxPan → 0   (room disappears below, space enters from top)
    // During reentry: 0 → -maxPan  (space disappears above, room returns from below)

    const skyColors: Record<string, { hi: string; lo: string }> = {
      morning: { lo: '#c0c8d8', hi: '#6878a0' },
      day:     { lo: '#8aaad0', hi: '#2858a0' },
      evening: { lo: '#b07890', hi: '#504060' },
      night:   { lo: '#303448', hi: '#181820' },
    }
    const sky = skyColors[timeOfDay] ?? skyColors.day
    const stripH  = vh * 4
    const maxPan  = stripH - vh   // 3×vh

    const stripGradient = `linear-gradient(to bottom,
      #010204  0%, #030508 12%, #080c14 24%, #141828 38%,
      ${sky.hi} 52%, ${sky.lo} 70%,
      #a09880 73%, #d0ccc6 76%, #e4e0da 80%, #e8e4de 100%
    )`

    let bgOpacity    = 0
    let bgTranslateY = -maxPan
    let ceilFlash    = 0

    // ── Rocket position/scale/rotation ──────────────────────────────────
    const centerX = vw / 2

    // Orbit / Earth constants (shared between orbit + reentry)
    const earthCX  = vw * 0.5
    const earthCY  = vh * 0.5
    const orbitR   = 130
    // Orbit ends at angle=2π → same as angle=0 → top of Earth
    const reentryStartX   = earthCX                 // sin(0)*orbitR = 0
    const reentryStartY   = earthCY - orbitR        // -cos(0)*orbitR
    const reentryStartRot = 90                      // tangent at top of clockwise orbit

    let screenX = centerX
    let screenY = vh * 0.68
    let scale   = 1
    let rotation = 0
    let flameVisible = false
    let earthOpacity = 0

    if (phase === 'boarding') {
      // ── boarding ──────────────────────────────────────────────────────
      const t = frame / ROCKET_FRAMES.boarding
      bgOpacity    = 0
      bgTranslateY = -maxPan
      screenX      = launchStartX + Math.sin(frame * 1.8) * (t * 3)
      screenY      = launchStartY
      flameVisible = t > 0.7

    } else if (phase === 'launch') {
      // ── launch: rises from room to space ──────────────────────────────
      const t  = frame / ROCKET_FRAMES.launch
      const te = easeInOut(t)
      bgOpacity    = Math.min(1, frame / 12)
      bgTranslateY = -(1 - te) * maxPan          // -maxPan → 0

      // Ceiling-break flash (rocket punches through at ~te≈0.17)
      if (frame >= 22 && frame <= 42) {
        ceilFlash = Math.sin(((frame - 22) / 20) * Math.PI) * 0.88
      }

      screenX      = launchStartX + (centerX - launchStartX) * easeOut(Math.min(1, t * 2))
      screenY      = launchStartY + (-vh * 0.2 - launchStartY) * te
      scale        = 1 - 0.88 * te
      rotation     = 0           // pointing straight up ↑
      flameVisible = true

    } else if (phase === 'orbit') {
      // ── orbit: full lap around Earth ──────────────────────────────────
      const t     = frame / ROCKET_FRAMES.orbit
      const angle = t * Math.PI * 2   // 0→2π clockwise

      bgOpacity    = 1
      bgTranslateY = 0                // space

      screenX = earthCX + Math.sin(angle) * orbitR
      screenY = earthCY - Math.cos(angle) * orbitR
      scale   = 0.10
      // Nose always points in direction of travel (tangent of clockwise circle)
      // velocity = d/dt(sin,−cos) = (cos,sin) → rotation = atan2(Vx,−Vy)
      rotation     = Math.atan2(Math.cos(angle), -Math.sin(angle)) * (180 / Math.PI)
      flameVisible = false
      earthOpacity = 1

    } else if (phase === 'reentry') {
      // ── reentry: space → room, descend to landing pad ─────────────────
      const t  = frame / ROCKET_FRAMES.reentry
      const te = easeInOut(t)

      bgOpacity    = 1
      bgTranslateY = -te * maxPan    // 0 → -maxPan  (space → room)

      // Reverse ceiling flash (just before room appears, late in phase)
      const reverseFrame = frame - (ROCKET_FRAMES.reentry - 50)
      if (reverseFrame >= 0 && reverseFrame <= 25) {
        ceilFlash = Math.sin((reverseFrame / 25) * Math.PI) * 0.6
      }

      // Earth fades out in first third
      earthOpacity = Math.max(0, 1 - t * 3)

      // Rocket: orbit-end position → landing pad
      screenX  = reentryStartX + (launchStartX - reentryStartX) * easeOut(te)
      screenY  = reentryStartY + (launchStartY - reentryStartY) * easeOut(te)
      scale    = 0.10 + (1 - 0.10) * te

      // Rotation: from orbit-tangent (90°) → nose-first toward landing pad
      const dx = launchStartX - reentryStartX
      const dy = launchStartY - reentryStartY
      const targetRot = Math.atan2(dx, -dy) * (180 / Math.PI)
      rotation = reentryStartRot + (targetRot - reentryStartRot) * te

      flameVisible = t > 0.55

    } else if (phase === 'landed') {
      // ── landed: overlay fades, world canvas reappears ─────────────────
      const t  = frame / ROCKET_FRAMES.landed
      bgOpacity    = 1 - easeOut(t)   // 1 → 0
      bgTranslateY = -maxPan          // room position
      scale        = 0                // no overlay rocket (world rocket visible)
    }

    const translateX = screenX - 30
    const translateY = screenY - 60

    return (
      <div
        class="fixed"
        style={{
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 55,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {/* Vertical background strip */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: `${stripH}px`,
            background: stripGradient,
            transform: `translateY(${bgTranslateY}px)`,
            opacity: bgOpacity,
            willChange: 'transform',
          }}
        >
          {STARS.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.s}px`, height: `${s.s}px`,
              borderRadius: '50%',
              background: '#ffffff',
              opacity: s.o,
            }} />
          ))}
        </div>

        {/* Earth (screen-fixed, not in scrolling strip) */}
        {earthOpacity > 0 && (
          <Earth cx={earthCX} cy={earthCY} opacity={earthOpacity} />
        )}

        {/* Ceiling-break flash */}
        {ceilFlash > 0.01 && (
          <div style={{ position:'absolute', inset:0, background:'#f4f0ea', opacity:ceilFlash }} />
        )}

        {/* Rocket body */}
        {scale > 0 && (
          <div style={{ position:'absolute', left:`${translateX}px`, top:`${translateY}px` }}>
            <RocketBody scale={scale} flameVisible={flameVisible} rotation={rotation} />
          </div>
        )}
      </div>
    )
  }
)
