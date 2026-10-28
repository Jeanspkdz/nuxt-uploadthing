import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const fixtureDir = fileURLToPath(new URL('./fixtures/basic', import.meta.url))
const nuxtCli = fileURLToPath(new URL('../node_modules/nuxt/bin/nuxt.mjs', import.meta.url))
const port = 31_000 + Math.floor(Math.random() * 20_000)
const baseUrl = `http://127.0.0.1:${port}`
let server: ReturnType<typeof spawn> | undefined
let serverOutput = ''

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server?.exitCode !== null) {
      throw new Error(`Nitro server exited before listening:\n${serverOutput}`)
    }

    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    }
    catch {
      // The server is still starting.
    }

    await delay(250)
  }

  throw new Error(`Timed out waiting for Nitro server:\n${serverOutput}`)
}

beforeAll(async () => {
  const env: NodeJS.ProcessEnv = { ...process.env, HOST: '127.0.0.1', NITRO_HOST: '127.0.0.1', NITRO_PORT: String(port), PORT: String(port) }
  delete env.UPLOADTHING_TOKEN
  delete env.UPLOADTHING_SECRET

  server = spawn(process.execPath, [nuxtCli, 'dev', fixtureDir, '--host', '127.0.0.1', '--port', String(port)], {
    cwd: rootDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout?.on('data', (chunk) => {
    serverOutput += chunk.toString()
  })
  server.stderr?.on('data', (chunk) => {
    serverOutput += chunk.toString()
  })
  await waitForServer()
}, 180_000)

afterAll(() => {
  server?.kill()
})

describe('SSR and UploadThing Nitro route', () => {
  it('renders the app on the server', async () => {
    const html = await fetch(baseUrl).then(response => response.text())
    expect(html).toContain('<div>basic</div>')
  })

  it('exposes the configured user router at the UploadThing endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/uploadthing`)
    expect(response.ok).toBe(true)
    expect(await response.json()).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'imageUploader' }),
    ]))
  })

  it('rejects an invalid upload request', async () => {
    const response = await fetch(`${baseUrl}/api/uploadthing`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ files: [] }),
    })
    expect(response.status).toBeGreaterThanOrEqual(400)
  })

  it('returns an HTTP error when a valid upload request has no credentials', async () => {
    const response = await fetch(`${baseUrl}/api/uploadthing`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ files: [{ name: 'cover.png', size: 5, type: 'image/png' }] }),
    })
    const body = await response.text()
    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(body).toBeTruthy()
  })

  it('rejects unsupported HTTP methods', async () => {
    const response = await fetch(`${baseUrl}/api/uploadthing`, { method: 'PUT' })
    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
