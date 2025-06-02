"use client";

import { signIn, signOut, useSession, getCsrfToken } from 'next-auth/react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export function AuthButton() {
    const { data: session, status } = useSession();
    const { address, chain, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        if (!isConnected || !address || !chain) {
            toast({
                title: 'Wallet Not Connected',
                description: 'Please connect your wallet first.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const nonce = await getCsrfToken();
            if (!nonce) {
                throw new Error('Failed to get nonce.');
            }

            const siweMessage = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in with Ethereum to Web3AuthNexus.',
                uri: window.location.origin,
                version: '1',
                chainId: chain.id,
                nonce,
            });

            const messageToSign = siweMessage.prepareMessage();
            const signature = await signMessageAsync({ message: messageToSign });

            const res = await signIn('credentials', {
                message: JSON.stringify(siweMessage),
                signature,
                redirect: false,
            });

            if (res?.error) {
                throw new Error(res.error);
            }
            toast({
                title: 'Signed In',
                description: 'Successfully signed in with Ethereum.',
            });
        } catch (error: any) {
            console.error('SIWE Error:', error);
            toast({
                title: 'Sign-In Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut({ redirect: false });
        if (isConnected) {
            disconnect();
        }
        toast({
            title: 'Signed Out',
            description: 'You have been signed out.',
        });
        setIsLoading(false);
    };

    // Effect to auto sign-out if wallet disconnects or address changes while signed in
    useEffect(() => {
        if (session && (!isConnected || session.user?.address !== address)) {
            signOut({ redirect: false });
            toast({
                title: 'Session Invalidated',
                description: 'Wallet disconnected or account changed. Please sign in again.',
                variant: 'destructive',
            });
        }
    }, [isConnected, address, session, toast]);


    if (status === 'loading') {
        return <Button variant="outline" size="sm" disabled>Loading...</Button>;
    }

    if (session) {
        return (
            <Button onClick={handleSignOut} variant="outline" size="sm" disabled={isLoading}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading ? 'Signing Out...' : 'Sign Out'}
            </Button>
        );
    }

    if (isConnected) {
        return (
            <Button onClick={handleSignIn} variant="default" size="sm" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? 'Signing In...' : 'Sign In with Ethereum'}
            </Button>
        );
    }

    // Wallet not connected, RainbowKit's ConnectButton handles this state.
    // This button could be hidden or show a prompt to connect wallet.
    return null;
}
