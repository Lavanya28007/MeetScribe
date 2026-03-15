"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HistoryPage() {
  const [summaries, setSummaries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    fetch("http://localhost:5000/user/history", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) { router.push("/login"); return null; }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setSummaries(data.summaries || []);
        setFiltered(data.summaries || []);
      })
      .catch(() => setError("Could not reach server."))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      summaries.filter(s =>
        s.meetingTitle.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      )
    );
  }, [search, summaries]);

  const toggleCard = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async (id) => {
    if (!confirm("Delete this summary?")) return;
    setDeleting(id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/user/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSummaries(prev => prev.filter(s => s._id !== id));
    } catch {
      alert("Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const parseSummary = (text) => {
    if (!text) return [];
    const sections = [];
    let current = null;
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("## ")) {
        if (current) sections.push(current);
        current = { heading: line.slice(3), items: [] };
      } else if (line.startsWith("- ") && current) {
        current.items.push(line.slice(2));
      } else if (current) {
        current.items.push(line);
      }
    }
    if (current) sections.push(current);
    return sections;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ── Breadcrumb bar — no logo, just back link ── */}
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-orange-500 text-sm transition-colors no-underline"
        >
          ← Back to home
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Meeting History</h1>
          <p className="text-zinc-500 text-sm">
            {loading ? "Loading..." : `${summaries.length} meeting${summaries.length !== 1 ? "s" : ""} recorded`}
          </p>
        </div>

        {/* Search */}
        {!loading && summaries.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Search by title or content..."
              className="w-full bg-[#161a22] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && summaries.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-zinc-400 text-base">No summaries yet.</p>
            <p className="text-zinc-600 text-sm mt-2">
              Join a Google Meet call and click Summarize in the extension.
            </p>
          </div>
        )}

        {/* No search results */}
        {!loading && !error && summaries.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-500 text-sm">
            No results for "{search}"
          </div>
        )}

        {/* Cards */}
        <div className="flex flex-col gap-4">
          {filtered.map(s => {
            const isOpen = expanded[s._id];
            const sections = parseSummary(s.summary);
            return (
              <div
                key={s._id}
                className="bg-[#161a22] border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#1c2028] transition-colors"
                  onClick={() => toggleCard(s._id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{s.meetingTitle}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatDate(s.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {s.actionItems?.length > 0 && (
                      <span className="text-xs bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded-full font-medium">
                        {s.actionItems.length} action{s.actionItems.length > 1 ? "s" : ""}
                      </span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(s._id); }}
                      disabled={deleting === s._id}
                      className="text-zinc-600 hover:text-red-400 transition-colors text-lg px-1 bg-transparent border-none w-auto disabled:opacity-40"
                      title="Delete"
                    >
                      {deleting === s._id ? "…" : "🗑"}
                    </button>
                    <span className={`text-zinc-500 text-xs transition-transform duration-200 inline-block ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Card body */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-zinc-800">
                    {sections.length > 0 ? (
                      sections.map((sec, i) => (
                        <div key={i} className="mt-4">
                          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">
                            {sec.heading}
                          </p>
                          <ul className="space-y-1.5">
                            {sec.items.map((item, j) => (
                              <li key={j} className="flex gap-2 text-sm text-zinc-300">
                                <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p className="mt-4 text-sm text-zinc-400 whitespace-pre-wrap">{s.summary}</p>
                    )}

                    {s.actionItems?.length > 0 && !sections.find(sec => sec.heading.toLowerCase().includes("action")) && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">
                          Action Items
                        </p>
                        <ul className="space-y-1.5">
                          {s.actionItems.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm text-zinc-300">
                              <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}