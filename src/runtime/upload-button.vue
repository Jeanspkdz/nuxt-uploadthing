<template>
  <div>
    <input
      type="file"
      accept="image/*"
      :disabled="isUploading"
      @change="onFileChange"
    >

    <button
      type="button"
      :disabled="isUploading || !selectedFile"
      @click="uploadFile"
    >
      {{ isUploading ? 'Uploading...' : 'Upload image' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { generateVueHelpers } from '@uploadthing/vue'
import type { MyFileRouter } from './utils/uploadthing'

const { useUploadThing } = generateVueHelpers<MyFileRouter>()

const selectedFile = ref<File | null>(null)

const { isUploading, startUpload } = useUploadThing('imageUploader', {
  onClientUploadComplete(files) {
    console.log('Upload complete:', files)
  },
  onUploadError(error) {
    console.error('Upload failed:', error)
  },
})

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

async function uploadFile() {
  if (!selectedFile.value) return

  await startUpload([selectedFile.value])
}
</script>
