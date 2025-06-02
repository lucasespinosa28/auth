import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import { RainbowKitSiweNextAuthProvider, GetSiweMessageOptions } from '@rainbow-me/rainbowkit-siwe-next-auth';
//import { getCsrfToken } from 'next-auth/react'; // Used on client, but shows what server expects

interface CustomUser extends NextAuthUser {
  address?: string;
  chainId?: number;
}

// TODO: Implement actual logic for getSiweMessageOptions if needed
const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign in with Ethereum to the app.',
});

export const authOptions: NextAuthOptions = {
  providers: [
    RainbowKitSiweNextAuthProvider({
      getSiweMessageOptions,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser; // Cast to CustomUser
        // When using RainbowKitSiweNextAuthProvider, the user object from authorize will directly contain id, address, chainId
        token.sub = customUser.id; // Ensure subject is set, typically the user's ID (address in this case)
        token.address = customUser.address;
        token.chainId = customUser.chainId;
      }
      return token;
    },
    async session({ session, token }) {
      const customSessionUser = session.user as CustomUser; // Cast to CustomUser
      // The token object will have address and chainId from the jwt callback
      customSessionUser.address = token.address as string;
      customSessionUser.chainId = token.chainId as number;
      if (token.sub) { // Set the user's ID from the token's subject
        customSessionUser.id = token.sub;
      }
      session.user = customSessionUser;
      return session;
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign-in attempts
  },
};
