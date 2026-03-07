import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import UnoCSS from 'unocss/vite'

export default defineConfig(() => {
  return {
    plugins: [
      UnoCSS(),
      qwikCity(),
      qwikVite(),
    ],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  }
})
