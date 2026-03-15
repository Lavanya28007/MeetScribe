'use client';

import axios from 'axios';
import { useFormik } from 'formik';
import React from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid Email').required('Required'),
  password: Yup.string().required('Password is required')
    .matches(/[a-z]/, 'At least one lowercase character')
    .matches(/[A-Z]/, 'At least one uppercase character')
    .matches(/[0-9]/, 'At least one number')
    .matches(/\W/, 'At least one special character'),
  confirmPassword: Yup.string().required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

const Signup = () => {
  const router = useRouter();

  const signupForm = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema: SignupSchema,
    onSubmit: (values, { resetForm, setSubmitting }) => {
      const { confirmPassword, ...payload } = values;
      axios.post('http://localhost:5000/user/register', payload)
        .then((result) => {
          toast.success("Registered successfully! Please sign in.");
          resetForm();
          // If backend returns token (future), save it
          if (result.data?.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify({
              _id: result.data._id,
              email: result.data.email,
              name: result.data.name || null,
              image: result.data.image || null,
            }));
            router.push('/');
          } else {
            // No token on register — redirect to login
            router.push('/login');
          }
        }).catch((err) => {
          console.log(err);
          toast.error("Something went wrong");
        }).finally(() => setSubmitting(false));
    },
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-white no-underline">
            Meet<span className="text-orange-500">Scribe</span>
          </a>
          <p className="text-zinc-500 text-sm mt-2">Create your account and start documenting smarter.</p>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-8 shadow-2xl">

          <h1 className="text-xl text-center font-black text-white mb-1 tracking-tight">Sign up</h1>
          <p className="text-sm text-center text-zinc-500 mb-7">
            Already have an account?{" "}
            <a href="/login" className="text-orange-500 font-semibold hover:text-orange-400 no-underline transition-colors">
              Sign in here
            </a>
          </p>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1a1a1a] border border-zinc-700 hover:border-orange-500/50 text-white text-sm font-medium rounded-xl transition-all mb-5"
          >
            <svg className="w-4 h-4 shrink-0" width="46" height="47" viewBox="0 0 46 47" fill="none">
              <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4"/>
              <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853"/>
              <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05"/>
              <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={signupForm.handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm text-zinc-400 mb-1.5 font-medium">Full Name</label>
              <input
                type="text" id="name" name="name"
                value={signupForm.values.name}
                onChange={signupForm.handleChange} onBlur={signupForm.handleBlur}
                placeholder="Jane Doe"
                className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30
                  ${signupForm.touched.name && signupForm.errors.name ? "border-red-500" : "border-zinc-700"}`}
              />
              {signupForm.touched.name && signupForm.errors.name && (
                <p className="text-xs text-red-500 mt-1.5">{signupForm.errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-zinc-400 mb-1.5 font-medium">Email address</label>
              <input
                type="email" id="email" name="email"
                value={signupForm.values.email}
                onChange={signupForm.handleChange} onBlur={signupForm.handleBlur}
                placeholder="you@example.com"
                className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30
                  ${signupForm.touched.email && signupForm.errors.email ? "border-red-500" : "border-zinc-700"}`}
              />
              {signupForm.touched.email && signupForm.errors.email && (
                <p className="text-xs text-red-500 mt-1.5">{signupForm.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm text-zinc-400 mb-1.5 font-medium">Password</label>
              <input
                type="password" id="password" name="password"
                value={signupForm.values.password}
                onChange={signupForm.handleChange} onBlur={signupForm.handleBlur}
                placeholder="••••••••"
                className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30
                  ${signupForm.touched.password && signupForm.errors.password ? "border-red-500" : "border-zinc-700"}`}
              />
              {signupForm.touched.password && signupForm.errors.password && (
                <p className="text-xs text-red-500 mt-1.5">{signupForm.errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-zinc-400 mb-1.5 font-medium">Confirm Password</label>
              <input
                type="password" id="confirmPassword" name="confirmPassword"
                value={signupForm.values.confirmPassword}
                onChange={signupForm.handleChange} onBlur={signupForm.handleBlur}
                placeholder="••••••••"
                className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30
                  ${signupForm.touched.confirmPassword && signupForm.errors.confirmPassword ? "border-red-500" : "border-zinc-700"}`}
              />
              {signupForm.touched.confirmPassword && signupForm.errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5">{signupForm.errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input id="remember-me" name="remember-me" type="checkbox"
                className="mt-0.5 w-4 h-4 shrink-0 border-zinc-700 rounded bg-[#1a1a1a] accent-orange-500" />
              <label htmlFor="remember-me" className="text-sm text-zinc-400 leading-relaxed">
                I accept the{" "}
                <a href="#" className="text-orange-500 hover:text-orange-400 no-underline transition-colors font-medium">Terms and Conditions</a>
              </label>
            </div>

            <button
              type="submit" disabled={signupForm.isSubmitting}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {signupForm.isSubmitting ? "Creating account..." : "Create Account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;