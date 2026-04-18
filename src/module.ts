import { defineNuxtModule, addServerHandler, createResolver, addComponent, addComponentsDir, addImports } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-uploadthing',
    configKey: 'uploadthing',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    addServerHandler({
      route: '/test',
      method: 'get',
      handler: resolver.resolve('./runtime/server/api/test.get'),
    })

    addComponent({
      name: 'UploadButtonTest',
      filePath: resolver.resolve('./runtime/upload-button.vue'),
      priority: 1,
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

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    // addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
