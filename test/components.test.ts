import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'pathe'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const nuxtCli = fileURLToPath(new URL('../node_modules/nuxt/bin/nuxt.mjs', import.meta.url))
const fixtureDir = fileURLToPath(new URL('./fixtures/components', import.meta.url))
const buildDir = resolve(fixtureDir, '.nuxt')

describe('generated components', () => {
  it('groups components without changing their Nuxt names', () => {
    execFileSync(process.execPath, [nuxtCli, 'prepare', fixtureDir], {
      cwd: rootDir,
      stdio: 'pipe',
    })

    expect(existsSync(resolve(buildDir, 'uploadthing/components/upload-button.ts'))).toBe(true)
    expect(existsSync(resolve(buildDir, 'uploadthing/components/upload-dropzone.ts'))).toBe(true)

    const registry = readFileSync(resolve(buildDir, 'components.d.ts'), 'utf-8')
    expect(registry).toContain('UploadthingUploadButton')
    expect(registry).toContain('UploadthingUploadDropzone')
    expect(registry).toContain('uploadthing/components/upload-button')
    expect(registry).toContain('uploadthing/components/upload-dropzone')
  }, 120_000)
})
