import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// On `vite build` the app is served from the GitHub Pages project subpath;
// `vite dev` stays at root for local development.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/claude-code-remote/' : '/',
  plugins: [react()],
}))
