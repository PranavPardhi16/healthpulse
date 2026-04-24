import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; 
import { cookies } from 'next/headers';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), 
  
  session: {
    strategy: 'jwt', 
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Demo Account',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const DEMO_CREDS = [
          { email: 'kavya.reddy@healthpulse.io', password: 'Doctor@HP2024', name: 'Dr. Kavya Reddy', role: 'doctor' },
          { email: 'sarah.chen@healthpulse.io', password: 'Patient@HP2024', name: 'Sarah Chen', role: 'patient' },
        ];

        const user = DEMO_CREDS.find(u => u.email === credentials?.email && u.password === credentials?.password);
        
        // Demo users aren't saved to the DB automatically, so we just return them for the session
        if (user) {
          return { id: user.email, name: user.name, email: user.email, role: user.role };
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // If 'user' exists, it means they just logged in
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }

      // 3. Handle Google Users: Read the cookie and save the role to the Database
      if (account?.provider === 'google' && !token.role) {
        const cookieStore = await cookies();
        const intendedRole = cookieStore.get('intended_role')?.value || 'patient';
        
        token.role = intendedRole;

        // Update the user record in Prisma with their chosen role
        if (token.email) {
          await prisma.user.update({
            where: { email: token.email },
            data: { role: intendedRole },
          });
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },

  // 4. Tell NextAuth exactly where your custom login page is
  pages: {
    signIn: '/', 
  },
};