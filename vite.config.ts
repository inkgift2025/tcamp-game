import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/tcamp-game/' : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
