import { createRouteHandler } from 'uploadthing/h3'
import { ourFileRouter } from 'nuxt-upt'

export default createRouteHandler({
  router: ourFileRouter,
  config: {
    // token: process.env.UPLOADTHING_TOKEN ?? runtimeConfig.uploadthing.token,
    token: process.env.UPLOADTHING_TOKEN ?? '',
  },
})
