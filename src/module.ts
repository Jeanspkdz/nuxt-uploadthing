import { addComponentsDir, addImports, addServerHandler, addTypeTemplate, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { existsSync } from 'node:fs'

// Module options TypeScript interface definition
export interface ModuleOptions {

  /**
   * Path to the file where your file router is defined.
   * Supports Nuxt aliases like `~` and `@`.
   * @default '~/server/uploadthing'
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

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-uploadthing',
    configKey: 'uploadthing',
  },
  defaults: {
    fileRouterPath: '~/server/uploadthing',
    fileRouterExport: 'fileRouter',
  },
  async setup(options, _nuxt) {
    const MODULE_NAME = 'nuxt-upt'
    const resolver = createResolver(import.meta.url)
    const logger = useLogger('JEANSPKDZ')

    const fileRouterPathResolved = await resolver.resolvePath(options.fileRouterPath)

    logger.warn(`Exits? ${existsSync(fileRouterPathResolved)}`)

    if (!options.fileRouterPath || !existsSync(fileRouterPathResolved)) {
      logger.warn(
        `[my-module] Could not find fileRouterPath: ${
          options.fileRouterPath || '(empty path)'
        }`,
      )

      return
    }

    addTypeTemplate({
      filename: `types/${MODULE_NAME}.d.ts`,
      getContents: () => `
declare module '${MODULE_NAME}' {
  type UploadthingUserModule = typeof import(${JSON.stringify(fileRouterPathResolved)})
  export type UserFileRouter = UploadthingUserModule[${JSON.stringify(options.fileRouterExport)}]
  export declare const ${options.fileRouterExport}: UploadthingUserModule[${JSON.stringify(options.fileRouterExport)}]
}
`,
      dst: resolver.resolve(`./runtime/generated/${MODULE_NAME}.d.ts`),
    })

    addServerHandler({
      handler: resolver.resolve('./runtime/server/api/uploadthing'),
      route: '/api/uploadthing',
    })

    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      prefix: 'UploadThing',
      pathPrefix: false,
      global: false,
    })

    const helpers = [
      'useUploadThing',
      'createUpload',
      'routeRegistry',
      'uploadFiles',
    ]

    addImports(
      helpers.map(name => ({
        as: `jp_${name}`,
        name,
        from: resolver.resolve('./runtime/utils/upload-helpers'),
      })),
    )
  },
})
