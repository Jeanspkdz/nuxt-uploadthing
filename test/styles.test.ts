import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { resolve } from 'pathe'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const nuxtCli = fileURLToPath(new URL('../node_modules/nuxt/bin/nuxt.mjs', import.meta.url))
const packagedCssPath = fileURLToPath(new URL('../dist/runtime/uploadthing-tw.css', import.meta.url))
const nuxtAugmentsPath = fileURLToPath(new URL('../node_modules/nuxt/dist/app/types/augments.js', import.meta.url))

function prepareFixture(name: string) {
  execFileSync(process.execPath, [nuxtCli, 'prepare', `test/fixtures/${name}`], {
    cwd: rootDir,
    stdio: 'pipe',
  })
  return readFileSync(fileURLToPath(new URL(`./fixtures/${name}/.nuxt/uploadthing-tw.css`, import.meta.url)), 'utf-8')
}

describe('generated styles', () => {
  it('keeps the package stylesheet static', () => {
    expect(readFileSync(packagedCssPath, 'utf-8')).toMatch(/@import ['"]#build\/uploadthing-tw\.css['"];/)
  })

  it('generates the default-style placeholder in the Nuxt build directory', () => {
    const packagedCss = readFileSync(packagedCssPath, 'utf-8')
    const nuxtAugments = readFileSync(nuxtAugmentsPath, 'utf-8')
    expect(prepareFixture('default-styles')).toContain('Tailwind styles are disabled')
    expect(readFileSync(packagedCssPath, 'utf-8')).toBe(packagedCss)
    expect(readFileSync(nuxtAugmentsPath, 'utf-8')).toBe(nuxtAugments)
  }, 120_000)

  it('generates Tailwind styles in the Nuxt build directory', () => {
    const packagedCss = readFileSync(packagedCssPath, 'utf-8')
    const nuxtAugments = readFileSync(nuxtAugmentsPath, 'utf-8')
    const css = prepareFixture('tailwind')
    expect(css).toContain('@import "uploadthing/tw/v4"')
    expect(css).toContain('@source')
    const sourcePath = css.match(/@source "([^"]+)"/)?.[1]
    expect(sourcePath).toBeDefined()
    expect(existsSync(resolve(fileURLToPath(new URL('./fixtures/tailwind/.nuxt', import.meta.url)), sourcePath!))).toBe(true)
    expect(readFileSync(packagedCssPath, 'utf-8')).toBe(packagedCss)
    expect(readFileSync(nuxtAugmentsPath, 'utf-8')).toBe(nuxtAugments)
  }, 120_000)

  it('registers default CSS only when Tailwind integration is disabled', async () => {
    const defaultNuxt = await loadNuxt({ cwd: fileURLToPath(new URL('./fixtures/default-styles', import.meta.url)), dev: true })
    try {
      expect(defaultNuxt.options.css).toContain('@uploadthing/vue/styles.css')
    }
    finally {
      await defaultNuxt.close()
    }

    const tailwindNuxt = await loadNuxt({ cwd: fileURLToPath(new URL('./fixtures/tailwind', import.meta.url)), dev: true })
    try {
      expect(tailwindNuxt.options.css).not.toContain('@uploadthing/vue/styles.css')
    }
    finally {
      await tailwindNuxt.close()
    }
  }, 120_000)
})
