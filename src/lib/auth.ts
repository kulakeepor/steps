import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const LOCK_THRESHOLD = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

async function isLocked(user: { loginAttempts: number; lockUntil: Date | null }): Promise<boolean> {
  if (user.lockUntil && user.lockUntil > new Date()) {
    return true;
  }
  if (user.lockUntil && user.lockUntil <= new Date()) {
    // Reset lock if expired
    await prisma.user.update({
      where: { id: "" }, // Placeholder, will be updated in actual usage
      data: { loginAttempts: 0, lockUntil: null },
    });
  }
  return false;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("邮箱或密码错误");
        }

        if (user.deleted) {
          throw new Error("用户不存在");
        }

        if (!user.status) {
          throw new Error("账号已被禁用");
        }

        // Admins are not locked out
        const isAdmin = user.role === UserRole.ADMIN;
        if (!isAdmin && user.lockUntil && user.lockUntil > new Date()) {
          const remainingMinutes = Math.ceil(
            (user.lockUntil.getTime() - Date.now()) / 60000
          );
          throw new Error(`账号已锁定，请在 ${remainingMinutes} 分钟后重试`);
        }

        const isValidPassword = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isValidPassword) {
          // Increment login attempts for non-admin users
          if (!isAdmin) {
            const newAttempts = user.loginAttempts + 1;
            const updateData: {
              loginAttempts: number;
              lockUntil?: Date | null;
            } = { loginAttempts: newAttempts };

            if (newAttempts >= LOCK_THRESHOLD) {
              updateData.lockUntil = new Date(Date.now() + LOCK_TIME);
            }

            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            });

            if (newAttempts >= LOCK_THRESHOLD) {
              throw new Error("登录失败次数过多，账号已被锁定30分钟");
            }

            const remaining = LOCK_THRESHOLD - newAttempts;
            throw new Error(`密码错误，还剩 ${remaining} 次尝试机会`);
          }

          throw new Error("邮箱或密码错误");
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockUntil: null },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          steps: user.steps,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.steps = user.steps;
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.steps = token.steps as number;
      }
      return session;
    },
  },
});
