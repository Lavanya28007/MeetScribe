"use client";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NavBar = () => {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const loadUser = () => {
        const stored = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (stored && token) {
            try { setUser(JSON.parse(stored)); }
            catch { setUser(null); }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        loadUser();

        // Listen for login/logout events fired by login page and logout
        window.addEventListener("userChanged", loadUser);
        return () => window.removeEventListener("userChanged", loadUser);
    }, []);

    // Re-read user whenever the route changes (e.g. after login redirect)
    useEffect(() => {
        loadUser();
    }, [pathname]);

    const handleLogout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setMenuOpen(false);
        await signOut({ redirect: false });
        window.dispatchEvent(new Event("userChanged"));
        router.push("/");
    };

    return (
        <nav className="flex items-center justify-between px-20 py-4 border-b border-zinc-800 bg-[#0f0f0f] sticky top-0 z-50">
            <Link href="/">
                <h1 className="text-3xl font-semibold text-white">
                    Meet<span className="text-orange-500">Scribe</span>
                </h1>
            </Link>

            <div className="flex items-center gap-8">
                <Link href="/#features" className="text-zinc-400 hover:text-orange-500 transition-colors text-sm font-medium">Features</Link>
                <Link href="/#how-it-works" className="text-zinc-400 hover:text-orange-500 transition-colors text-sm font-medium">How it Works</Link>
                <Link href="/#use-cases" className="text-zinc-400 hover:text-orange-500 transition-colors text-sm font-medium">Use Cases</Link>

                {user ? (
                    <>
                        <Link href="/history" className="text-zinc-400 hover:text-orange-500 transition-colors text-sm font-medium">
                            History
                        </Link>
                        <Link href="/dashboard" className="text-zinc-400 hover:text-orange-500 transition-colors text-sm font-medium">
                            Dashboard
                        </Link>
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(o => !o)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt="avatar"
                                        className="w-9 h-9 rounded-full object-cover border-2 border-orange-500"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-sm border-2 border-orange-400">
                                        {(user.name || user.email || "U")[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="text-zinc-300 text-sm hidden sm:block">
                                    {user.name ? user.name.split(" ")[0] : user.email?.split("@")[0]}
                                </span>
                                <svg className={`w-3 h-3 text-zinc-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-[#161a22] border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-zinc-700">
                                        <p className="text-xs text-zinc-500">Signed in as</p>
                                        <p className="text-sm text-white font-medium truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-zinc-400 hover:text-orange-500 transition-colors text-sm font-medium">
                            Login
                        </Link>
                        <Link href="/signup">
                            <button className="bg-orange-500 text-black font-bold px-5 py-2 rounded-lg hover:bg-orange-400 transition-colors text-sm">
                                Get Started
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default NavBar;