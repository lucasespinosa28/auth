"use client";

"use client";

import type { ReactNode } from 'react';
import { SessionProvider, getCsrfToken, signIn, signOut } from 'next-auth/react';
import { RainbowKitProvider, darkTheme, getDefaultConfig, createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

// Ensure your WalletConnect Project ID is set in .env.local
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect functionality will be limited.");
}

const config = getDefaultConfig({
  appName: 'Web3AuthNextjs',
  projectId: walletConnectProjectId || "YOUR_PROJECT_ID", // Fallback to prevent build error, user must provide this
  chains: [mainnet, sepolia],
  ssr: true, 
});

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

const authenticationAdapter = createAuthenticationAdapter({
  getNonce: async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error('Failed to get nonce!');
    return nonce;
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum to the app.',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
    });
  },
  getMessageBody: ({ message }) => {
    return message.prepareMessage();
  },
  verifyMessage: async ({ message, signature }) => {
    try {
      const response = await signIn('siwe', { // Use "siwe" which is the default ID for RainbowKitSiweNextAuthProvider
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });
      if (!response?.ok) {
        console.error('SIWE verification failed:', response?.error);
        throw new Error(response?.error || 'Unknown error during SIWE verification');
      }
      return true;
    } catch (error) {
      console.error('Error verifying SIWE message:', error);
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
});


export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            authenticationAdapter={authenticationAdapter}
            theme={darkTheme({
              accentColor: 'hsl(var(--primary))', // Electric Purple
              accentColorForeground: 'hsl(var(--primary-foreground))', // White
              borderRadius: 'medium',
              fontStack: 'system',
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
