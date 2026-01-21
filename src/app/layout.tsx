import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Life Calendar - Visualize Your Life in Weeks',
  description: 'A beautiful visualization of your life in weeks. See how many weeks you have lived and how many are yet to come.',
  keywords: ['life calendar', 'weeks of life', 'life visualization', 'mortality awareness', 'time tracker'],
  openGraph: {
    title: 'Life Calendar - Visualize Your Life in Weeks',
    description: 'A beautiful visualization of your life in weeks.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
