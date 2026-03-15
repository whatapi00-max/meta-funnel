'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LegalLayout({ title, children }) {
  const [email, setEmail] = useState('support@billy777.com');

  useEffect(() => {
    async function loadEmail() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/public/content`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.contact_email) setEmail(data.contact_email);
        }
      } catch {
        // API unavailable — use default email
      }
    }
    loadEmail();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
          <Link href="/" className="shrink-0 text-blue-500 text-sm font-semibold">← Home</Link>
          <span className="font-bold text-sm text-gray-900 truncate">{title}</span>
        </header>

        {/* Content */}
        <div className="flex-1 px-5 py-5 text-sm text-gray-700 leading-relaxed overflow-y-auto">
          {typeof children === 'function' ? children(email) : children}
        </div>

        {/* Footer nav */}
        <footer className="px-4 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-[10px] text-blue-500">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span className="text-gray-300">·</span>
            <Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link>
            <span className="text-gray-300">·</span>
            <Link href="/disclaimer" className="hover:underline">Disclaimer</Link>
            <span className="text-gray-300">·</span>
            <a href={`mailto:${email}`} className="hover:underline">Contact Us</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
