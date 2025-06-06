/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthOptions as NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';
// Determine the expected domain and origin for SIWE message verification.
// These should match the values you use in `getSiweMessageOptions` on the client-side.
// It's best to derive these from environment variables like NEXTAUTH_URL.
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const VERCEL_URL = process.env.VERCEL_URL;

export let expectedOrigin: string;
export let expectedDomain: string;

if (NEXTAUTH_URL) {
  expectedOrigin = NEXTAUTH_URL;
  expectedDomain = new URL(NEXTAUTH_URL).host;
} else if (VERCEL_URL) {
  // For Vercel deployments, VERCEL_URL provides the deployment URL
  expectedOrigin = `https://${VERCEL_URL}`;
  expectedDomain = VERCEL_URL; // VERCEL_URL is just the host for https
} else {
  // Fallback for local development
  expectedOrigin = 'http://localhost:3000/';
  expectedDomain = 'localhost:3000/';
  console.warn("Warning: NEXTAUTH_URL or VERCEL_URL not set. Falling back to http://localhost:3000 for SIWE verification. Ensure this is correct for your environment.");
}
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials', // Must match the id used by RainbowKitSiweNextAuthProvider
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
        console.log(credentials)
        // `req` is the standard Request object in Next.js App Router,
        // but its `headers` property might be a plain object in this callback.
        if (!credentials?.message || !credentials?.signature) {
          console.error('Authorize error: Missing credentials');
          return null;
        }

        try {
          const siweMessageString = credentials.message;
          console.log(siweMessageString)
          // The SiweMessage constructor can parse the raw SIWE message string.
          const siwe = new SiweMessage(siweMessageString);

          // 1. Verify CSRF token (nonce)
          // `getCsrfToken` expects an object with a `headers` property,
          // where `headers` is a plain object (like Node's IncomingHttpHeaders).
          // The error "req.headers.entries is not a function" suggests that
          // `req.headers` in this context is already such a plain object.
          // Ensure that this plain `req.headers` object contains the necessary `cookie` header string
          // for `getCsrfToken` to extract the server-side CSRF token.
          const serverSideNonce = await getCsrfToken({
            req: {
              headers: req.headers, // Pass req.headers directly.
              // This assumes req.headers is a plain object containing cookie information.
            } as any // Use `as any` to bypass strict typing for the shape of req for getCsrfToken
          });
          console.log(serverSideNonce)
          if (!serverSideNonce) {
            console.error('Authorize error: Could not retrieve CSRF token from server. Check cookie settings and if `getCsrfToken` received correct headers.');
            return null;
          }
          console.log(siwe)

          if (siwe.nonce !== serverSideNonce) {
            console.error(`Authorize error: Nonce mismatch. SIWE nonce: ${siwe.nonce}, Server nonce: ${serverSideNonce}`);
            return null;
          }

          // 2. Verify domain
          if (siwe.domain !== expectedDomain) {
            console.error(`Authorize error: Domain mismatch. SIWE domain: ${siwe.domain}, Expected domain: ${expectedDomain}`);
            return null;
          }

          // 3. Verify origin (uri)
          if (siwe.uri !== expectedOrigin) {
            console.error(`Authorize error: URI mismatch. SIWE URI: ${siwe.uri}, Expected URI: ${expectedOrigin}`);
            return null;
          }

          // 4. Verify the signature using the SIWE library
          const verificationResult = await siwe.verify({
            signature: credentials.signature,
            // time: new Date().toISOString(), // Optional: to verify against current time
            // provider: yourEthersProvider, // Optional: for chainId verification
          });

          if (!verificationResult.success) {
            console.error('Authorize error: SIWE message verification failed.', verificationResult.error);
            return null;
          }

          // If all checks pass, return the user object
          return {
            id: siwe.address,
          };

        } catch (error: any) {
          console.error('Authorize error: An unexpected error occurred during SIWE processing:', error.message || error);
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
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.name = token.sub;
        (session as any).address = token.sub;
      } else if (token.sub && !session.user) {
        session.user = { name: token.sub };
        (session as any).address = token.sub;
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
  debug: process.env.NODE_ENV === 'development',
  pages: {
    // signIn: '/custom-signin-page',
  }
};
