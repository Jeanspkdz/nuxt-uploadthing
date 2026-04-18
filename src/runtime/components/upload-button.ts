import { generateUploadButton } from '@uploadthing/vue'
import type { MyFileRouter } from '../utils/uploadthing'

const UploadButtonGenerated = generateUploadButton<MyFileRouter>()

export {
  UploadButtonGenerated as default,
}
