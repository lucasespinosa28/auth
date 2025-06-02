"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LockKeyhole, ShieldAlert, UserCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';


export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading your secure session...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
     // This will be brief as useEffect redirects, but good for SSR and initial render
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8">
        <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-6">
          You need to be authenticated to view this page.
        </p>
        <Button asChild variant="default">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <LockKeyhole className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Protected Content Area</CardTitle>
          <CardDescription className="text-lg">
            This page is only accessible to authenticated users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="p-6 bg-card-foreground/5 rounded-lg">
            <UserCheck className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold">Welcome, Verified User!</h3>
            <p className="text-muted-foreground mt-2">You have successfully authenticated with your Ethereum wallet.</p>
          </div>
          
          {session.user && (
            <div className="space-y-3 text-left bg-muted p-6 rounded-md">
              <p className="text-sm font-medium text-foreground">
                <strong>Wallet Address:</strong>
              </p>
              <p className="font-mono text-xs md:text-sm bg-background p-3 rounded break-all shadow-sm">{session.user.address}</p>
              <p className="text-sm font-medium text-foreground">
                <strong>Connected Chain ID:</strong> <span className="font-mono bg-background p-1 px-2 rounded shadow-sm">{session.user.chainId}</span>
              </p>
            </div>
          )}
          
          <Image 
            src="https://placehold.co/600x300/1A202C/8A65D9.png?text=Secure+Data" 
            alt="Secure Data Placeholder" 
            width={600} 
            height={300} 
            className="rounded-lg shadow-md mt-6 mx-auto"
            data-ai-hint="abstract security"
          />

          <Button asChild variant="outline" className="mt-8">
            <Link href="/">Go back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
