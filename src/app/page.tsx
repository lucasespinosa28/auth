'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession } from 'next-auth/react';
import { useAccount } from 'wagmi';

export default function Home() {
  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <ConnectButton />
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            RainbowKit + NextAuth Demo
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
              <p>Wallet Connected: {isConnected ? 'Yes' : 'No'}</p>
              {address && <p>Address: {address}</p>}
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
              <p>Session Status: {status}</p>
              <p>Authenticated: {session ? 'Yes' : 'No'}</p>
              {session?.user && (
                <p>Authenticated Address: {session.user.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}