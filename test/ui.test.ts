import { generateUploadButton, generateUploadDropzone } from '@uploadthing/vue'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { describe, expect, it } from 'vitest'

const config = { endpoint: 'imageUploader' }

describe('UploadThing UI', () => {
  it('renders the upload button with UploadThing selectors and a file input', async () => {
    const html = await renderToString(createSSRApp(generateUploadButton(), { config }))

    expect(html).toContain('data-ut-element="button"')
    expect(html).toContain('data-ut-element="allowed-content"')
    expect(html).toContain('type="file"')
    expect(html).toContain('data-state="disabled"')
    expect(html).toContain('data-[state=ready]:bg-blue-600')
  })

  it('renders the dropzone with UploadThing selectors and a file input', async () => {
    const html = await renderToString(createSSRApp(generateUploadDropzone(), { config }))

    expect(html).toContain('data-ut-element="upload-icon"')
    expect(html).toContain('type="file"')
    expect(html).toContain('data-state="disabled"')
    expect(html).toContain('data-[state=ready]:bg-blue-600')
  })

  it('keeps custom classes on the rendered upload button', async () => {
    const html = await renderToString(createSSRApp(generateUploadButton(), {
      config: { ...config, class: 'my-upload-widget' },
    }))

    expect(html).toContain('my-upload-widget')
    expect(html).toContain('data-ut-element="button"')
  })
})
