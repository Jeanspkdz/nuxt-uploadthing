<script setup lang="ts">
const { isUploading, routeConfig, startUpload } = jp_useUploadThing('imageUploader')
</script>

<template>
  <div>
    <!-- <UploadThingUploadButton
      :config="{
        endpoint: 'imageUploader',
        onClientUploadComplete: (res) => {
          console.log('uploaded', res)
        },
        onUploadError: (err) => {
          console.error(err)
        },
      }"
    /> -->

    <!-- <UploadThingUploadDropzone
      :config="{
        endpoint: 'imageUploader',
        onClientUploadComplete: (res) => {
          console.log('uploaded', res)
        },
        onUploadError: (err) => {
          console.error(err)
        },
      }"
    /> -->

    <UploadButtonTest />
    Jeans
  </div>
</template>
