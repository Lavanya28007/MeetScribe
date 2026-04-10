"use client";
import React, { useState } from 'react'
import Link from 'next/link'

const HomePage = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen font-sans">

      {/* VIDEO MODAL */}
      {videoOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute -top-10 right-0 text-white/50 hover:text-white text-sm font-semibold transition-colors"
            >
              ✕ close
            </button>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800">
              <video
                className="w-full h-full"
                src="/video/demo.mp4"
                controls
                autoPlay
                muted
              />
              {/* Self-hosted alternative — swap iframe above for this:
              <video
                className="w-full h-full"
                src="/your-video.mp4"
                controls
                autoPlay
              /> */}
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="grid grid-cols-2 gap-10 px-20 py-20 items-center">
        <div>
          <span className="inline-flex items-center gap-2 border border-orange-500 text-orange-400 bg-orange-500/10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            AI-Powered Meeting Documentation
          </span>
          <h1 className="text-6xl font-black mt-8 leading-[1.05] tracking-tight">
            Turn Meetings into <br />
            <span className="text-orange-500">Clear, Actionable Notes</span>
          </h1>
          <p className="text-zinc-400 mt-6 max-w-md leading-relaxed text-base">
            MeetScribe transcribes your Google Meet calls, summarizes discussions, and generates
            professional documentation automatically — saved to your personal cloud dashboard.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/signup">
              <button className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-7 py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/30">
                Get Started Free →
              </button>
            </Link>
            <button
              onClick={() => setVideoOpen(true)}
              className="border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-all"
            >
              ▶ How It Works
            </button>
          </div>
        </div>

        {/* RIGHT — LIVE TRANSCRIPT PANEL */}
        <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Live Transcript</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              Recording
            </span>
          </div>
          <div className="space-y-3">
            {[
              { initials: "S1", name: "Speaker 1", color: "bg-orange-500", text: "Project discussion started..." },
              { initials: "S2", name: "Speaker 2", color: "bg-blue-500", text: "Timeline needs adjustment..." },
              { initials: "S3", name: "Speaker 3", color: "bg-emerald-500", text: "Action items assigned..." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 bg-[#1f1f1f] border border-zinc-800 rounded-xl p-3.5">
                <div className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                  {item.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-300">{item.name}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-[#1f1f1f] border border-zinc-800 rounded-xl p-4 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center text-xs">✦</span>
                <h4 className="font-bold text-sm">Key Summary</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">Main goals and decisions highlighted.</p>
            </div>
            <div className="bg-[#1f1f1f] border border-zinc-800 rounded-xl p-4 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center text-xs">✓</span>
                <h4 className="font-bold text-sm">Action Items</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">Tasks auto-generated by AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="bg-[#141414] px-20 py-14 grid grid-cols-3 gap-5 border-t border-zinc-900">
        {[
          { text: "Manual note-taking is slow", icon: "⏱", desc: "Professionals waste hours every week writing up what was said." },
          { text: "Important points get missed", icon: "⚠️", desc: "Key decisions and action items buried in conversation vanish." },
          { text: "Documentation takes hours", icon: "📄", desc: "Turning raw notes into polished docs takes time you don't have." },
        ].map((item, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-zinc-800 p-7 rounded-2xl hover:border-orange-500/40 hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-4">{item.icon}</div>
            <p className="font-bold text-base mb-2">{item.text}</p>
            <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" className="px-20 py-24 scroll-mt-20">
        <p className="text-center text-xs font-bold tracking-widest text-orange-500 uppercase mb-4">What We Offer</p>
        <h2 className="text-5xl font-black text-center mb-2 tracking-tight">Everything your team needs,</h2>
        <h2 className="text-5xl font-black text-center mb-16 tracking-tight text-orange-500">nothing you don't.</h2>

        <div className="grid grid-cols-3 gap-5">
          {[
            {
              name: "Live Transcription",
              icon: "🎙️",
              tag: "→ CORE",
              desc: "Real-time caption capture directly from your Google Meet call — no extra setup, no bots joining your meeting."
            },
            {
              name: "Smart Summaries",
              icon: "💬",
              tag: "→ AI",
              desc: "AI-powered extraction of key decisions, insights, and discussion themes — structured, not just summarized."
            },
            {
              name: "Action Items",
              icon: "✅",
              tag: "→ PRODUCTIVITY",
              desc: "Automatically detect and list tasks, owners, and deadlines from your meeting so nothing falls through the cracks."
            },
            {
              name: "Multi-Language Support",
              icon: "🌐",
              tag: "→ GLOBAL",
              desc: "Supports any language your Google Meet captions support — English, Hindi, Spanish, French, and many more."
            },
            {
              name: "Cloud Storage",
              icon: "☁️",
              tag: "→ STORAGE",
              desc: "Every summary is securely saved to your personal dashboard. Access your full meeting history anytime, from anywhere."
            },
            {
              name: "Secure & Private",
              icon: "🔒",
              tag: "→ SECURITY",
              desc: "Your data is tied to your account with JWT authentication. Only you can see your meeting summaries."
            },
          ].map((feature, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-7 hover:border-orange-500/50 hover:-translate-y-1 transition-all">
              <div className="text-3xl mb-5">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-3">{feature.name}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-5">{feature.desc}</p>
              <span className="text-xs font-bold text-orange-500 tracking-widest">{feature.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-20 py-24 text-center bg-[#141414] border-t border-zinc-900 scroll-mt-20">
        <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-4">How It Works</p>
        <h2 className="text-5xl font-black mb-2 tracking-tight">Up and running in</h2>
        <h2 className="text-5xl font-black mb-20 tracking-tight text-orange-500">under 60 seconds.</h2>

        <div className="flex justify-center items-start gap-0">
          {[
            { step: "Install Extension", icon: "🧩", desc: "Add MeetScribe to Chrome in one click. No account needed to start." },
            { step: "Join a Meet Call", icon: "📹", desc: "Open any Google Meet call and turn on captions (press C)." },
            { step: "Get Your Summary", icon: "✨", desc: "Click Summarize in the extension. AI structures your notes instantly." },
            { step: "View History", icon: "📋", desc: "All summaries saved to your dashboard. Search, review, and export anytime." },
          ].map((item, i, arr) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-4 w-44">
                <div className="border-2 border-orange-500 text-orange-500 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl">
                  {i + 1}
                </div>
                <div className="text-3xl">{item.icon}</div>
                <p className="font-bold text-sm">{item.step}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="h-px w-16 bg-gradient-to-r from-orange-500/60 to-orange-500/10 mt-7 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="px-20 py-24 bg-[#0f0f0f] border-t border-zinc-900 scroll-mt-20">
        <p className="text-center text-xs font-bold tracking-widest text-orange-500 uppercase mb-4">Who It's For</p>
        <h2 className="text-5xl font-black text-center mb-2 tracking-tight">Built for every team</h2>
        <h2 className="text-5xl font-black text-center mb-16 tracking-tight text-orange-500">that runs on meetings.</h2>

        <div className="grid grid-cols-2 gap-6">
          {[
            {
              role: "Product Teams",
              icon: "🚀",
              tag: "→ PRODUCT",
              headline: "Ship faster with zero documentation lag.",
              desc: "Auto-capture sprint planning decisions, feature discussions, and stakeholder feedback. Never lose a product requirement to a bad notes doc again.",
              points: ["Sprint retrospective summaries", "Feature requirement capture", "Stakeholder alignment docs"],
            },
            {
              role: "Sales Teams",
              icon: "💼",
              tag: "→ SALES",
              headline: "Close more deals. Forget note-taking.",
              desc: "Focus on the conversation. MeetScribe logs every customer objection, commitment, and follow-up — then structures it into a summary.",
              points: ["Call summaries & objection logs", "Auto follow-up action items", "Deal stage documentation"],
            },
            {
              role: "Engineering Teams",
              icon: "⚙️",
              tag: "→ ENGINEERING",
              headline: "Turn standups into structured updates.",
              desc: "Convert daily standups, architecture reviews, and incident post-mortems into clean, searchable documentation your whole team can reference.",
              points: ["Incident post-mortem reports", "Architecture decision records", "Standup digests"],
            },
            {
              role: "Executive & Leadership",
              icon: "🏛️",
              tag: "→ LEADERSHIP",
              headline: "Board-ready notes, automatically.",
              desc: "From all-hands to board meetings — get concise, professional minutes with key decisions and action owners highlighted for every stakeholder.",
              points: ["Board meeting minutes", "All-hands summaries", "OKR review documentation"],
            },
          ].map((uc, i) => (
            <div key={i} className="bg-[#141414] border border-zinc-800 rounded-2xl p-8 hover:border-orange-500/50 hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{uc.icon}</div>
                  <div>
                    <p className="font-black text-lg">{uc.role}</p>
                    <span className="text-xs font-bold text-orange-500 tracking-widest">{uc.tag}</span>
                  </div>
                </div>
              </div>
              <p className="font-bold text-base text-white mb-2">{uc.headline}</p>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">{uc.desc}</p>
              <ul className="space-y-2">
                {uc.points.map((point, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <span className="w-5 h-5 bg-orange-500/15 text-orange-500 rounded flex items-center justify-center text-xs shrink-0">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-20 py-24 text-center relative overflow-hidden bg-[#0f0f0f] border-t border-zinc-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
        <h2 className="text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight relative z-10">
          Start documenting your meetings <span className="text-orange-500">the smart way</span>
        </h2>
        <p className="text-zinc-400 mt-4 text-base relative z-10">
          Free to use. No credit card required. Works with Google Meet.
        </p>
        <Link href="/signup">
          <button className="mt-10 bg-orange-500 hover:bg-orange-400 text-black font-black px-10 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5 shadow-xl shadow-orange-500/30 relative z-10">
            Get Started Free →
          </button>
        </Link>
      </section>

    </div>
  );
};

export default HomePage;