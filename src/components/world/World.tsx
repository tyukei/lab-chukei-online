import { component$, useStore, useVisibleTask$, useTask$ } from '@builder.io/qwik'
import { Outside } from './Outside'
import { Inside } from './Inside'
import { Avatar } from './Avatar'
import { Rocket, type RocketPhase, ROCKET_FRAMES } from './Rocket'
import { ZonePanel } from '../panels/ZonePanel'
import { ZONES, WORLD_WIDTH, INSIDE_START, AVATAR_SPEED, AVATAR_START_X } from '../../content/zones'
import { SITE } from '../../content/site'
import type activityLogData from '../../generated/activity-log.json'

type ActivityLog = typeof activityLogData
type TimeOfDay = 'morning' | 'day' | 'evening' | 'night'

interface WorldProps {
  site: typeof SITE
  log: ActivityLog
}

function getTokyoHour(): number {
  const now = new Date()
  const utcHour = now.getUTCHours()
  return (utcHour + 9) % 24
}

function computeTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'day'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export const World = component$<WorldProps>(({ log }) => {
  const state = useStore({
    avatarX: AVATAR_START_X,
    scrollX: 0,
    activeZone: null as string | null,
    timeOfDay: 'day' as TimeOfDay,
    isWalking: false,
    isInside: false,
    showHint: true,
    // Room transition overlay
    doorFlash: 0,                         // 0–1 opacity
    doorPhase: 'idle' as 'idle' | 'in' | 'hold' | 'out',
    doorHoldFrames: 0,
    // Rocket animation
    rocketPhase: 'idle' as RocketPhase,
    rocketFrame: 0,
    avatarOnRocket: false,
    rocketLaunchStartX: 0,   // screen X captured when launch begins
    rocketLaunchStartY: 0,   // screen Y captured when launch begins
  })

  // Compute time of day (SSR-safe)
  useTask$(() => {
    const hour = getTokyoHour()
    state.timeOfDay = computeTimeOfDay(hour)
  })

  // Client-only: keyboard movement + RAF loop
  useVisibleTask$(({ cleanup }) => {
    let left = false
    let right = false
    let wheelVel = 0   // px/frame, positive = right; decays each frame
    let rafId = 0
    let hintTimer = 0

    // Hide hint after user starts walking
    hintTimer = window.setTimeout(() => {
      state.showHint = false
    }, 8000) as unknown as number

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { left = true; e.preventDefault() }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { right = true; e.preventDefault() }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') right = false
    }
    // scroll down → right, scroll up → left
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      wheelVel = Math.max(-10, Math.min(10, wheelVel + e.deltaY * 0.09))
      if (state.showHint) {
        state.showHint = false
        clearTimeout(hintTimer)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('wheel', onWheel, { passive: false })

    const animate = () => {
      // wheel velocity (decays with friction)
      if (Math.abs(wheelVel) > 0.1) {
        state.avatarX = Math.max(0, Math.min(WORLD_WIDTH - 100, state.avatarX + wheelVel))
        wheelVel *= 0.88
      } else {
        wheelVel = 0
      }

      const moving = left || right || Math.abs(wheelVel) > 0.5
      if (right) state.avatarX = Math.min(WORLD_WIDTH - 100, state.avatarX + AVATAR_SPEED)
      if (left) state.avatarX = Math.max(0, state.avatarX - AVATAR_SPEED)

      if (moving && state.showHint) {
        state.showHint = false
        clearTimeout(hintTimer)
      }

      // Scroll: center avatar in viewport
      const vw = window.innerWidth
      state.scrollX = Math.max(0, Math.min(WORLD_WIDTH - vw, state.avatarX - vw / 2))

      // Zone detection
      const zone = ZONES.find(z => Math.abs(z.x - state.avatarX) <= z.triggerRange)
      state.activeZone = zone?.id ?? null

      // Teleport logic between doors (Outside door: ~1830, Inside door: ~2090)
      if (!state.isInside && state.avatarX >= 1860 && state.avatarX < 1960) {
        state.avatarX = 2080
      } else if (state.isInside && state.avatarX <= 2064 && state.avatarX > 1960) {
        state.avatarX = 1840
      }

      // Inside detection + instant room transition
      const nowInside = state.avatarX >= INSIDE_START
      if (nowInside !== state.isInside && state.doorPhase === 'idle') {
        state.doorPhase = 'hold'
        state.doorFlash = 1
        state.doorHoldFrames = 22
      }
      state.isInside = nowInside

      // Room transition state machine
      // in: fade to black (fast) → hold: stay black → out: fade from black (slow)
      if (state.doorPhase === 'in') {
        state.doorFlash = Math.min(1, state.doorFlash + 0.1)
        if (state.doorFlash >= 1) {
          state.doorPhase = 'hold'
          state.doorHoldFrames = 22   // ~0.37s at 60fps
        }
      } else if (state.doorPhase === 'hold') {
        state.doorHoldFrames -= 1
        if (state.doorHoldFrames <= 0) state.doorPhase = 'out'
      } else if (state.doorPhase === 'out') {
        state.doorFlash = Math.max(0, state.doorFlash - 0.028)
        if (state.doorFlash <= 0) state.doorPhase = 'idle'
      }

      // Walking state
      state.isWalking = moving && !state.avatarOnRocket

      // ── Rocket phase machine ──
      const ROCKET_TRIGGER_X = WORLD_WIDTH - 120

      // Trigger boarding when avatar reaches the end
      if (state.rocketPhase === 'idle' && state.avatarX >= ROCKET_TRIGGER_X) {
        state.rocketPhase = 'boarding'
        state.rocketFrame = 0
        state.avatarOnRocket = true
        // Capture screen position of rocket (world x=5090)
        const rocketWorldX = WORLD_WIDTH - 110
        state.rocketLaunchStartX = rocketWorldX - state.scrollX
        state.rocketLaunchStartY = window.innerHeight * 0.68
      }

      // Freeze avatar during rocket sequence
      if (state.avatarOnRocket) {
        state.avatarX = ROCKET_TRIGGER_X
      }

      // Advance rocket phase
      if (state.rocketPhase !== 'idle' && state.rocketPhase !== 'done') {
        state.rocketFrame += 1
        const maxFrames = ROCKET_FRAMES[state.rocketPhase] ?? 1
        if (state.rocketFrame >= maxFrames) {
          state.rocketFrame = 0
          const order: RocketPhase[] = ['boarding', 'launch', 'orbit', 'reentry', 'landed', 'done']
          const next = order[order.indexOf(state.rocketPhase) + 1]
          state.rocketPhase = next ?? 'done'

          // Capture launch coords when boarding → launch
          if (state.rocketPhase === 'launch') {
            const rocketWorldX = WORLD_WIDTH - 110
            state.rocketLaunchStartX = rocketWorldX - state.scrollX
            state.rocketLaunchStartY = window.innerHeight * 0.68
          }

          // Release avatar when landed phase starts (overlay still visible, world canvas shows through)
          if (state.rocketPhase === 'landed') {
            state.avatarOnRocket = false
          }
        }
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    cleanup(() => {
      cancelAnimationFrame(rafId)
      clearTimeout(hintTimer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('wheel', onWheel)
    })
  })

  // Click-to-move: clicking the world floor sets avatar target
  useVisibleTask$(({ cleanup }) => {
    const worldEl = document.getElementById('world-canvas')
    if (!worldEl) return

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Only move if clicking background/floor, not a hotspot
      if (target.closest('[data-zone]')) return
      const rect = worldEl.getBoundingClientRect()
      const clickWorldX = e.clientX - rect.left + state.scrollX
      state.avatarX = Math.max(0, Math.min(WORLD_WIDTH - 100, clickWorldX))
    }

    worldEl.addEventListener('click', onClick)
    cleanup(() => worldEl.removeEventListener('click', onClick))
  })

  return (
    <div
      class="fixed inset-0 overflow-hidden"
      style={{ background: '#0e0d0c', fontFamily: 'ui-monospace, monospace' }}
      role="application"
      aria-label="lab walkthrough — use arrow keys or click to move"
    >
      {/* World canvas */}
      <div
        id="world-canvas"
        class="absolute top-0 left-0 h-full"
        style={{
          width: `${WORLD_WIDTH}px`,
          transform: `translateX(${-state.scrollX}px)`,
          willChange: 'transform',
        }}
      >
        <Outside timeOfDay={state.timeOfDay} activeZone={state.activeZone} avatarX={state.avatarX} />
        <Inside timeOfDay={state.timeOfDay} avatarX={state.avatarX} rocketLaunched={state.avatarOnRocket} />
        <Avatar
          x={state.avatarX}
          isInside={state.isInside}
          isWalking={state.isWalking}
          hidden={state.avatarOnRocket}
        />

        {/* Zone focus indicators (subtle) */}
        {ZONES.map(zone => (
          <div
            key={zone.id}
            class="absolute"
            style={{
              left: `${zone.x - zone.triggerRange}px`,
              bottom: '30%',
              width: `${zone.triggerRange * 2}px`,
              height: '4px',
              background: state.activeZone === zone.id
                ? 'rgba(192,168,112,0.15)'
                : 'transparent',
              transition: 'background 0.3s ease',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Rocket cinematic overlay */}
      <Rocket
        phase={state.rocketPhase}
        frame={state.rocketFrame}
        launchStartX={state.rocketLaunchStartX}
        launchStartY={state.rocketLaunchStartY}
        timeOfDay={state.timeOfDay}
      />

      {/* Room transition overlay: fade-in → hold → fade-out */}
      {state.doorPhase !== 'idle' && (
        <div
          class="fixed inset-0"
          style={{
            background: '#0a0908',
            opacity: state.doorFlash,
            zIndex: 45,
            // block interaction only while fully black (hold phase)
            pointerEvents: state.doorPhase === 'hold' ? 'auto' : 'none',
          }}
          aria-hidden="true"
        />
      )}

      {/* Zone panel overlay */}
      {state.activeZone && (
        <ZonePanel zone={state.activeZone} log={log} />
      )}

      {/* Controls hint */}
      {state.showHint && (
        <div
          class="fixed font-mono"
          style={{
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#504840',
            letterSpacing: '0.1em',
            pointerEvents: 'none',
            opacity: state.showHint ? 1 : 0,
            transition: 'opacity 1s ease',
            zIndex: 60,
            whiteSpace: 'nowrap',
          }}
          aria-label="Navigation hint"
        >
          ← → to walk &nbsp;·&nbsp; scroll &nbsp;·&nbsp; click to move
        </div>
      )}

      {/* Time of day indicator */}
      <div
        class="fixed font-mono"
        style={{
          top: '16px',
          right: '20px',
          fontSize: '9px',
          color: '#403830',
          letterSpacing: '0.15em',
          pointerEvents: 'none',
          zIndex: 30,
        }}
        aria-hidden="true"
      >
        {state.timeOfDay}
      </div>

      {/* Active zone label (minimal) */}
      {state.activeZone && (
        <div
          class="fixed font-mono"
          style={{
            top: '16px',
            left: '20px',
            fontSize: '9px',
            color: '#504840',
            letterSpacing: '0.15em',
            pointerEvents: 'none',
            zIndex: 30,
          }}
          aria-hidden="true"
        >
          {state.activeZone}
        </div>
      )}

      {/* Mobile scroll hint */}
      <div
        class="fixed font-mono"
        style={{
          top: '50%',
          right: '12px',
          transform: 'translateY(-50%)',
          fontSize: '9px',
          color: '#403830',
          letterSpacing: '0.1em',
          pointerEvents: 'none',
          display: 'none',
        }}
        aria-hidden="true"
      >
        swipe →
      </div>
    </div>
  )
})
