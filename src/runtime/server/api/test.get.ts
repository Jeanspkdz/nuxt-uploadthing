import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  return {
    test: 'my Event Handler',
  }
})
