import { createUploadthing, type FileRouter } from 'uploadthing/h3'

const f = createUploadthing()

export const actualRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .onUploadComplete(() => ({ ok: true })),
} satisfies FileRouter
