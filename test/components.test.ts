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

    const imports = readFileSync(resolve(buildDir, 'imports.d.ts'), 'utf-8')
    expect(imports).toContain('useUploadThing')
    expect(imports).toContain('uploadFiles')
    expect(existsSync(resolve(buildDir, 'upload-helpers.ts'))).toBe(true)
    expect(existsSync(resolve(buildDir, 'uploadthing.mjs'))).toBe(true)

    const routes = readFileSync(resolve(buildDir, 'types/nitro-routes.d.ts'), 'utf-8')
    expect(routes).toContain('\'/api/uploadthing\'')
  }, 120_000)

  it('respects a custom component prefix and file router export', () => {
    const customDir = fileURLToPath(new URL('./fixtures/custom-options', import.meta.url))
    const customBuildDir = resolve(customDir, '.nuxt')
    execFileSync(process.execPath, [nuxtCli, 'prepare', customDir], {
      cwd: rootDir,
      stdio: 'pipe',
    })

    const registry = readFileSync(resolve(customBuildDir, 'components.d.ts'), 'utf-8')
    expect(registry).toContain('DemoUploadButton')
    expect(registry).toContain('DemoUploadDropzone')

    const button = readFileSync(resolve(customBuildDir, 'uploadthing/components/upload-button.ts'), 'utf-8')
    const handler = readFileSync(resolve(customBuildDir, 'uploadthing.mjs'), 'utf-8')
    expect(button).toContain('type RouterExport = "customRouter"')
    expect(handler).toContain('const ROUTER_EXPORT = "customRouter"')
    expect(readFileSync(resolve(customBuildDir, 'types/nitro-routes.d.ts'), 'utf-8')).toContain('\'/api/uploadthing\'')
  }, 120_000)
})
