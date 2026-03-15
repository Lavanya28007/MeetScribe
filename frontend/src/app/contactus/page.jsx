'use client';

import React, { useState } from 'react';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with your API call
    setSubmitted(true);
  };

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen font-sans">

      {/* HERO */}
      <section className="px-20 py-24 relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-72 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 border border-orange-500 text-orange-400 bg-orange-500/10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            Get In Touch
          </span>
          <h1 className="text-6xl font-black leading-[1.05] tracking-tight mt-4">
            We'd love to <span className="text-orange-500">hear from you.</span>
          </h1>
          <p className="text-zinc-400 mt-6 text-base leading-relaxed">
            Have a question, feedback, or just want to say hello? Drop us a message and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="px-20 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-5 gap-8">

          {/* LEFT — CONTACT INFO */}
          <div className="col-span-2 flex flex-col gap-5">

            {[
              {
                icon: "📧",
                tag: "→ EMAIL",
                label: "Email Us",
                value: "hello@meetscribe.ai",
                sub: "We reply within 24 hours.",
              },
              {
                icon: "💬",
                tag: "→ SUPPORT",
                label: "Support",
                value: "support@meetscribe.ai",
                sub: "For technical help & bugs.",
              },
              {
                icon: "🌍",
                tag: "→ LOCATION",
                label: "Based In",
                value: "Remote — Worldwide",
                sub: "Available across all timezones.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 hover:border-orange-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0">{item.icon}</div>
                  <div>
                    <span className="text-xs font-bold text-orange-500 tracking-widest">{item.tag}</span>
                    <p className="font-bold text-sm mt-1">{item.label}</p>
                    <p className="text-zinc-300 text-sm mt-0.5 font-medium">{item.value}</p>
                    <p className="text-zinc-600 text-xs mt-1">{item.sub}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Social */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 hover:border-orange-500/40 transition-all">
              <span className="text-xs font-bold text-orange-500 tracking-widest">→ SOCIALS</span>
              <p className="font-bold text-sm mt-1 mb-4">Follow Us</p>
              <div className="flex gap-3">
                {[
                  {
                    label: "Twitter",
                    svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 300 300"><path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59H300L178.57 127.15zm-36.26 41.26-11.87-16.62L36.16 19.54h40.69l76.2 106.72 11.87 16.62 99.05 138.64h-40.69l-80.97-113.11z"/></svg>,
                  },
                  {
                    label: "GitHub",
                    svg: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>,
                  },
                ].map((s, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-500 hover:border-orange-500 hover:text-orange-500 transition-all"
                  >
                    {s.svg}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className="col-span-3 bg-[#141414] border border-zinc-800 rounded-2xl p-8">

            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
                <div className="text-5xl">🎉</div>
                <h2 className="text-2xl font-black tracking-tight">Message sent!</h2>
                <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-4 border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-500 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <span className="text-xs font-bold text-orange-500 tracking-widest">→ CONTACT FORM</span>
                <h2 className="text-xl font-black tracking-tight mt-2 mb-7">Send us a message</h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="What's this about?"
                      className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5 font-medium">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help..."
                      className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
                  >
                    Send Message →
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};

export default ContactUs;