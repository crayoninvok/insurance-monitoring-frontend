import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import PwaRegister from '@/components/PwaRegister';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Insurance BDP Monitoring App',
    template: '%s | Insurance BDP Monitoring App',
  },
  description: 'Monitoring budget insurance PT Batara Dharma Persada.',
  applicationName: 'Insurance BDP Monitoring App',
  metadataBase: new URL('https://www.bataramining.com'),
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logobdp.png',
    apple: '/logobdp.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Insurance BDP',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
