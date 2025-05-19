import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { config } from "@/config";

const shouldRefreshToken = (token: JWT): boolean => {
  return Boolean(
    token.token &&
      token.expiresAt &&
      new Date(token.expiresAt).getTime() < Date.now() + 5 * 60 * 1000 // 5 minutes before expiry
  );
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const response = await fetch(`${config.API_URL}/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const data = await response.json();
          if (response.ok && data.token) {
            const user = {
              id: data.user.id,
              role: data.user.role,
              username: data.user.username,
              token: data.token,
              expiresAt: data.expiresAt,
              ttl: data.ttl,
            };
            return user;
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.token = user.token;
        token.userId = user.id;
        token.expiresAt = user.expiresAt;
        token.username = user.username;
        token.role = user.role;
        token.ttl = user.ttl;
      }

      if (shouldRefreshToken(token)) {
        try {
          const response = await fetch(`${config.API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            token.token = data.token;
            token.expiresAt = data.expiresAt;
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          return Promise.reject("RefreshAccessTokenError");
        }
      }

      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        token: token.token,
        expiresAt: token.expiresAt,
        userId: token.userId,
        user: {
          ...session.user,
          id: token.userId,
          username: token.username,
          role: token.role,
        },
      };
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour
  },
  debug: true,
};

export default NextAuth(authOptions);
