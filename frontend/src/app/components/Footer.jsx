import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full bg-[#0f0f0f] border-t border-zinc-800 py-10 px-20">
      <div className="grid grid-cols-3 items-center gap-5">

        {/* BRAND */}
        <a href="#" className="text-xl font-semibold text-white no-underline">
          Meet<span className="text-orange-500">Scribe</span>
        </a>

        {/* LINKS */}
        <ul className="flex items-center justify-center gap-6 list-none">
          {[
            { label: "About Us", href: "/aboutus" },
            { label: "Contact Us", href: "/contactus" },
          ].map((link, i) => (
            <li key={i}>
              <a
                href={link.href}
                className="text-sm text-zinc-500 hover:text-orange-500 transition-colors no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* SOCIALS */}
        <div className="flex items-center justify-end gap-3">
          {/* Twitter / X */}
          <a
            href="#"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-orange-500 hover:text-orange-500 transition-all"
          >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 300 300"><path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59H300L178.57 127.15zm-36.26 41.26-11.87-16.62L36.16 19.54h40.69l76.2 106.72 11.87 16.62 99.05 138.64h-40.69l-80.97-113.11z"/></svg>
          </a>

          {/* GitHub */}
          <a
            href="#"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-orange-500 hover:text-orange-500 transition-all"
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </div>

      </div>

      {/* BOTTOM ROW */}
      <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
        <p className="text-xs text-zinc-600">© {new Date().getFullYear()} MeetScribe. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="text-xs text-zinc-600 hover:text-orange-500 transition-colors no-underline">Privacy Policy</a>
          <a href="#" className="text-xs text-zinc-600 hover:text-orange-500 transition-colors no-underline">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer;