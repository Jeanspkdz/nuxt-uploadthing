import type { Resolver } from '@nuxt/kit'
import { addComponent, addImports, addServerHandler, addTemplate, createResolver, defineNuxtModule, useLogger, useNuxt } from '@nuxt/kit'
import { defu } from 'defu'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

const MODULE_NAME = 'nuxt-uploadthing'
const logger = useLogger(MODULE_NAME)

// Module options TypeScript interface definition
export interface ModuleOptions {

  /**
   * Path to the file where your file router is defined.
   * Supports Nuxt aliases like `~` and `@`.
   * @default '@@/server/uploadthing'
   */
  fileRouterPath: string

  /**
   * Name of the exported file router from `fileRouterPath`.
   * @default 'fileRouter'
   * @example
   * // server/uploadthing.ts
   * export const fileRouter = createUploadthing()({ ... })
   */
  fileRouterExport: string
  useTailwindStyles: boolean
}

export default defineNuxtModule<ModuleOptions>().with({
  meta: {
    name: 'nuxt-uploadthing',
    configKey: 'uploadthing',
  },
  defaults: {
    fileRouterPath: '@@/server/uploadthing',
    fileRouterExport: 'fileRouter',
    useTailwindStyles: false,
  },
  async setup(options, _nuxt) {
    const resolver = createResolver(import.meta.url)
    const fileRouterPathResolved = await resolver.resolvePath(options.fileRouterPath)

    const currentConfig = (_nuxt.options.runtimeConfig.uploadthing ?? {}) as Partial<ModuleOptions>
    _nuxt.options.runtimeConfig.uploadthing = defu(
      currentConfig,
      options,
    )

    if (!existsSync(fileRouterPathResolved)) {
      logger.warn(
        `To use uploadthing, please create a router file at \`${options.fileRouterPath}\`.`,
      )

      _nuxt.options.alias['#jeans'] = resolver.resolve(
        './runtime/server/router',
      )
    }
    else {
      _nuxt.options.alias['#jeans'] = fileRouterPathResolved
    }

    applyUploadthingStyles()

    generateUploadthingArtifacts({
      resolver,
      fileRouterExport: options.fileRouterExport,
    })

    _nuxt.hook('builder:watch', (event, path) => {
      if (event !== 'add' && event !== 'unlink') {
        return
      }
      path = resolve(_nuxt.options.srcDir, path)
      if (path === fileRouterPathResolved || path.startsWith(fileRouterPathResolved)) {
        void _nuxt.hooks.callHook('restart', { hard: true })
      }
    })
  },
})

function applyUploadthingStyles() {
  const nuxt = useNuxt()
  const uploadthingOptions = nuxt.options.uploadthing
  if (!uploadthingOptions) {
    return
  }
  const useTailwindStyles = uploadthingOptions.useTailwindStyles
  const rootDir = nuxt.options.rootDir
  const resolveTwPath = join(rootDir, 'node_modules/tailwindcss')
  const isTailwindInstalled = existsSync(resolveTwPath)

  if (useTailwindStyles && !isTailwindInstalled) {
    logger.warn(
      '[nuxt-uploadthing] `useTailwindStyles` is enabled, but `tailwind` is not installed. Falling back to default UploadThing CSS.',
    )
    return registerUploadthingCss()
  }

  if (useTailwindStyles && isTailwindInstalled) {
    logger.info('[nuxt-uploadthing] Using UploadThing Tailwind CSS integration')

    const dist = resolveUploadthingVueDist()
    logger.warn('VUE_DIST', dist)

    if (!dist) {
      logger.warn(
        '[nuxt-uploadthing] Could not resolve `@uploadthing/vue/dist` for Tailwind source scanning. Falling back to default UploadThing CSS.',
      )
      return registerUploadthingCss()
    }

    return registerUploadthingTailwindCss(dist)
  }

  logger.info('[nuxt-uploadthing] Using UploadThing default CSS')
  return registerUploadthingCss()
}

function registerUploadthingCss() {
  const nuxt = useNuxt()
  return nuxt.options.css.push('@uploadthing/vue/styles.css')
}

function registerUploadthingTailwindCss(distPath: string) {
  const cssTemplate = addTemplate({
    write: true,
    filename: 'uploadthing-tw.css',
    getContents: () =>
      `@import "uploadthing/tw/v4";\n@source "${toCssPath(distPath)}";\n`,
  })

  const nuxt = useNuxt()
  nuxt.options.css.push(cssTemplate.dst)
}

function resolveUploadthingVueDist(): string | null {
  try {
    const nuxt = useNuxt()
    const _require = createRequire(import.meta.url)
    const packageJsonPath = _require.resolve('@uploadthing/vue/package.json', { paths: [nuxt.options.rootDir] })
    const distPath = join(dirname(packageJsonPath), 'dist')
    return existsSync(distPath) ? distPath : null
  }
  catch {
    return null
  }
}

