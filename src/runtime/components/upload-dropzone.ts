import { generateUploadDropzone } from '@uploadthing/vue'
import type { UserFileRouter } from 'nuxt-upt'

const UploadDropzonenGenerated = generateUploadDropzone<UserFileRouter>()

export {
  UploadDropzonenGenerated as default,
}
