import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import axios from "axios";

const Handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
 
  ],

callbacks: {
    async signIn({ user }) {
      try {
        await axios.post("http://localhost:5000/user/google-login", {
          email: user.email,
          name: user.name,
          image: user.image
        });

        return true;
      } catch (err) {
        console.error("❌ Google login backend error:", err.message);
        return false;
      }
    }
  }
  
});

export { Handler as GET, Handler as POST }