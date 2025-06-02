import NextAuth from 'next-auth/next';
import { authOptions } from './authOptions';

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


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
