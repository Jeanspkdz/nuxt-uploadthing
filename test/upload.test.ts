// @vitest-environment jsdom
import { generateUploadButton } from '@uploadthing/vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

const routeConfig = [{
  slug: 'imageUploader',
  config: { image: { maxFileSize: '4MB', maxFileCount: 1 } },
}]

describe('file selection', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('accepts a selected file and reports it to the application', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(routeConfig), {
      headers: { 'content-type': 'application/json' },
    }))
    const onChange = vi.fn()
    const widget = mount(generateUploadButton(), {
      props: {
        config: {
          endpoint: 'imageUploader',
          fetch: fetchMock,
          config: { mode: 'manual' },
          onChange,
        },
      },
    })
    await vi.waitFor(() => expect(widget.attributes('data-state')).toBe('ready'))
    const file = new File(['image'], 'cover.png', { type: 'image/png' })
    const input = widget.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })

    await input.trigger('change')

    expect(onChange).toHaveBeenCalledWith([file])
    expect(widget.text()).toContain('Upload 1 file')
    expect(fetchMock).toHaveBeenCalledOnce()
    widget.unmount()
  })

  it('sends file metadata to the upload endpoint and reports a rejected request', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return new Response(JSON.stringify({ message: 'Upload rejected' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      }
      return new Response(JSON.stringify(routeConfig), {
        headers: { 'content-type': 'application/json' },
      })
    })
    const onUploadError = vi.fn()
    const widget = mount(generateUploadButton(), {
      props: { config: { endpoint: 'imageUploader', fetch: fetchMock, onUploadError } },
    })
    await vi.waitFor(() => expect(widget.attributes('data-state')).toBe('ready'))
    const file = new File(['image'], 'cover.png', { type: 'image/png' })
    const input = widget.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })

    await input.trigger('change')

    await vi.waitFor(() => expect(onUploadError).toHaveBeenCalledOnce())
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(post).toBeDefined()
    expect(JSON.stringify(post?.[1]?.body)).toContain('cover.png')
    widget.unmount()
  })

  it('reports a completed upload after a mocked file transfer', async () => {
    class MockXMLHttpRequest extends EventTarget {
      upload = new EventTarget()
      status = 200
      response = { ufsUrl: 'https://example.test/cover.png', serverData: { ok: true } }

      open() {}
      setRequestHeader() {}
      abort() {}
      send() {
        queueMicrotask(() => this.dispatchEvent(new Event('load')))
      }
    }
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest)
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return new Response(JSON.stringify([{
          url: 'https://example.test/upload',
          key: 'cover-key',
          customId: null,
        }]), { headers: { 'content-type': 'application/json' } })
      }
      if (init?.method === 'HEAD') return new Response(null, { status: 200 })
      return new Response(JSON.stringify(routeConfig), {
        headers: { 'content-type': 'application/json' },
      })
    })
    const onClientUploadComplete = vi.fn()
    const widget = mount(generateUploadButton(), {
      props: { config: { endpoint: 'imageUploader', fetch: fetchMock, onClientUploadComplete } },
    })
    await vi.waitFor(() => expect(widget.attributes('data-state')).toBe('ready'))
    const file = new File(['image'], 'cover.png', { type: 'image/png' })
    const input = widget.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })

    await input.trigger('change')

    await vi.waitFor(() => expect(onClientUploadComplete).toHaveBeenCalledOnce())
    expect(onClientUploadComplete.mock.calls[0]?.[0]).toEqual([
      expect.objectContaining({ name: 'cover.png', key: 'cover-key', ufsUrl: 'https://example.test/cover.png' }),
    ])
    widget.unmount()
  })
})
