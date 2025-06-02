import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import { getCsrfToken } from 'next-auth/react'; // Used on client, but shows what server expects
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CustomUser extends NextAuthUser {
  id: string; // Database ID
  address?: string;
  chainId?: number;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.error('Missing credentials for SIWE');
            return null;
          }

          const siweMessage = new SiweMessage(JSON.parse(credentials.message));
          
          // The nonce used in siweMessage should ideally be verified against a server-issued one.
          // NextAuth's CSRF token is used as this nonce on the client.
          // Here, we primarily verify the signature and message integrity.
          // NextAuth handles CSRF protection internally when signIn is called from the client.
          
          const verificationResult = await siweMessage.verify(
            {
              signature: credentials.signature as `0x${string}`,
              // If you were managing nonces server-side strictly:
              // nonce: expectedNonceFromServerSession, 
            },
            { suppressExceptions: true }
          );

          if (!verificationResult.success) {
            console.error('SIWE verification failed:', verificationResult.error);
            return null;
          }
          
          // verificationResult.data contains the validated SIWE message fields
          const { address, chainId } = verificationResult.data;

          const user = await prisma.user.upsert({
            where: { address: address },
            update: { updatedAt: new Date() }, // Update timestamp or other relevant fields
            create: { address: address }, // chainId is not part of User model directly
          });
          // The user object from prisma will have id, address, createdAt, updatedAt
          // We need to return an object that matches CustomUser for NextAuth
          return {
            id: user.id,      // This is now the DB ID
            address: user.address,
            chainId: chainId, // Use chainId from SIWE message for the session
          };
        } catch (e) {
          console.error('Error in SIWE authorize:', e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser; // user is the output from authorize
        token.id = customUser.id; // Add database ID to token
        token.address = customUser.address;
        token.chainId = customUser.chainId;
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure session.user is properly typed if it's not already
      const sessionUser = session.user as CustomUser;
      sessionUser.id = token.id as string; // Add id from token
      sessionUser.address = token.address as string;
      sessionUser.chainId = token.chainId as number;
      session.user = sessionUser; // Assign back to session.user
      return session;
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign-in attempts
  },
};
