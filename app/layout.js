import './globals.css';

export const metadata = {
  title: 'Plan Familiar',
  description: 'Menús, compra, ausencias y agenda semanal de la familia.',
  applicationName: 'Plan Familiar',
  appleWebApp: { capable: true, title: 'Familia', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: '/apple-touch-icon.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff7ee' },
    { media: '(prefers-color-scheme: dark)', color: '#181310' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
