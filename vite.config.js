import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo name → served at https://<user>.github.io/click/
const REPO = 'click'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // In dev: serve at "/" so local dev URLs stay simple.
  // In build: prefix with the repo name so GH Pages resolves /click/assets/... correctly.
  base: command === 'build' ? `/${REPO}/` : '/',
}))
