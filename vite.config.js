import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/predict': {
          target: env.API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/predict/, '/predict')
        }
      }
    }
  }
})
