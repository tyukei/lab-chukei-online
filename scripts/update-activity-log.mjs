#!/usr/bin/env node
/**
 * update-activity-log.mjs
 *
 * Collects recent GitHub activity and manual notes,
 * compresses them into src/generated/activity-log.json.
 *
 * Usage:
 *   GITHUB_TOKEN=<token> GITHUB_USERNAME=<user> node scripts/update-activity-log.mjs
 *
 * Optional env vars:
 *   ALLOWLIST_REPOS  comma-separated "owner/repo" list (defaults to all public repos)
 *   MANUAL_NOTES     path to manual-log.json (default: content/manual-log.json)
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUTPUT = resolve(ROOT, 'src/generated/activity-log.json')
const MANUAL_NOTES_PATH = process.env.MANUAL_NOTES
  ? resolve(process.env.MANUAL_NOTES)
  : resolve(ROOT, 'content/manual-log.json')

const GITHUB_TOKEN    = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME
const ALLOWLIST_REPOS = process.env.ALLOWLIST_REPOS
  ? process.env.ALLOWLIST_REPOS.split(',').map(s => s.trim())
  : null

// ── GitHub API helper ───────────────────────────────────────────────────────

async function ghFetch(path) {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    console.warn('[skip] GITHUB_TOKEN or GITHUB_USERNAME not set — skipping GitHub fetch')
    return null
  }
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'lab-chukei-log-updater/1.0',
    },
  })
  if (!res.ok) {
    console.warn(`[warn] GitHub API ${path} → ${res.status}`)
    return null
  }
  return res.json()
}

// ── Collect data ────────────────────────────────────────────────────────────

async function getRecentActivity() {
  const events = await ghFetch(`/users/${GITHUB_USERNAME}/events/public?per_page=50`)
  if (!events) return { pushes: [], createdRepos: [], openedPRs: [] }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const recent = events.filter(e => new Date(e.created_at) >= since)

  const pushes = recent
    .filter(e => e.type === 'PushEvent')
    .filter(e => !ALLOWLIST_REPOS || ALLOWLIST_REPOS.includes(e.repo.name))
    .map(e => ({
      repo: e.repo.name.split('/')[1],
      messages: e.payload.commits?.map(c => c.message.split('\n')[0]).filter(Boolean) ?? [],
    }))

  const createdRepos = recent
    .filter(e => e.type === 'CreateEvent' && e.payload.ref_type === 'repository')
    .map(e => e.repo.name.split('/')[1])

  const openedPRs = recent
    .filter(e => e.type === 'PullRequestEvent' && e.payload.action === 'opened')
    .map(e => e.payload.pull_request?.title).filter(Boolean)

  return { pushes, createdRepos, openedPRs }
}

async function getActiveRepos() {
  const repos = await ghFetch(
    `/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=20&type=public`
  )
  if (!repos) return []
  return repos
    .filter(r => !r.fork && !r.archived)
    .filter(r => !ALLOWLIST_REPOS || ALLOWLIST_REPOS.includes(`${GITHUB_USERNAME}/${r.name}`))
    .slice(0, 8)
    .map(r => ({ name: r.name, description: r.description, language: r.language }))
}

// ── Read manual notes ───────────────────────────────────────────────────────

function readManualNotes() {
  if (!existsSync(MANUAL_NOTES_PATH)) return null
  try {
    const raw = readFileSync(MANUAL_NOTES_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.warn(`[warn] Could not parse ${MANUAL_NOTES_PATH}:`, e.message)
    return null
  }
}

// ── Distill into compressed log ─────────────────────────────────────────────

function distill({ activity, repos, manual }) {
  const manual_now      = manual?.now      ?? []
  const manual_running  = manual?.running  ?? []
  const manual_questions= manual?.questions ?? []
  const manual_residue  = manual?.residue  ?? []
  const manual_signal   = manual?.weekSignal ?? null

  // `now`: what's actively being touched this week
  const now = [
    ...manual_now,
    ...(activity.pushes.length
      ? [`pushing to ${[...new Set(activity.pushes.map(p => p.repo))].slice(0, 2).join(', ')}`]
      : []),
    ...(activity.openedPRs.slice(0, 1).map(t => `PR: ${t.toLowerCase()}`)),
  ].slice(0, 3)

  // `running`: projects in motion
  const repoNames = repos.map(r => r.name)
  const running = [
    ...manual_running,
    ...repoNames,
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)

  // `questions`: open questions / hypotheses
  const questions = manual_questions.slice(0, 3)

  // `residue`: broken/abandoned/fragments
  const residue = manual_residue.slice(0, 4)

  // `weekSignal`: one-sentence summary
  const weekSignal = manual_signal
    ?? (activity.pushes.length
      ? `active in ${[...new Set(activity.pushes.map(p => p.repo))].join(', ')}.`
      : 'quiet week. still running.')

  return { weekSignal, now, running, questions, residue }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[log] collecting activity...')

  const [activity, repos] = await Promise.all([
    getRecentActivity(),
    getActiveRepos(),
  ])

  const manual = readManualNotes()
  if (manual) console.log('[log] loaded manual notes from', MANUAL_NOTES_PATH)

  const distilled = distill({ activity, repos, manual })

  const output = {
    generated: new Date().toISOString(),
    ...distilled,
  }

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2))
  console.log('[log] written to', OUTPUT)
  console.log('[log] weekSignal:', output.weekSignal)
  console.log('[log] now:', output.now)
}

main().catch(e => {
  console.error('[error]', e)
  process.exit(1)
})
