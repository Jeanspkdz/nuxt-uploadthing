import { generateVueHelpers } from '@uploadthing/vue'
import type { UserFileRouter } from 'nuxt-upt'

export const { useUploadThing, createUpload, routeRegistry, uploadFiles } = generateVueHelpers<UserFileRouter>()
