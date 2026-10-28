import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const consumerDir = mkdtempSync(join(tmpdir(), 'nuxt-uploadthing-consumer-'))
const pnpmCli = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

afterAll(() => rmSync(consumerDir, { recursive: true, force: true }))

describe('packed package consumer', () => {
  it('loads the packed tarball in Nuxt without Tailwind and builds it', () => {
    execFileSync(pnpmCli, ['pack', '--pack-destination', consumerDir], {
      cwd: packageRoot,
      stdio: 'pipe',
      shell: process.platform === 'win32',
    })

    const tarball = join(consumerDir, 'nuxt-uploadthing-1.2.4.tgz')
    const consumerModules = join(consumerDir, 'node_modules')
    const packageDir = join(consumerModules, 'nuxt-uploadthing')
    mkdirSync(packageDir, { recursive: true })
    execFileSync('tar', ['-xzf', tarball, '-C', packageDir, '--strip-components=1'], { stdio: 'pipe' })
    symlinkSync(join(packageRoot, 'node_modules'), join(packageDir, 'node_modules'), 'junction')
    symlinkSync(join(packageRoot, 'node_modules', 'nuxt'), join(consumerModules, 'nuxt'), 'junction')
    symlinkSync(join(packageRoot, 'node_modules', 'uploadthing'), join(consumerModules, 'uploadthing'), 'junction')
    symlinkSync(join(packageRoot, 'node_modules', '.pnpm'), join(consumerModules, '.pnpm'), 'junction')
    writeFileSync(join(consumerDir, 'nuxt.config.ts'), `
export default defineNuxtConfig({
  modules: ['nuxt-uploadthing'],
})
`)
    writeFileSync(join(consumerDir, 'app.vue'), '<template><div>packed consumer</div></template>')

    const nuxtCli = join(packageRoot, 'node_modules/nuxt/bin/nuxt.mjs')
    execFileSync(process.execPath, [nuxtCli, 'prepare'], {
      cwd: consumerDir,
      stdio: 'pipe',
      timeout: 120_000,
    })

    const generatedCss = readFileSync(join(consumerDir, '.nuxt/uploadthing-tw.css'), 'utf8')
    expect(generatedCss).toContain('Tailwind styles are disabled')
    expect(readFileSync(join(consumerDir, '.nuxt/uploadthing.mjs'), 'utf8')).toContain('createRouteHandler')

    execFileSync(process.execPath, [nuxtCli, 'build'], {
      cwd: consumerDir,
      stdio: 'inherit',
      timeout: 360_000,
    })
  }, 480_000)
})
