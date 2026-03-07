export interface CaseFile {
  id: string
  title: string
  status: 'complete' | 'incomplete' | 'broken'
  note: string
}

export const SITE = {
  name: 'lab.chukei',
  domain: 'log.chukei.online',
  tagline: '—',

  outside: {
    sign: {
      heading: 'lab.chukei',
      sub: 'field notes / running things / residue',
    },
    window: {
      log: 'something is still running.\nthe lights have been on for a while.',
    },
    door: {
      log: '→ push.\n\nthe lab is open.',
    },
  },

  inside: {
    note: {
      heading: 'week signal',
      fallback: 'nothing filed this week.\nstill working.',
    },
    desk: {
      heading: 'now',
      fallback: ['reading', 'building', 'thinking'],
    },
    terminal: {
      heading: 'running',
      fallback: ['—'],
    },
    board: {
      heading: 'open questions',
      fallback: ['what does it mean for a tool to feel like a place?'],
    },
    archive: {
      heading: 'archive',
      cases: [
        {
          id: 'CASE 001',
          title: 'signal in the static',
          status: 'incomplete',
          note: 'what can be heard between transmissions?',
        },
      ] as CaseFile[],
    },
    intercom: {
      heading: 'intercom',
      log: 'leave a signal.',
      contact: 'nakata.keita12@gmail.com',
      socials: [
        { label: 'zenn',         url: 'https://zenn.dev/kei_ninja',           handle: 'kei_ninja' },
        { label: 'github',       url: 'https://github.com/tyukei',            handle: 'tyukei'    },
        { label: 'connpass',     url: 'https://connpass.com/user/tyukei/',    handle: 'tyukei'    },
        { label: 'speakerdeck',  url: 'https://speakerdeck.com/tyukei',       handle: 'tyukei'    },
      ],
    },
  },
} as const
