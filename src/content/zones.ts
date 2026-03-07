export interface Zone {
  id: string
  x: number          // center x in world px
  label: string
  triggerRange: number
  section: 'outside' | 'inside'
}

// World is 5200px wide
// Outside: 0-1950px  Inside: 2000-5200px
export const ZONES: Zone[] = [
  { id: 'sign', x: 380, label: 'sign', triggerRange: 130, section: 'outside' },
  { id: 'window', x: 1050, label: 'window', triggerRange: 110, section: 'outside' },
  { id: 'door', x: 1870, label: 'door', triggerRange: 110, section: 'outside' },
  { id: 'note', x: 2350, label: 'note', triggerRange: 140, section: 'inside' },
  { id: 'desk', x: 2920, label: 'desk', triggerRange: 160, section: 'inside' },
  { id: 'terminal', x: 3440, label: 'terminal', triggerRange: 140, section: 'inside' },
  { id: 'board', x: 3980, label: 'board', triggerRange: 160, section: 'inside' },
  { id: 'archive', x: 4520, label: 'archive', triggerRange: 160, section: 'inside' },
  { id: 'intercom', x: 5000, label: 'intercom', triggerRange: 130, section: 'inside' },
]

export const WORLD_WIDTH = 5200
export const INSIDE_START = 2000
export const AVATAR_SPEED = 3  // px per frame
export const AVATAR_START_X = 100
