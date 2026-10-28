// @vitest-environment jsdom
import { generateUploadButton } from '@uploadthing/vue'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'

describe('UploadThing hydration', () => {
  it('hydrates server-rendered markup without a mismatch', async () => {
    const fetchMock = vi.fn(async () => new Response('[]', {
      headers: { 'content-type': 'application/json' },
    }))
    const Button = generateUploadButton()
    const config = { endpoint: 'imageUploader', fetch: fetchMock }
    const html = await renderToString(createSSRApp(Button, { config }))
    const root = document.createElement('div')
    root.innerHTML = html
    document.body.append(root)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      const app = createSSRApp(Button, { config })
      app.mount(root)
      expect(root.querySelector('[data-ut-element="button"]')).not.toBeNull()
      expect(warn.mock.calls.flat().join(' ')).not.toMatch(/hydration.*mismatch/i)
      expect(error.mock.calls.flat().join(' ')).not.toMatch(/hydration.*mismatch/i)
      app.unmount()
    }
    finally {
      warn.mockRestore()
      error.mockRestore()
      root.remove()
    }
  })
})
