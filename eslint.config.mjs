// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
  dirs: {
    src: [
      './playground',
    ],
  },
})
  .append(
    {
      ignores: [
        'src/runtime/components/upload-button.ts',
        'src/runtime/components/upload-dropzone.ts',
        'src/runtime/server/api/uploadthing.ts',
        'src/runtime/utils/upload-helpers.ts',
      ],
    },
  )
