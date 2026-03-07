import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { World } from '../components/world/World'
import activityLog from '../generated/activity-log.json'
import { SITE } from '../content/site'

export default component$(() => {
  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <World site={SITE} log={activityLog} />
    </main>
  )
})

export const head: DocumentHead = {
  title: 'lab.chukei — field notes',
  meta: [
    {
      name: 'description',
      content: 'field notes from somewhere in the middle of things.',
    },
    {
      name: 'og:title',
      content: 'lab.chukei',
    },
    {
      name: 'theme-color',
      content: '#0e0d0c',
    },
  ],
}
