export default function manifest() {
  return {
    name: 'Plan Familiar',
    short_name: 'Familia',
    description: 'Menús, compra, ausencias y agenda semanal de la familia.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fff7ee',
    theme_color: '#ff6b4a',
    lang: 'es',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
