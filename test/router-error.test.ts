import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const nuxtCli = fileURLToPath(new URL('../node_modules/nuxt/bin/nuxt.mjs', import.meta.url))
const port = 51_000 + Math.floor(Math.random() * 10_000)
const baseUrl = `http://127.0.0.1:${port}`
let server: ReturnType<typeof spawn> | undefined
let serverOutput = ''

beforeAll(async () => {
  server = spawn(process.execPath, [nuxtCli, 'dev', 'test/fixtures/missing-export', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: rootDir,
    env: { ...process.env, HOST: '127.0.0.1', NITRO_HOST: '127.0.0.1', NITRO_PORT: String(port), PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout?.on('data', (chunk) => {
    serverOutput += chunk.toString()
  })
  server.stderr?.on('data', (chunk) => {
    serverOutput += chunk.toString()
  })

  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error(`Nuxt exited before listening:\n${serverOutput}`)
    try {
      if ((await fetch(baseUrl)).ok) return
    }
    catch {
      // The development server is still starting.
    }
    await delay(250)
  }
  throw new Error(`Timed out waiting for Nuxt:\n${serverOutput}`)
}, 180_000)

afterAll(() => server?.kill())

describe('router configuration errors', () => {
  it('explains when the configured router export does not exist', async () => {
    const response = await fetch(`${baseUrl}/api/uploadthing`)
    const body = await response.text()
    expect(response.status).toBeGreaterThanOrEqual(500)
    expect(body).toContain('Router export not found: missingRouter')
  })
})
