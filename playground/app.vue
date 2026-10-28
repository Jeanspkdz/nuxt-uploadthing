<script setup lang="ts">
</script>

<template>
  <div>
    Jeans
    <UploadThingUploadButton
      :config="{
        endpoint: 'pdfUploader',
        onClientUploadComplete: (res: unknown) => {
          console.log('Upload complete:', res)
        },

        onUploadError: (error: Error) => {
          console.error('Upload error:', error.message)
        },
      }"
    />
  </div>
</template>
