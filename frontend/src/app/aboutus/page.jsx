import React from 'react'

const AboutUs = () => {
  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen font-sans">

      {/* HERO */}
      <section className="px-20 py-24 relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-72 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 border border-orange-500 text-orange-400 bg-orange-500/10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            Who We Are
          </span>

          <h1 className="text-6xl font-black leading-[1.05] tracking-tight mt-4">
            Welcome to <span className="text-orange-500">MeetScribe</span>
          </h1>

          <p className="text-zinc-400 mt-6 text-lg leading-relaxed max-w-2xl mx-auto">
            Your intelligent meeting companion designed to make every conversation more
            <span className="text-white font-semibold"> productive</span>,
            <span className="text-white font-semibold"> organized</span>, and
            <span className="text-white font-semibold"> meaningful</span>.
          </p>
        </div>
      </section>

      {/* INTRO PARAGRAPH */}
      <section className="bg-[#141414] border-t border-zinc-900 px-20 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-zinc-400 text-base leading-loose">
            In today's digital world, meetings happen fast and ideas flow constantly. Important points, decisions, and action items can easily be forgotten or overlooked. MeetScribe solves this problem by automatically capturing live captions, generating accurate transcripts, and transforming discussions into clear, structured summaries — so you can stay focused on the conversation instead of worrying about taking notes.
          </p>
        </div>
      </section>

      {/* 3 CONTENT BLOCKS */}
      <section className="px-20 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-6">

          {/* Mission */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-10 hover:border-orange-500/40 transition-all group">
            <div className="flex items-start gap-6">
              <div className="text-4xl shrink-0">🎯</div>
              <div>
                <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">→ MISSION</span>
                <h2 className="text-2xl font-black mt-2 mb-4 tracking-tight">Our Mission</h2>
                <p className="text-zinc-400 leading-relaxed text-base">
                  Our mission is simple: help people save time and never miss important information from meetings. We aim to remove the stress of manual note-taking and replace it with smart automation that highlights key insights, tasks, and decisions in real time.
                </p>
              </div>
            </div>
          </div>

          {/* What We Do */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-10 hover:border-orange-500/40 transition-all group">
            <div className="flex items-start gap-6">
              <div className="text-4xl shrink-0">⚙️</div>
              <div>
                <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">→ PRODUCT</span>
                <h2 className="text-2xl font-black mt-2 mb-4 tracking-tight">What We Do</h2>
                <p className="text-zinc-400 leading-relaxed text-base">
                  MeetScribe listens to your meetings and converts spoken conversations into organized knowledge. From transcripts to summaries and actionable highlights, our platform ensures that every meeting becomes a valuable resource you can revisit anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Why MeetScribe */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-10 hover:border-orange-500/40 transition-all group">
            <div className="flex items-start gap-6">
              <div className="text-4xl shrink-0">💡</div>
              <div>
                <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">→ WHY US</span>
                <h2 className="text-2xl font-black mt-2 mb-4 tracking-tight">Why MeetScribe</h2>
                <p className="text-zinc-400 leading-relaxed text-base">
                  We believe technology should work for you, not distract you. That's why MeetScribe is built to run quietly in the background while delivering powerful insights in seconds. Whether you're a student, professional, or team leader, MeetScribe helps you stay informed, prepared, and productive.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-[#141414] border-t border-zinc-900 px-20 py-14">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "40+", label: "Languages Supported" },
            { value: "99.2%", label: "Transcription Accuracy" },
            { value: "10k+", label: "Meetings Documented" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-8 hover:border-orange-500/40 transition-all">
              <p className="text-4xl font-black text-orange-500 mb-2">{stat.value}</p>
              <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-20 py-24 text-center relative overflow-hidden border-t border-zinc-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
        <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-5 relative z-10">Get Started</p>
        <h2 className="text-4xl font-black tracking-tight max-w-2xl mx-auto leading-tight relative z-10">
          Meet smarter. Capture everything. <br />
          <span className="text-orange-500">Miss nothing.</span>
        </h2>
        <p className="text-zinc-500 mt-4 text-sm relative z-10">— with MeetScribe</p>
        <div className="mt-10 flex items-center justify-center gap-4 relative z-10">
          <a href="/signup">
            <button className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5">
              Get Started Free →
            </button>
          </a>
          <a href="/#features">
            <button className="border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all">
              See Features
            </button>
          </a>
        </div>
      </section>

    </div>
  )
}

export default AboutUs;