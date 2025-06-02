"use client";

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
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

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
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
