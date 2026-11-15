import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run dev` para desenvolver · `npm run build` gera dist/index.html único (abre direto no navegador)
export default defineConfig({ plugins: [react(), viteSingleFile()], server: { host: '0.0.0.0' } })
