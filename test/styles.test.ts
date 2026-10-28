import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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
    expect(readFileSync(packagedCssPath, 'utf-8')).toContain('@import "#build/uploadthing-tw.css"')
  })

  it('generates the default-style placeholder in the Nuxt build directory', () => {
    const packagedCss = readFileSync(packagedCssPath, 'utf-8')
    const nuxtAugments = readFileSync(nuxtAugmentsPath, 'utf-8')
    expect(prepareFixture('basic')).toContain('Tailwind styles are disabled')
    expect(readFileSync(packagedCssPath, 'utf-8')).toBe(packagedCss)
    expect(readFileSync(nuxtAugmentsPath, 'utf-8')).toBe(nuxtAugments)
  })

  it('generates Tailwind styles in the Nuxt build directory', () => {
    const packagedCss = readFileSync(packagedCssPath, 'utf-8')
    const nuxtAugments = readFileSync(nuxtAugmentsPath, 'utf-8')
    const css = prepareFixture('tailwind')
    expect(css).toContain('@import "uploadthing/tw/v4"')
    expect(css).toContain('@source')
    expect(readFileSync(packagedCssPath, 'utf-8')).toBe(packagedCss)
    expect(readFileSync(nuxtAugmentsPath, 'utf-8')).toBe(nuxtAugments)
  })
})
