import { component$ } from '@builder.io/qwik'

interface OutsideProps {
  timeOfDay: 'morning' | 'day' | 'evening' | 'night'
  activeZone: string | null
  avatarX: number
}

const SKY_CLASS: Record<string, string> = {
  morning: 'sky-morning',
  day: 'sky-day',
  evening: 'sky-evening',
  night: 'sky-night',
}

// Door geometry: x=1800–1864, height=112px from ground
const DOOR_LEFT = 1800
const DOOR_WIDTH = 64
const DOOR_RIGHT = DOOR_LEFT + DOOR_WIDTH  // 1864

const TEXTURE = 'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(0,0,0,0.04) 60px)'

export const Outside = component$<OutsideProps>(({ timeOfDay, activeZone, avatarX }) => {
  const skyClass = SKY_CLASS[timeOfDay] ?? 'sky-day'

  let scaleX = 1
  if (activeZone === 'door') {
    scaleX = 0.04
  } else if (avatarX <= 1840 && avatarX > 1700) {
    scaleX = Math.min(1, Math.max(0.04, (1840 - avatarX) / 120 + 0.04))
  }

  return (
    <>
      {/* Sky background — extends to x=2000 to close outside/inside seam */}
      <div
        class={`absolute top-0 left-0 h-full ${skyClass} transition-colors duration-[2000ms]`}
        style={{ width: '2000px' }}
        aria-hidden="true"
      />

      {/* Ground strip - outside */}
      <div
        class="absolute lab-floor-out"
        style={{ left: 0, width: '2000px', bottom: 0, height: '30%' }}
        aria-hidden="true"
      />

      {/* Building facade — LEFT of door gap */}
      <div
        class="absolute lab-wall"
        style={{ left: '750px', top: '8%', width: `${DOOR_LEFT - 750}px`, height: '62%' }}
        aria-hidden="true"
      >
        <div class="absolute inset-0" style={{ backgroundImage: TEXTURE }} />
      </div>

      {/* Building facade — wall ABOVE door (fills gap so sky doesn't show through) */}
      <div
        class="absolute lab-wall"
        style={{
          left: `${DOOR_LEFT}px`,
          top: '8%',
          width: `${DOOR_WIDTH}px`,
          bottom: 'calc(30% + 112px)',   // from building top down to door top
        }}
        aria-hidden="true"
      >
        <div class="absolute inset-0" style={{ backgroundImage: TEXTURE }} />
      </div>

      {/* Building facade — RIGHT of door gap, extended to x=2000 */}
      <div
        class="absolute lab-wall"
        style={{ left: `${DOOR_RIGHT}px`, top: '8%', width: `${2000 - DOOR_RIGHT}px`, height: '62%' }}
        aria-hidden="true"
      >
        <div class="absolute inset-0" style={{ backgroundImage: TEXTURE }} />
      </div>

      {/* Door frame — dark interior visible behind */}
      <div
        class="absolute"
        style={{
          left: `${DOOR_LEFT}px`,
          bottom: '30%',
          width: `${DOOR_WIDTH}px`,
          height: '112px',
          background: '#0e0c0a',
        }}
        aria-hidden="true"
      />

      {/* Door panel — opens on zone enter */}
      <div
        class="absolute hotspot"
        style={{
          left: `${DOOR_LEFT}px`,
          bottom: '30%',
          width: `${DOOR_WIDTH}px`,
          height: '112px',
          background: '#201c18',
          border: '2px solid #504840',
          transformOrigin: 'left center',
          transform: `scaleX(${scaleX})`,
          transition: avatarX === 1840 ? 'none' : 'transform 0.2s ease-out',
        }}
        data-zone="door"
      >
        {/* Door knob */}
        <div
          class="absolute rounded-full bg-[#908060]"
          style={{ right: '10px', top: '48%', width: '7px', height: '7px' }}
        />
        {/* Door panel line */}
        <div
          class="absolute bg-[#2c2824]"
          style={{ left: '8px', right: '8px', top: '20%', height: '1px' }}
        />
        <div
          class="absolute bg-[#2c2824]"
          style={{ left: '8px', right: '8px', top: '70%', height: '1px' }}
        />
      </div>

      {/* Sign post + board */}
      <div
        class="absolute hotspot"
        style={{ left: '340px', bottom: '30%' }}
        data-zone="sign"
      >
        {/* Post */}
        <div
          class="absolute avatar-body"
          style={{ left: '46px', bottom: 0, width: '6px', height: '90px' }}
        />
        {/* Sign board */}
        <div
          class="absolute bg-[#e8e4dc] border border-[#908880]"
          style={{ bottom: '70px', left: 0, width: '100px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '10px', color: '#504840', letterSpacing: '0.05em' }}>
            lab.chukei
          </span>
        </div>
      </div>

      {/* Window */}
      <div
        class="absolute hotspot window-glow"
        style={{ left: '980px', top: '28%', width: '108px', height: '80px' }}
        data-zone="window"
      >
        <div class="absolute inset-0" style={{
          background: timeOfDay === 'night' ? 'rgba(180,160,80,0.15)' : 'rgba(200,216,228,0.4)',
        }} />
        <div class="absolute bg-[#8898a8]/30" style={{ left: '50%', top: 0, width: '1px', height: '100%' }} />
        <div class="absolute bg-[#8898a8]/30" style={{ left: 0, top: '50%', width: '100%', height: '1px' }} />
        {timeOfDay === 'night' && <div class="absolute inset-0 bg-[#c8a840]/10" />}
      </div>

      {/* Thin wall joining to inside section */}
      <div
        class="absolute lab-wall"
        style={{ left: '1900px', top: '8%', width: '50px', height: '62%' }}
        aria-hidden="true"
      />
    </>
  )
})
