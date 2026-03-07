import { component$ } from '@builder.io/qwik'
import { SITE } from '../../content/site'
import type activityLogData from '../../generated/activity-log.json'

type ActivityLog = typeof activityLogData

interface ZonePanelProps {
  zone: string
  log: ActivityLog
}

export const ZonePanel = component$<ZonePanelProps>(({ zone, log }) => {
  return (
    <div
      class="zone-panel"
      role="status"
      aria-live="polite"
      style={{
        padding: '20px 32px 28px',
        minHeight: '100px',
        transition: 'opacity 0.25s ease',
      }}
    >
      <PanelContent zone={zone} log={log} />
    </div>
  )
})

const PanelContent = component$<ZonePanelProps>(({ zone, log }) => {
  switch (zone) {
    case 'sign':
      return (
        <div>
          <div class="panel-label" style={{ marginBottom: '10px' }}>—</div>
          <div class="panel-body" style={{ fontSize: '14px' }}>{SITE.outside.sign.heading}</div>
          <div class="panel-fragment" style={{ marginTop: '6px' }}>{SITE.outside.sign.sub}</div>
        </div>
      )

    case 'window':
      return (
        <div>
          <div class="panel-label" style={{ marginBottom: '10px' }}>window</div>
          <pre class="panel-body" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{SITE.outside.window.log}</pre>
        </div>
      )

    case 'door':
      return (
        <div>
          <div class="panel-label" style={{ marginBottom: '10px' }}>door</div>
          <pre class="panel-body" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px' }}>{SITE.outside.door.log}</pre>
        </div>
      )

    case 'note': {
      const signal = log.weekSignal || SITE.inside.note.fallback
      const generated = log.generated ? new Date(log.generated).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' }) : ''
      return (
        <div>
          <div class="panel-label" style={{ marginBottom: '10px' }}>
            {SITE.inside.note.heading}{generated ? `  ·  ${generated}` : ''}
          </div>
          <div class="panel-body" style={{ fontStyle: 'italic', fontSize: '13px' }}>— {signal}</div>
        </div>
      )
    }

    case 'desk': {
      const items = log.now?.length ? log.now : SITE.inside.desk.fallback
      return (
        <div>
          <div class="panel-label" style={{ marginBottom: '10px' }}>{SITE.inside.desk.heading}</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {items.map((item: string, i: number) => (
              <li key={i} class="panel-body" style={{ marginTop: i > 0 ? '4px' : 0 }}>· {item}</li>
            ))}
          </ul>
        </div>
      )
    }

    case 'terminal': {
      const items = log.running?.length ? log.running : SITE.inside.terminal.fallback
      return (
        <div>
          <div class="panel-label" style={{ marginBottom: '10px' }}>{SITE.inside.terminal.heading}</div>
          <div style={{ fontFamily: 'ui-monospace, monospace' }}>
            {items.map((item: string, i: number) => (
              <div key={i} class="panel-body" style={{ marginTop: i > 0 ? '3px' : 0, color: '#7ab860' }}>
                &gt; {item}
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'board': {
      const questions = log.questions?.length ? log.questions : SITE.inside.board.fallback
      return (
        <div>
          <div class="panel-label" style={{ marginBottom: '10px' }}>{SITE.inside.board.heading}</div>
          {questions.map((q: string, i: number) => (
            <div key={i} class="panel-body" style={{ marginTop: i > 0 ? '8px' : 0, fontStyle: 'italic', fontSize: '13px' }}>
              — {q}
            </div>
          ))}
        </div>
      )
    }

    case 'archive': {
      const residue = log.residue?.length ? log.residue : []
      const cases = SITE.inside.archive.cases
      return (
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
          <div>
            <div class="panel-label" style={{ marginBottom: '10px' }}>case files</div>
            {cases.map((c) => (
              <div key={c.id} style={{ marginTop: '6px' }}>
                <div class="panel-body" style={{ color: '#a09888' }}>{c.id} — {c.title}</div>
                <div class="panel-fragment" style={{ marginTop: '2px', paddingLeft: '8px' }}>{c.note}</div>
                <div class="panel-fragment" style={{ marginTop: '2px', paddingLeft: '8px', color: '#605850' }}>
                  [{c.status}]
                </div>
              </div>
            ))}
          </div>
          {residue.length > 0 && (
            <div>
              <div class="panel-label" style={{ marginBottom: '10px' }}>residue</div>
              {residue.map((r: string, i: number) => (
                <div key={i} class="panel-fragment" style={{ marginTop: i > 0 ? '5px' : 0 }}>· {r}</div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'intercom': {
      const { log: ilog, contact, socials } = SITE.inside.intercom
      return (
        <div style={{ display: 'flex', gap: '56px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* mail */}
          <div>
            <div class="panel-label" style={{ marginBottom: '10px' }}>{SITE.inside.intercom.heading}</div>
            <div class="panel-body">{ilog}</div>
            <div style={{ marginTop: '10px' }}>
              <a
                href={`mailto:${contact}`}
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '11px',
                  color: '#c0a870',
                  textDecoration: 'none',
                  borderBottom: '1px solid #c0a870',
                  paddingBottom: '1px',
                }}
              >
                {contact}
              </a>
            </div>
          </div>
          {/* socials */}
          <div>
            <div class="panel-label" style={{ marginBottom: '10px' }}>elsewhere</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content', columnGap: '16px', rowGap: '6px' }}>
              {socials.map((s) => (
                <>
                  <span class="panel-fragment" style={{ color: '#605850', textAlign: 'right' }}>
                    {s.label}
                  </span>
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '11px',
                      color: '#a09080',
                      textDecoration: 'none',
                      borderBottom: '1px solid #605850',
                      paddingBottom: '1px',
                    }}
                  >
                    {s.handle}
                  </a>
                </>
              ))}
            </div>
          </div>
        </div>
      )
    }

    default:
      return null
  }
})
