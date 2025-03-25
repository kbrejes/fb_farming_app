import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from "@/components/Navbar";
import { ReactNode } from "react";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FB Farming App',
  description: 'Smart SMS solutions for mobile verification',
};

// Пункты меню навигации
const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/sms', label: 'SMS верификация' },
  { href: '/emulators', label: 'Эмуляторы' },
  { href: '/accounts', label: 'Аккаунты' },
  { href: '/automation', label: 'Автоматизация Facebook' },
  { href: '/settings', label: 'Настройки' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar items={navItems} />
        <main className="container mx-auto px-4">{children}</main>
      </body>
    </html>
  );
} 