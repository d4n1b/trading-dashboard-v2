import "next-auth"

declare module "next-auth" {
  interface User {
    id: number
    role: string
    username: string
    token: string
    expiresAt: string
    ttl: number
  }

  interface Session {
    user: User
    token: string
    expiresAt: string
    ttl: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number
    role: string
    username: string
    token: string
    expiresAt: string
    ttl: number
  }
}
