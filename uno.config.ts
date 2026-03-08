import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
  ],
  shortcuts: {
    // scene sky
    'sky-morning': 'bg-[#d8cfc4]',
    'sky-day':     'bg-[#c8d4dc]',
    'sky-evening': 'bg-[#c8a882]',
    'sky-night':   'bg-[#1c1e28]',
    // scene structure
    'lab-wall':       'bg-[#b8b0a4]',
    'lab-wall-inner': 'bg-[#e4e0da]',
    'lab-floor-out':  'bg-[#9a9080]',
    'lab-floor-in':   'bg-[#c8bfb0]',
    'lab-ceiling':    'bg-[#d0ccc6]',
    // objects
    'window-glow':    'border border-[#8898a8] bg-[#c8d8e4]/60',
    'desk-surface':   'bg-[#c8b898] border-t border-[#a89878]',
    'desk-item':      'border border-[#a09080]/60 bg-[#ddd8ce]',
    'archive-box':    'border border-[#9090808] bg-[#d0c8bc] text-[#504840]',
    'intercom-panel': 'bg-[#383430] border border-[#504840]',
    'intercom-light': 'w-2 h-2 rounded-full bg-red-500',
    // hotspots
    'hotspot': 'absolute cursor-pointer focus:outline-none',
    // panel
    'zone-panel':       'fixed bottom-0 left-0 right-0 z-50 bg-[#0e0d0c]/96 border-t border-[#2a2826] text-[#c4bfb8] font-mono text-xs leading-relaxed',
    'panel-label':      'text-[#605850] text-[10px] tracking-widest uppercase',
    'panel-body':       'text-[#c4bfb8] text-xs leading-loose',
    'panel-fragment':   'text-[#807870] text-[11px]',
    // avatar
    'avatar-body':      'bg-[#38342e]',
    'avatar-body-lit':  'bg-[#504840]',
  },
  preflights: [
    {
      getCSS: () => `
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }

        @keyframes leg-l {
          0%, 100% { transform: translateY(0px)   scaleY(1);    }
          50%       { transform: translateY(2px)   scaleY(0.75); }
        }
        @keyframes leg-r {
          0%, 100% { transform: translateY(2px)   scaleY(0.75); }
          50%       { transform: translateY(0px)   scaleY(1);    }
        }
        .avatar-leg-l { transform-origin: top center; }
        .avatar-leg-r { transform-origin: top center; }
        .avatar-walking .avatar-leg-l {
          animation: leg-l 0.38s ease-in-out infinite;
        }
        .avatar-walking .avatar-leg-r {
          animation: leg-r 0.38s ease-in-out infinite;
        }

        @keyframes flame-flicker {
          0%   { transform: translateX(-50%) scaleX(1)    scaleY(1);    opacity: 1; }
          100% { transform: translateX(-50%) scaleX(0.85) scaleY(1.15); opacity: 0.9; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `,
    },
  ],
  theme: {
    fontFamily: {
      mono: "ui-monospace, Menlo, Monaco, 'Courier New', monospace",
    },
  },
})
