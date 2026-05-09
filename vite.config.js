import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/users': 'http://localhost:5260',
      '/api/admin': 'http://localhost:5260',
      '/api/expenses': 'http://localhost:5227',
      '/api/incomes': 'http://localhost:5257',
      '/api/categories': 'http://localhost:5026',
      '/api/budgets': 'http://localhost:5138',
      '/api/reports': 'http://localhost:5191',
      '/api/notifications': 'http://localhost:5267',
    }
  }
})
