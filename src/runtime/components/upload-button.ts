import { generateUploadButton } from '@uploadthing/vue'
import type { UserFileRouter } from 'nuxt-upt'

const UploadButtonGenerated = generateUploadButton<UserFileRouter>()

export {
  UploadButtonGenerated as default,
}
