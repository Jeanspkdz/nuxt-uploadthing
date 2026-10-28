import { join } from 'node:path'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  uploadthing: {
    fileRouterPath: join(import.meta.dirname, 'server', 'uploadthing.ts'),
    fileRouterExport: 'customRouter',
    componentPrefix: 'Demo',
  },
})
