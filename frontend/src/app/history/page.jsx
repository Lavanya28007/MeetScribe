"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = "http://localhost:5000";

export default function HistoryPage() {
  const [summaries, setSummaries]   = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [starFilter, setStarFilter] = useState(false);
  const [expanded, setExpanded]     = useState({});
  const [deleting, setDeleting]     = useState(null);
  const [starring, setStarring]     = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    fetch(`${API_BASE}/user/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) { router.push("/login"); return null; }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const list = data.summaries || [];
        setSummaries(list);
        setFiltered(list);
      })
      .catch(() => setError("Could not reach server."))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      summaries.filter(s => {
        const matchSearch =
          s.meetingTitle.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q);
        const matchStar = starFilter ? !!s.starred : true;
        return matchSearch && matchStar;
      })
    );
  }, [search, starFilter, summaries]);

  const toggleCard = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleStar = async (e, id, currentlyStarred) => {
    e.stopPropagation();
    setStarring(id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/ai/tag/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ starred: !currentlyStarred })
      });
      if (res.ok) {
        setSummaries(prev =>
          prev.map(s => s._id === id ? { ...s, starred: !currentlyStarred } : s)
        );
      }
    } catch { /* silent */ }
    finally { setStarring(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this summary?")) return;
    setDeleting(id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/user/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSummaries(prev => prev.filter(s => s._id !== id));
    } catch { alert("Delete failed."); }
    finally { setDeleting(null); }
  };

  const exportTxt = (e, s) => {
    e.stopPropagation();
    const lines = [
      `Meeting: ${s.meetingTitle}`,
      `Date: ${formatDate(s.createdAt)}`,
      s.participants?.length ? `Participants: ${s.participants.join(", ")}` : null,
      s.tags?.length         ? `Tags: ${s.tags.join(", ")}` : null,
      ``,
      s.summary,
      s.actionItems?.length
        ? `\nAction Items:\n${s.actionItems.map(a => `- ${a}`).join("\n")}`
        : null,
      s.nextMeeting ? `\nNext Meeting: ${s.nextMeeting}` : null
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `${s.meetingTitle.replace(/\s+/g, "_")}_summary.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportAllTxt = () => {
    const content = filtered.map(s => [
      `═══════════════════════════════`,
      `Meeting: ${s.meetingTitle}`,
      `Date: ${formatDate(s.createdAt)}`,
      s.participants?.length ? `Participants: ${s.participants.join(", ")}` : null,
      ``,
      s.summary,
      s.actionItems?.length
        ? `\nAction Items:\n${s.actionItems.map(a => `- ${a}`).join("\n")}`
        : null,
      ``
    ].filter(Boolean).join("\n")).join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `MeetScribe_History_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
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

  const starredCount = summaries.filter(s => s.starred).length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      <div className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-orange-500 text-sm transition-colors no-underline"
        >
          ← Back to home
        </Link>
        {!loading && filtered.length > 0 && (
          <button
            onClick={exportAllTxt}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-orange-500 border border-zinc-700 hover:border-orange-500 px-3 py-1.5 rounded-lg transition-all"
          >
            📥 Export All .txt
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Meeting History</h1>
          <p className="text-zinc-500 text-sm">
            {loading
              ? "Loading..."
              : `${summaries.length} meeting${summaries.length !== 1 ? "s" : ""} recorded`}
          </p>
        </div>

        {!loading && summaries.length > 0 && (
          <div className="mb-6 flex gap-3 items-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Search by title or content..."
              className="flex-1 bg-[#161a22] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition-colors"
            />
            <button
              onClick={() => setStarFilter(f => !f)}
              title={starFilter ? "Show all" : "Starred only"}
              className={`flex items-center gap-1.5 text-sm px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
                starFilter
                  ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"
                  : "bg-[#161a22] border-zinc-700 text-zinc-500 hover:text-yellow-400 hover:border-yellow-500/40"
              }`}
            >
              {starFilter ? "★" : "☆"}
              {starredCount > 0 && <span className="text-xs font-medium">{starredCount}</span>}
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && summaries.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-zinc-400 text-base">No summaries yet.</p>
            <p className="text-zinc-600 text-sm mt-2">Join a Google Meet call and click Summarize in the extension.</p>
          </div>
        )}

        {!loading && !error && summaries.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-500 text-sm">
            {starFilter
              ? "No starred meetings yet. Star one below or from the extension."
              : `No results for "${search}"`}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {filtered.map(s => {
            const isOpen    = expanded[s._id];
            const isStarred = !!s.starred;
            const sections  = parseSummary(s.summary);

            return (
              <div
                key={s._id}
                className={`bg-[#161a22] border rounded-2xl overflow-hidden transition-colors ${
                  isStarred ? "border-yellow-500/30" : "border-zinc-800"
                }`}
              >
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#1c2028] transition-colors"
                  onClick={() => toggleCard(s._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{s.meetingTitle}</p>
                      {isStarred && <span className="text-yellow-400 text-xs flex-shrink-0">★</span>}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatDate(s.createdAt)}</p>
                    {s.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.tags.map(t => (
                          <span key={t} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                    {s.sentiment?.label && s.sentiment.label !== "neutral" && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        s.sentiment.label === "positive"
                          ? "bg-green-500/15 text-green-400"
                          : "bg-red-500/15 text-red-400"
                      }`}>
                        {s.sentiment.label}
                      </span>
                    )}

                    {s.actionItems?.length > 0 && (
                      <span className="text-xs bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded-full font-medium">
                        {s.actionItems.length} action{s.actionItems.length > 1 ? "s" : ""}
                      </span>
                    )}

                    <button
                      onClick={e => handleStar(e, s._id, isStarred)}
                      disabled={starring === s._id}
                      title={isStarred ? "Unstar" : "Star this meeting"}
                      className={`text-base px-1 bg-transparent border-none w-auto transition-colors disabled:opacity-40 ${
                        isStarred
                          ? "text-yellow-400 hover:text-zinc-500"
                          : "text-zinc-600 hover:text-yellow-400"
                      }`}
                    >
                      {starring === s._id ? "…" : isStarred ? "★" : "☆"}
                    </button>

                    <button
                      onClick={e => exportTxt(e, s)}
                      title="Export as .txt"
                      className="text-zinc-500 hover:text-orange-400 transition-colors text-sm px-1 bg-transparent border-none w-auto"
                    >
                      📥
                    </button>

                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(s._id); }}
                      disabled={deleting === s._id}
                      title="Delete"
                      className="text-zinc-600 hover:text-red-400 transition-colors text-lg px-1 bg-transparent border-none w-auto disabled:opacity-40"
                    >
                      {deleting === s._id ? "…" : "🗑"}
                    </button>

                    <span className={`text-zinc-500 text-xs transition-transform duration-200 inline-block ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-zinc-800">
                    {s.sentiment?.insight && (
                      <div className="mt-4 text-xs text-zinc-500 italic border-l-2 border-zinc-700 pl-3">
                        {s.sentiment.insight}
                      </div>
                    )}
                    {s.participants?.length > 0 && (
                      <p className="mt-3 text-xs text-zinc-500">
                        Participants: <span className="text-zinc-300">{s.participants.join(", ")}</span>
                      </p>
                    )}
                    {sections.length > 0 ? (
                      sections.map((sec, i) => (
                        <div key={i} className="mt-4">
                          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">{sec.heading}</p>
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
                    {s.actionItems?.length > 0 &&
                      !sections.find(sec => sec.heading.toLowerCase().includes("action")) && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">Action Items</p>
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
                    {s.nextMeeting && (
                      <p className="mt-4 text-xs text-zinc-500">
                        Next meeting: <span className="text-zinc-300">{s.nextMeeting}</span>
                      </p>
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