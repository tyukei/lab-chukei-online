import { component$ } from '@builder.io/qwik'

interface AvatarProps {
  x: number
  isInside: boolean
  isWalking: boolean
}

// Layout: 20px wide × 48px tall
//   head:     12×12 circle (top 0,  left 4px)
//   body:     20×22 rect   (top 13px)
//   leg-l:     8×14 rect   (top 36px, left 1px)
//   leg-r:     8×14 rect   (top 36px, left 11px)

export const Avatar = component$<AvatarProps>(({ x, isInside, isWalking }) => {
  const color = isInside ? '#504840' : '#38342e'

  return (
    <div
      class={`absolute${isWalking ? ' avatar-walking' : ''}`}
      style={{
        left: `${x}px`,
        bottom: '30%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '50px',
        zIndex: 20,
        willChange: 'left',
      }}
      aria-hidden="true"
    >
      {/* head */}
      <div
        class="absolute rounded-full"
        style={{ top: 0, left: '4px', width: '12px', height: '12px', background: color }}
      />
      {/* body */}
      <div
        class="absolute"
        style={{ top: '13px', left: 0, width: '20px', height: '22px', background: color }}
      />
      {/* left leg */}
      <div
        class="absolute avatar-leg-l"
        style={{ top: '36px', left: '1px', width: '8px', height: '14px', background: color }}
      />
      {/* right leg */}
      <div
        class="absolute avatar-leg-r"
        style={{ top: '36px', left: '11px', width: '8px', height: '14px', background: color }}
      />
    </div>
  )
})
