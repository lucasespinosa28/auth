"use client";

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheck, LogIn, UserCircle, KeyRound } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      <div className="relative w-48 h-48 mb-6">
         <Image src="https://placehold.co/300x300/1A202C/BE52F2.png?text=W3N" alt="Web3AuthNexus Logo" layout="fill" objectFit="cover" className="rounded-full shadow-2xl border-4 border-primary" data-ai-hint="abstract geometric logo" />
      </div>
      <h1 className="text-5xl font-bold tracking-tight">
        Welcome to <span className="text-primary">Web3AuthNexus</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        Seamlessly authenticate using your Ethereum wallet. Experience the future of secure, decentralized sign-in with RainbowKit, SIWE, and NextAuth.js.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full pt-8">
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Connect Your Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Easily connect your favorite Ethereum wallet using RainbowKit. A wide range of wallets supported for your convenience.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              Sign-In with Ethereum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Authenticate by signing a message with your wallet (SIWE). Prove ownership without passwords.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-primary" />
              Access Secure Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Once authenticated, gain access to protected areas and features exclusive to signed-in users.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <div className="pt-8">
        {status === 'loading' && <p className="text-accent">Loading session...</p>}
        {status === 'authenticated' && session?.user && (
          <Card className="max-w-md mx-auto text-left">
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>You are signed in as:</p>
              <p className="font-mono text-sm bg-muted p-2 rounded break-all">{session.user.address}</p>
              <p>Chain ID: <span className="font-mono text-sm bg-muted p-1 rounded">{session.user.chainId}</span></p>
              <Button asChild variant="default" className="mt-4 w-full">
                <Link href="/protected">
                  <LogIn className="mr-2 h-4 w-4" /> Go to Protected Page
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {status === 'unauthenticated' && (
          <p className="text-lg text-accent">
            Please connect your wallet and sign in to access all features.
          </p>
        )}
      </div>
    </div>
  );
}
