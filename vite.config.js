import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// If deploying to GitHub Pages under a repo path, set BASE in env, e.g. BASE=/TRU-Pronounce/
const base = process.env.BASE || '/'

export default defineConfig({
  base,
  plugins: [svelte()],
})
