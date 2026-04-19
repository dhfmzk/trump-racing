import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const REPOSITORY_NAME = 'trump-racing'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? `/${REPOSITORY_NAME}/` : '/',
}))
