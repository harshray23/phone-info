
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // CSS variable for Inter
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'TraceIt - Phone Number Info',
  description: 'Trace and get details for any phone number with TraceIt.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning={true}>
      <head>
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
