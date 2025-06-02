import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.error('Missing credentials');
            return null;
          }

          console.log('Raw message:', credentials.message);
          console.log('Raw signature:', credentials.signature);

          // Try to parse the message - it might already be a string or need JSON parsing
          let siweMessage;
          try {
            // First try to parse as JSON (if it's a stringified object)
            siweMessage = JSON.parse(credentials.message);
          } catch {
            // If that fails, assume it's already a SIWE message string
            siweMessage = credentials.message;
          }

          console.log('Parsed SIWE message:', siweMessage);

          const siwe = new SiweMessage(siweMessage);
          console.log('SIWE Object:', siwe);
          
          const result = await siwe.verify({
            signature: credentials.signature,
          });

          console.log('Verification result:', result);

          if (result.success) {
            return {
              id: siwe.address,
              name: siwe.address,
              email: `${siwe.address}@ethereum.local`,
            };
          }
          
          console.error('SIWE verification failed:', result);
          return null;
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.name = token.sub;
        session.address = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };