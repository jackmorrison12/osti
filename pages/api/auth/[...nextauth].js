import NextAuth from "next-auth";
import Providers from "next-auth/providers";

const options = {
  site: process.env.NEXTAUTH_URL,
  session: {
    jwt: false,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  database: process.env.DATABASE_URL,
  secret: process.env.AUTH_SECRET,
  callbacks: {
    session: async (session, user) => {
      session.id = user.id;
      return Promise.resolve(session);
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
