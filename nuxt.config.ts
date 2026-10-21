import books from './app/data/books.json'

const routes = ['/', '/cari', '/tanda']
for (const b of books as any[]) {
  routes.push(`/${b.key}`)
  for (const c of b.chapters) routes.push(`/${b.key}/${c.slug}`)
}

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },
  modules: ['@vite-pwa/nuxt'],
  css: ['@fontsource-variable/mulish', '~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Akhirnya Umroh',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Buku pegangan manasik & buku doa umroh dalam genggaman.' },
        { name: 'theme-color', content: '#0e4f45' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'apple-touch-icon', href: '/icon-192.png' },
      ],
    },
  },
  nitro: {
    prerender: { routes, crawlLinks: true },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Akhirnya Umroh — Pegangan & Doa',
      short_name: 'Akhirnya Umroh',
      description: 'Buku pegangan manasik & buku doa umroh',
      lang: 'id',
      theme_color: '#0e4f45',
      background_color: '#f7f3ea',
      display: 'standalone',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/200.html',
      ignoreURLParametersMatching: [/.*/],
      globPatterns: ['**/*.{js,css,html,json,svg,png,woff2}'],
      globIgnores: ['books/**'],
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/books/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'book-images',
            expiration: { maxEntries: 5000, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
    },
    client: { installPrompt: false },
  },
})
