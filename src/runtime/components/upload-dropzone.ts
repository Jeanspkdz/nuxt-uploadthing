import { generateUploadDropzone } from '@uploadthing/vue'
import type { MyFileRouter } from '../utils/uploadthing'

const UploadDropzonenGenerated = generateUploadDropzone<MyFileRouter>()

export {
  UploadDropzonenGenerated as default,
}
