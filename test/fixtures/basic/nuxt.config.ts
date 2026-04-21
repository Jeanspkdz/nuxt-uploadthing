import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  uploadthing: {
    fileRouterPath: '~/server/uploadthing',
    fileRouterExport: 'ourFileRouter',
  },
})
