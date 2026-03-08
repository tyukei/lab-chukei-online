import { component$ } from '@builder.io/qwik'

interface InsideProps {
  timeOfDay: 'morning' | 'day' | 'evening' | 'night'
  avatarX: number
  rocketLaunched?: boolean
}

const SKY_CLASS: Record<string, string> = {
  morning: 'sky-morning',
  day: 'sky-day',
  evening: 'sky-evening',
  night: 'sky-night',
}

export const Inside = component$<InsideProps>(({ timeOfDay, avatarX, rocketLaunched }) => {
  const ambientLight = timeOfDay === 'night' ? '0.85' : '1'
  const skyClass = SKY_CLASS[timeOfDay] ?? 'sky-day'

  return (
    <>
      {/* Interior wall background */}
      <div
        class="absolute lab-wall-inner"
        style={{ left: '2000px', top: 0, width: '3200px', height: '100%', opacity: ambientLight }}
        aria-hidden="true"
      />

      {/* Ceiling strip */}
      <div
        class="absolute lab-ceiling"
        style={{ left: '2000px', top: 0, width: '3200px', height: '14%' }}
        aria-hidden="true"
      >
        {/* Ceiling light fixtures */}
        {[2400, 2950, 3500, 4050, 4600].map((lx) => (
          <div
            key={lx}
            class="absolute"
            style={{
              left: `${lx - 2000}px`,
              top: '80%',
              width: '40px',
              height: '8px',
              background: timeOfDay === 'night' ? '#d4c890' : '#e0dcd4',
              transform: 'translateX(-50%)',
            }}
          />
        ))}
      </div>

      {/* Floor strip */}
      <div
        class="absolute lab-floor-in"
        style={{ left: '2000px', bottom: 0, width: '3200px', height: '30%' }}
        aria-hidden="true"
      >
        {/* Floor planks */}
        <div class="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(0,0,0,0.04) 80px)',
        }} />
      </div>

      {/* Baseboard */}
      <div
        class="absolute bg-[#b0a898]"
        style={{ left: '2000px', bottom: 'calc(30% - 4px)', width: '3200px', height: '4px' }}
        aria-hidden="true"
      />

      {/* ── Entry door (left wall, x=2064–2128) ── */}
      {/* Door frame — dark interior */}
      <div
        class="absolute"
        style={{
          left: '2064px',
          bottom: '30%',
          width: '64px',
          height: '112px',
          background: '#08080a',
        }}
        aria-hidden="true"
      />
      {/* Door panel — swings shut as you walk away */}
      <div
        class="absolute"
        style={{
          left: '2064px',
          bottom: '30%',
          width: '64px',
          height: '112px',
          background: '#201c18',
          border: '2px solid #504840',
          transformOrigin: 'left center',
          // Avatar starts inside at 2080. Door hinges at 2064. 
          // At 2080 (dist 16), it's wide open (scaleX ~0.04)
          // As avatar walks right to 2200, it closes (scaleX -> 1)
          transform: `scaleX(${Math.min(1, Math.max(0.04, (avatarX - 2080) / 120 + 0.04))})`,
          transition: avatarX === 2080 ? 'none' : 'transform 0.2s ease-out',
        }}
        aria-hidden="true"
      >
        <div
          class="absolute rounded-full bg-[#908060]"
          style={{ right: '10px', top: '48%', width: '7px', height: '7px' }}
        />
      </div>

      {/* ── NOTE zone (x=2350) ── */}
      {/* Paper pinned to wall */}
      <div
        class="absolute hotspot"
        style={{
          left: '2280px',
          top: '20%',
          width: '110px',
          height: '150px',
          background: '#f0ece4',
          border: '1px solid #c0b8ac',
          transform: 'rotate(-1.5deg)',
          boxShadow: '2px 2px 6px rgba(0,0,0,0.08)',
        }}
        data-zone="note"
      >
        {/* Pin */}
        <div class="absolute rounded-full bg-[#c04040]" style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px' }} />
        {/* Lines */}
        {[30, 48, 66, 84, 102, 120].map((t) => (
          <div key={t} class="absolute bg-[#c0b8b0]/60" style={{ top: `${t}px`, left: '12px', right: '12px', height: '1px' }} />
        ))}
      </div>

      {/* ── INTERIOR WINDOW (x=2500) ── */}
      <div
        class="absolute hotspot window-glow"
        style={{ left: '2500px', top: '22%', width: '160px', height: '120px', overflow: 'hidden', background: '#302820', border: '4px solid #484038' }}
        data-zone="window"
      >
        {/* Sky background behind window */}
        <div class={`absolute inset-0 ${skyClass} transition-colors duration-[2000ms]`} />

        {/* Window tint / reflection based on time of day */}
        <div class="absolute inset-0" style={{
          background: timeOfDay === 'night' ? 'rgba(180,160,80,0.15)' : 'rgba(200,216,228,0.3)',
        }} />

        {/* Window mullions (crossbars) */}
        <div class="absolute bg-[#302820]" style={{ left: '50%', top: 0, width: '4px', height: '100%', transform: 'translateX(-50%)' }} />
        <div class="absolute bg-[#302820]" style={{ left: 0, top: '50%', width: '100%', height: '4px', transform: 'translateY(-50%)' }} />

        {/* Nighttime room reflection */}
        {timeOfDay === 'night' && <div class="absolute inset-0 bg-[#c8a840]/10" />}
      </div>

      {/* ── DESK zone (x=2920) ── */}
      {/* Desk legs */}
      <div class="absolute bg-[#a89878]" style={{ left: '2760px', bottom: '30%', width: '8px', height: '70px' }} aria-hidden="true" />
      <div class="absolute bg-[#a89878]" style={{ left: '3060px', bottom: '30%', width: '8px', height: '70px' }} aria-hidden="true" />
      {/* Desk surface */}
      <div
        class="absolute desk-surface hotspot"
        style={{ left: '2750px', bottom: 'calc(30% + 70px)', width: '320px', height: '18px' }}
        data-zone="desk"
      >
        {/* Items on desk */}
        {/* Monitor */}
        <div class="absolute bg-[#383430]" style={{ left: '80px', bottom: '18px', width: '80px', height: '60px' }}>
          <div class="absolute inset-1 bg-[#1c2028]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div class="absolute bg-[#304860]/80" style={{ left: '4px', right: '4px', top: '6px', height: '1px' }} />
            <div class="absolute bg-[#304860]/50" style={{ left: '4px', right: '4px', top: '12px', height: '1px' }} />
            <div class="absolute bg-[#304860]/30" style={{ left: '4px', right: '4px', top: '18px', height: '1px' }} />
          </div>
        </div>
        {/* Monitor stand */}
        <div class="absolute bg-[#404040]" style={{ left: '113px', bottom: '18px', width: '14px', height: '6px' }} aria-hidden="true" />
        {/* Paper stack */}
        <div class="absolute bg-[#e8e4d8]" style={{ left: '200px', bottom: '18px', width: '60px', height: '4px' }} aria-hidden="true" />
        <div class="absolute bg-[#dcd8cc]" style={{ left: '202px', bottom: '22px', width: '58px', height: '3px' }} aria-hidden="true" />
        {/* Mug */}
        <div class="absolute bg-[#807060]" style={{ left: '14px', bottom: '18px', width: '20px', height: '24px' }} aria-hidden="true" />
      </div>

      {/* ── TERMINAL zone (x=3440) ── */}
      {/* Terminal table */}
      <div class="absolute bg-[#a89878]" style={{ left: '3320px', bottom: '30%', width: '240px', height: '12px' }} aria-hidden="true" />
      <div class="absolute bg-[#a89878]" style={{ left: '3330px', bottom: '30%', width: '8px', height: '50px' }} aria-hidden="true" />
      <div class="absolute bg-[#a89878]" style={{ left: '3542px', bottom: '30%', width: '8px', height: '50px' }} aria-hidden="true" />
      {/* Terminal screen */}
      <div
        class="absolute hotspot"
        style={{ left: '3340px', bottom: 'calc(30% + 62px)', width: '200px', height: '140px' }}
        data-zone="terminal"
      >
        <div class="absolute inset-0 bg-[#0c1008] border border-[#304828]">
          {/* Terminal text lines */}
          <div style={{ padding: '8px', fontFamily: 'ui-monospace, monospace', fontSize: '8px', color: '#60a840' }}>
            <div>&gt; running</div>
            <div style={{ color: '#408028', marginTop: '4px' }}>processes: 5</div>
            <div style={{ color: '#305820', marginTop: '2px' }}>uptime: —</div>
            <div style={{ color: '#60a840', marginTop: '6px', opacity: 0.6 }}>█</div>
          </div>
        </div>
        {/* Keyboard */}
        <div class="absolute bg-[#383430] border border-[#504840]" style={{ bottom: '-20px', left: '10px', width: '180px', height: '16px' }} />
      </div>

      {/* ── BOARD zone (x=3980) ── */}
      {/* Corkboard */}
      <div
        class="absolute hotspot"
        style={{
          left: '3840px',
          top: '16%',
          width: '240px',
          height: '180px',
          background: '#c8b890',
          border: '6px solid #907850',
        }}
        data-zone="board"
      >
        {/* Pinned notes */}
        <div class="absolute bg-[#f0ece0] border border-[#d0c8b8]" style={{ left: '12px', top: '14px', width: '80px', height: '50px', transform: 'rotate(1deg)' }}>
          <div class="absolute rounded-full bg-[#c04040]" style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '7px', height: '7px' }} />
        </div>
        <div class="absolute bg-[#eceae0] border border-[#d0c8b8]" style={{ left: '100px', top: '24px', width: '100px', height: '40px', transform: 'rotate(-1.5deg)' }}>
          <div class="absolute rounded-full bg-[#4060c0]" style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '7px', height: '7px' }} />
        </div>
        <div class="absolute bg-[#f4f0e4] border border-[#d0c8b8]" style={{ left: '20px', top: '80px', width: '180px', height: '60px', transform: 'rotate(0.5deg)' }}>
          <div class="absolute rounded-full bg-[#a0c040]" style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '7px', height: '7px' }} />
        </div>
      </div>

      {/* ── ARCHIVE zone (x=4520) ── */}
      {/* File cabinet */}
      <div
        class="absolute hotspot"
        style={{ left: '4420px', bottom: '30%' }}
        data-zone="archive"
      >
        <div class="absolute archive-box" style={{ left: 0, bottom: 0, width: '140px', height: '180px' }}>
          {/* Drawer handles */}
          {[40, 90, 140].map((t) => (
            <div key={t} class="absolute" style={{ left: 0, right: 0, top: `${t}px`, height: '1px', background: '#808078' }} />
          ))}
          {[20, 65, 112].map((t) => (
            <div key={t} class="absolute bg-[#909088] rounded-sm" style={{ left: '55px', top: `${t}px`, width: '30px', height: '6px' }} />
          ))}
        </div>
        {/* Boxes on top */}
        <div class="absolute archive-box" style={{ left: '150px', bottom: 0, width: '80px', height: '80px' }} />
        <div class="absolute archive-box" style={{ left: '150px', bottom: '82px', width: '80px', height: '60px' }} />
        {/* Folder sticking out */}
        <div class="absolute bg-[#d4804040] border border-[#c07030]" style={{ left: '155px', bottom: '142px', width: '70px', height: '20px' }} />
      </div>

      {/* ── INTERCOM zone (x=5000) ── */}
      {/* Intercom panel on wall */}
      <div
        class="absolute hotspot intercom-panel"
        style={{
          left: '4930px',
          top: '28%',
          width: '80px',
          height: '120px',
        }}
        data-zone="intercom"
      >
        {/* Status light */}
        <div class="absolute intercom-light" style={{ top: '12px', left: '12px' }} />
        {/* Speaker grille */}
        <div class="absolute" style={{ top: '32px', left: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} class="absolute bg-[#504848]" style={{ top: `${i * 8}px`, left: 0, right: 0, height: '2px' }} />
          ))}
        </div>
        {/* Button */}
        <div class="absolute rounded-sm bg-[#804040]" style={{ bottom: '14px', left: '24px', width: '32px', height: '14px' }} />
      </div>

      {/* ── ROCKET (x=5090, sits at end of room) ── */}
      {!rocketLaunched && <>
        {/* Body */}
        <div class="absolute" style={{ left: '5078px', bottom: 'calc(30% + 0px)', width: '40px', height: '84px', background: '#dcd8d0', border: '2px solid #b0a898', borderRadius: '4px 4px 0 0' }} aria-hidden="true" />
        {/* Nose cone */}
        <div class="absolute" style={{ left: '5078px', bottom: 'calc(30% + 84px)', width: '40px', height: '48px', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', background: '#c84030' }} aria-hidden="true" />
        {/* Left fin */}
        <div class="absolute" style={{ left: '5064px', bottom: 'calc(30% + 0px)', width: 0, height: 0, borderTop: '28px solid transparent', borderRight: '14px solid #5a6070', borderBottom: '0 solid transparent' }} aria-hidden="true" />
        {/* Right fin */}
        <div class="absolute" style={{ left: '5118px', bottom: 'calc(30% + 0px)', width: 0, height: 0, borderTop: '28px solid transparent', borderLeft: '14px solid #5a6070', borderBottom: '0 solid transparent' }} aria-hidden="true" />
        {/* Window */}
        <div class="absolute rounded-full" style={{ left: '5088px', bottom: 'calc(30% + 52px)', width: '20px', height: '20px', background: '#1c2a3a', border: '2px solid #b0a898' }} aria-hidden="true" />
      </>}

      {/* End wall */}
      <div
        class="absolute lab-wall"
        style={{ left: '5150px', top: '8%', width: '50px', height: '62%' }}
        aria-hidden="true"
      />

      {/* ── AMBIENT LIGHTING OVERLAY ── */}
      {/* Tints the entire room based on time of day for mood */}
      <div
        class="absolute pointer-events-none transition-colors duration-[2000ms]"
        style={{
          left: '2000px', top: 0, width: '3200px', height: '100%',
          background:
            timeOfDay === 'morning' ? 'linear-gradient(135deg, rgba(255,245,230,0.1) 0%, rgba(200,210,240,0.05) 100%)' :
              timeOfDay === 'evening' ? 'linear-gradient(135deg, rgba(255,180,140,0.15) 0%, rgba(120,80,60,0.1) 100%)' :
                timeOfDay === 'night' ? 'linear-gradient(180deg, rgba(10,15,30,0.4) 0%, rgba(30,25,20,0.6) 100%)' :
                  'transparent', // day is normal
          mixBlendMode: timeOfDay === 'night' ? 'multiply' : 'normal',
          zIndex: 10,
        }}
        aria-hidden="true"
      />
    </>
  )
})
