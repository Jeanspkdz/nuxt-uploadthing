<script setup lang="ts">
</script>

<template>
  <div>
    Jeans
    <UploadThingUploadButton
      :config="{
        endpoint: 'pdfUploader',
        onClientUploadComplete: (res) => {
          console.log('Upload complete:', res)
        },

        onUploadError: (error) => {
          console.error('Upload error:', error.message)
        },
      }"
    />
  </div>
</template>
