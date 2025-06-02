"use client";

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ShieldCheck } from 'lucide-react'; // Abstract/geometric icon example

export function Navbar() {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-accent transition-colors">
          <ShieldCheck className="h-7 w-7" />
          <span>Web3AuthNexus</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/protected" className="text-sm hover:text-accent transition-colors">
            Protected Page
          </Link>
          <ConnectButton 
            chainStatus="icon" 
            showBalance={false} 
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />
        </nav>
      </div>
    </header>
  );
}