function toCssPath(path: string): string {
  return path.replace(/\\/g, '/')
}

type GenerateUploadthingArtifacts = {
  resolver: Resolver
  fileRouterExport: ModuleOptions['fileRouterExport']
}
function generateUploadthingArtifacts({ fileRouterExport, resolver }: GenerateUploadthingArtifacts) {
  const runtimeUploadButtonTemplate = addTemplate({
    write: true,
    filename: 'runtime-upload-button.ts',
    dst: resolver.resolve('./runtime/components/runtime-upload-button.ts'),
    getContents: () => `
import { generateUploadButton } from '@uploadthing/vue'
import type { FileRouter } from 'uploadthing/h3'
type RouterModule = typeof import('#jeans')
type RouterExport = ${JSON.stringify(fileRouterExport)}
type UserFileRouter =
  RouterExport extends keyof RouterModule
    ? RouterModule[RouterExport] extends FileRouter
      ? RouterModule[RouterExport]
      : FileRouter
    : FileRouter
const RuntimeUploadButton = generateUploadButton<UserFileRouter>()
export default RuntimeUploadButton
`,
  })

  addComponent({
    name: 'RuntimeUploadButton',
    filePath: runtimeUploadButtonTemplate.dst,
    export: 'default',
  })

  const runtimeUploadDropzoneTemplate = addTemplate({
    write: true,
    filename: 'runtime-upload-dropzone.ts',
    dst: resolver.resolve('./runtime/components/runtime-upload-dropzone.ts'),
    getContents: () => `
import { generateUploadDropzone } from '@uploadthing/vue'
import type { FileRouter } from 'uploadthing/h3'
type RouterModule = typeof import('#jeans')
type RouterExport = ${JSON.stringify(fileRouterExport)}
type UserFileRouter =
  RouterExport extends keyof RouterModule
    ? RouterModule[RouterExport] extends FileRouter
      ? RouterModule[RouterExport]
      : FileRouter
    : FileRouter
const RuntimeUploadDropzone = generateUploadDropzone<UserFileRouter>()
export default RuntimeUploadDropzone
`,
  })

  addComponent({
    name: 'RuntimeUploadDropzone',
    filePath: runtimeUploadDropzoneTemplate.dst,
    export: 'default',
  })

  const uploadHelpersTemplate = addTemplate({
    write: true,
    filename: 'upload-helpers.ts',
    dst: resolver.resolve('./runtime/utils/upload-helpers.ts'),
    getContents: () => `
import { generateVueHelpers } from '@uploadthing/vue'
import type { FileRouter } from 'uploadthing/h3'
type RouterModule = typeof import('#jeans')
type RouterExport = ${JSON.stringify(fileRouterExport)}
type UserFileRouter =
  RouterExport extends keyof RouterModule
    ? RouterModule[RouterExport] extends FileRouter
      ? RouterModule[RouterExport]
      : FileRouter
    : FileRouter

const helpers = generateVueHelpers<UserFileRouter>()

export const useUploadThing = helpers.useUploadThing
export const createUpload = helpers.createUpload
export const routeRegistry = helpers.routeRegistry
export const uploadFiles = helpers.uploadFiles
`,
  })

  addImports([
    {
      name: 'useUploadThing',
      from: uploadHelpersTemplate.dst,
    },
    {
      name: 'createUpload',
      from: uploadHelpersTemplate.dst,
    },
    {
      name: 'routeRegistry',
      from: uploadHelpersTemplate.dst,
    },
    {
      name: 'uploadFiles',
      from: uploadHelpersTemplate.dst,
    },
  ])

  const uploadthingHandlerTemplate = addTemplate({
    write: true,
    dst: resolver.resolve('./runtime/server/api/uploadthing.ts'),
    // filename: 'nuxt-uploadthing/runtime/server/api/uploadthing.mjsts',
    filename: 'uploadthing.ts',
    getContents: () => `
import { useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'
import { createRouteHandler } from 'uploadthing/h3'
import * as RouterModule from '#jeans'

const ROUTER_EXPORT = ${JSON.stringify(fileRouterExport)}

const emptyStringToUndefined = (obj) => {
  const next = {}
  for (const key in obj) {
    next[key] = obj[key] === '' ? undefined : obj[key]
  }
  return next
}

export default defineEventHandler((event) => {
  const runtime = useRuntimeConfig()
  const config = emptyStringToUndefined(runtime.uploadthing ?? {})

  const router = RouterModule[ROUTER_EXPORT]
  if (!router) {
    throw new Error('[nuxt-uploadthing] Router export not found: ' + ROUTER_EXPORT)
  }

  return createRouteHandler({
    router,
    config,
  })(event)
})
`,
  })

  // Register generated server handler
  addServerHandler({
    route: '/api/uploadthing',
    handler: uploadthingHandlerTemplate.dst,
  })
}
