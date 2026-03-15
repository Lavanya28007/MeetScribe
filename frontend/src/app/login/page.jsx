"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useSession, signIn, signOut } from "next-auth/react";

const LoginSchema = Yup.object({
  email: Yup.string().email("Invalid Email").required("Email required"),
  password: Yup.string().required("Password required"),
});

// Send token to Chrome extension after login
const syncTokenToExtension = (token, user) => {
  try {
    // Post a message to the page — content script picks it up and forwards to extension
    window.postMessage({ type: "MEETSCRIBE_LOGIN", token, user }, "*");
  } catch (e) {
    // Extension may not be installed — that's fine
  }
};

const Login = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user && status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user) {
      setGoogleLoading(true);
      axios.post("http://localhost:5000/user/google-login", {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      })
        .then(res => {
          if (res.data?.token) {
            const userData = {
              _id: res.data.user._id,
              email: res.data.user.email,
              name: res.data.user.name || null,
              image: res.data.user.image || null,
            };
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(userData));
            syncTokenToExtension(res.data.token, userData);
          }
          window.dispatchEvent(new Event("userChanged"));
          router.push("/");
        })
        .catch(() => {
          setGoogleLoading(false);
          toast.error("Google login failed. Try again.");
          setReady(true);
        });
      return;
    }

    setReady(true);
  }, [status, session, router]);

  const handleSwitchAccount = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    await signOut({ redirect: false });
    window.postMessage({ type: "MEETSCRIBE_LOGOUT" }, "*");
    setReady(true);
  };

  const loginForm = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await axios.post("http://localhost:5000/user/authenticate", values);
        toast.success("Login successful 🎉");
        if (res.data?.token) {
          const userData = {
            _id: res.data._id,
            email: res.data.email,
            name: res.data.name || null,
            image: res.data.image || null,
          };
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(userData));
          syncTokenToExtension(res.data.token, userData);
        }
        window.dispatchEvent(new Event("userChanged"));
        router.push("/");
      } catch {
        toast.error("Invalid email or password");
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (status === "loading" || googleLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">{googleLoading ? "Signing you in..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-white no-underline">
            Meet<span className="text-orange-500">Scribe</span>
          </a>
          <p className="text-zinc-500 text-sm mt-2">Welcome back. Sign in to continue.</p>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-black text-white mb-1 tracking-tight">Sign in</h1>
          <p className="text-sm text-zinc-500 mb-7">
            Don't have an account?{" "}
            <a href="/signup" className="text-orange-500 font-semibold hover:text-orange-400 no-underline transition-colors">Sign up</a>
          </p>

          <div className="mb-5 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700 flex items-center justify-between">
            <p className="text-xs text-zinc-400">Signed in previously? You can switch accounts.</p>
            <button onClick={handleSwitchAccount} className="text-xs text-orange-500 hover:text-orange-400 font-medium ml-3 whitespace-nowrap bg-transparent border-none w-auto px-0">
              Switch →
            </button>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1a1a1a] border border-zinc-700 hover:border-orange-500/50 text-white text-sm font-medium rounded-xl transition-all mb-5"
          >
            <svg className="w-4 h-4 shrink-0" width="46" height="47" viewBox="0 0 46 47" fill="none">
              <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4"/>
              <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853"/>
              <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05"/>
              <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={loginForm.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Email</label>
              <input type="email" name="email"
                value={loginForm.values.email} onChange={loginForm.handleChange} onBlur={loginForm.handleBlur}
                placeholder="you@example.com"
                className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 ${loginForm.touched.email && loginForm.errors.email ? "border-red-500" : "border-zinc-700"}`}
              />
              {loginForm.touched.email && loginForm.errors.email && <p className="text-xs text-red-500 mt-1.5">{loginForm.errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-zinc-400 font-medium">Password</label>
                <a href="#" className="text-xs text-orange-500 hover:text-orange-400 no-underline transition-colors">Forgot password?</a>
              </div>
              <input type="password" name="password"
                value={loginForm.values.password} onChange={loginForm.handleChange} onBlur={loginForm.handleBlur}
                placeholder="••••••••"
                className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 ${loginForm.touched.password && loginForm.errors.password ? "border-red-500" : "border-zinc-700"}`}
              />
              {loginForm.touched.password && loginForm.errors.password && <p className="text-xs text-red-500 mt-1.5">{loginForm.errors.password}</p>}
            </div>

            <button type="submit" disabled={loginForm.isSubmitting}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loginForm.isSubmitting ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;