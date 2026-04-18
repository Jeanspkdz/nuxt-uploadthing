import { generateVueHelpers } from '@uploadthing/vue'
import type { MyFileRouter } from '../utils/uploadthing'

export const { useUploadThing, createUpload, routeRegistry, uploadFiles } = generateVueHelpers<MyFileRouter>()
