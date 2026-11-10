import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the same build works at a project path
  // (username.github.io/eNameCard/) and at a custom-domain root.
  base: './',
  build: {
    target: 'es2019',
    assetsInlineLimit: 0,
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
  },
});