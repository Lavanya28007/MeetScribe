import Link from "next/link";
import React from 'react';

const NavBar = () => {
    return (
<nav className="flex items-center justify-between px-20 py-4 border-b border-border">
        <h1 className="text-2xl font-semibold">
             <Link href="/" >
          Meet<span className="text-primary">Scribe</span>
          </Link>
        </h1>
        <div className="flex items-center gap-8">
          <Link href="/features" className="hover:text-primary">Features</Link>
          <Link href="/how-it-works" className="hover:text-primary">How it Works</Link>
          <Link href="/use-cases" className="hover:text-primary">Use Cases</Link>
          <Link href="/login" className="hover:text-primary">Login</Link>
         <Link href="/signup"><button className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-[#fb6e2dd9]">
            Get Started
          </button></Link>
        </div>
      </nav>
    );
}
export default NavBar;

