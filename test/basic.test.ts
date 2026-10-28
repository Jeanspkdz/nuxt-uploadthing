import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<div>basic</div>')
  })

  it('exposes the user file router at the UploadThing endpoint', async () => {
    const routes = await $fetch<Array<{ slug: string }>>('/api/uploadthing')
    expect(routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'imageUploader' }),
    ]))
  })

  it('rejects an invalid upload request', async () => {
    await expect($fetch('/api/uploadthing', {
      method: 'POST',
      body: { files: [] },
    })).rejects.toThrow()
  })
})
