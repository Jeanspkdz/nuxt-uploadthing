// import { createUploadthing, type FileRouter } from 'uploadthing/h3'

// const f = createUploadthing()

// export const adminFileRouter = {

//   imageUploader: f({
//     image: {
//       maxFileSize: '4MB',
//       maxFileCount: 1,
//       contentDisposition: 'inline',
//     },
//   }, { awaitServerData: true })
//     .middleware(async () => {
//       const user = 'playground'

//       if (!user) {
//         throw new Error('Unauthorized')
//       }

//       return { userId: user }
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       console.log('Image upload complete for userId:', metadata.userId)
//       console.log('image url', file.ufsUrl)

//       return { uploadedBy: metadata.userId }
//     }),

//   pdfUploader: f({
//     pdf: {
//       maxFileSize: '8MB',
//       maxFileCount: 1,
//       contentDisposition: 'inline',
//     },
//   }, { awaitServerData: true })
//     .middleware(async () => {
//       const user = 'playground'

//       if (!user) {
//         throw new Error('Unauthorized')
//       }

//       return { userId: user }
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       console.log('PDF upload complete for userId:', metadata.userId)
//       console.log('pdf url', file.ufsUrl)

//       return { uploadedBy: metadata.userId }
//     }),

// } satisfies FileRouter

// export type MyFileRouter = typeof adminFileRouter
