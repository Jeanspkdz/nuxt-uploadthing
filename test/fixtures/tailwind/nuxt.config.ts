import { join } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  css: [join(import.meta.dirname, 'app', 'assets', 'main.css')],
  vite: { plugins: [tailwindcss()] },
  uploadthing: {
    useTailwindStyles: true,
  },
})
