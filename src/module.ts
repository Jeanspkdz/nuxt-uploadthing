import { addComponent, addImports, addServerHandler, addTemplate, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { existsSync } from 'node:fs'
import { defu } from 'defu'
import { resolve } from 'node:path'

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
}

export default defineNuxtModule<ModuleOptions>().with({
  meta: {
    name: 'nuxt-uploadthing',
    configKey: 'uploadthing',
  },
  defaults: {
    fileRouterPath: '@@/server/uploadthing',
    fileRouterExport: 'fileRouter',
  },
  async setup(options, _nuxt) {
    const MODULE_NAME = 'nuxt-upt'
    const resolver = createResolver(import.meta.url)
    const logger = useLogger(MODULE_NAME)

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

    logger.warn(
      `Adding component RuntimeUploadButton`,
    )

    const runtimeUploadButtonTemplate = addTemplate({
      write: true,
      filename: 'runtime-upload-button.ts',
      getContents: () => `
import { generateUploadButton } from '@uploadthing/vue'
import type { FileRouter } from 'uploadthing/h3'
type RouterModule = typeof import('#jeans')
type RouterExport = ${JSON.stringify(options.fileRouterExport)}
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
      getContents: () => `
import { generateUploadDropzone } from '@uploadthing/vue'
import type { FileRouter } from 'uploadthing/h3'
type RouterModule = typeof import('#jeans')
type RouterExport = ${JSON.stringify(options.fileRouterExport)}
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
      getContents: () => `
import { generateVueHelpers } from '@uploadthing/vue'
import type { FileRouter } from 'uploadthing/h3'
type RouterModule = typeof import('#jeans')
type RouterExport = ${JSON.stringify(options.fileRouterExport)}
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
        as: 'jp_useUploadThing',
        from: uploadHelpersTemplate.dst,
      },
      {
        name: 'createUpload',
        as: 'jp_createUpload',
        from: uploadHelpersTemplate.dst,
      },
      {
        name: 'routeRegistry',
        as: 'jp_routeRegistry',
        from: uploadHelpersTemplate.dst,
      },
      {
        name: 'uploadFiles',
        as: 'jp_uploadFiles',
        from: uploadHelpersTemplate.dst,
      },
    ])

    const uploadthingHandlerTemplate = addTemplate({
      write: true,
      filename: 'nuxt-uploadthing/runtime/server/api/uploadthing.mjs',
      getContents: () => `
import { useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'
import { createRouteHandler } from 'uploadthing/h3'
import * as RouterModule from '#jeans'

const ROUTER_EXPORT = ${JSON.stringify(options.fileRouterExport)}

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

    // addComponent({
    //   name: 'RuntimeUploadButton',
    //   filePath: resolver.resolve('./runtime/runtime-upload-button.ts'),
    //   export: 'default',
    // })

    _nuxt.hook('builder:watch', (event, path) => {
      if (event !== 'add' && event !== 'unlink') {
        return
      }
      path = resolve(_nuxt.options.srcDir, path)
      if (path === fileRouterPathResolved || path.startsWith(fileRouterPathResolved)) {
        void _nuxt.hooks.callHook('restart', { hard: true })
      }
    })

    // 5. Register generated server handler
    addServerHandler({
      route: '/api/uploadthing',
      handler: uploadthingHandlerTemplate.dst,
    })
  },
})
