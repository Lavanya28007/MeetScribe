"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Config ───────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fmtDuration(mins) {
  if (!mins) return "—";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function sentimentColor(label) {
  if (label === "positive") return { bg: "#166534", text: "#dcfce7" };
  if (label === "negative") return { bg: "#7f1d1d", text: "#fee2e2" };
  return { bg: "#3f3f46", text: "#e4e4e7" };
}

// ─── Sub-components ───────────────────────────────────────
function StatCard({ label, value, sub, accent = false }) {
  return (
    <div
      style={{
        background: accent ? "#f97316" : "#161a22",
        border: "1px solid #27272a",
        borderRadius: "14px",
        padding: "20px 22px",
        minWidth: 0,
      }}
    >
      <p
        style={{
          fontSize: "12px",
          color: accent ? "#431407" : "#71717a",
          marginBottom: "8px",
          fontWeight: 500,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: accent ? "#000" : "#fff",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontSize: "12px",
            color: accent ? "#431407" : "#52525b",
            marginTop: "6px",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function SentimentBar({ positive, neutral, negative }) {
  const total = positive + neutral + negative || 1;
  const pct = (n) => Math.round((n / total) * 100);
  return (
    <div>
      <div
        style={{
          display: "flex",
          height: "8px",
          borderRadius: "4px",
          overflow: "hidden",
          gap: "2px",
          marginBottom: "10px",
        }}
      >
        <div style={{ width: `${pct(positive)}%`, background: "#16a34a", borderRadius: "4px 0 0 4px" }} />
        <div style={{ width: `${pct(neutral)}%`, background: "#3f3f46" }} />
        <div style={{ width: `${pct(negative)}%`, background: "#dc2626", borderRadius: "0 4px 4px 0" }} />
      </div>
      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#71717a" }}>
        <span><span style={{ color: "#4ade80" }}>●</span> {pct(positive)}% positive</span>
        <span><span style={{ color: "#a1a1aa" }}>●</span> {pct(neutral)}% neutral</span>
        <span><span style={{ color: "#f87171" }}>●</span> {pct(negative)}% negative</span>
      </div>
    </div>
  );
}

function MeetingRow({ meeting, onClick }) {
  const sc = sentimentColor(meeting.sentiment?.label);
  return (
    <div
      onClick={() => onClick(meeting)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 90px 80px 90px 36px",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        borderBottom: "1px solid #18181b",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#18181b")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#fff",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {meeting.meetingTitle || "Untitled"}
        </p>
        <p style={{ fontSize: "12px", color: "#52525b", margin: "3px 0 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {meeting.tags?.slice(0, 3).map((t) => (
            <span key={t} style={{ color: "#f97316" }}>
              #{t}
            </span>
          ))}
        </p>
      </div>
      <span style={{ fontSize: "12px", color: "#71717a" }}>{fmtDate(meeting.createdAt)}</span>
      <span style={{ fontSize: "12px", color: "#71717a" }}>{fmtDuration(meeting.duration)}</span>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          padding: "3px 10px",
          borderRadius: "20px",
          background: sc.bg,
          color: sc.text,
          textAlign: "center",
        }}
      >
        {meeting.sentiment?.label || "—"}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
}

function MeetingDrawer({ meeting, onClose }) {
  if (!meeting) return null;
  const sc = sentimentColor(meeting.sentiment?.label);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
      />
      <div
        style={{
          position: "relative",
          width: "min(480px, 95vw)",
          height: "100%",
          background: "#0f0f0f",
          borderLeft: "1px solid #27272a",
          overflowY: "auto",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
              {meeting.meetingTitle}
            </h2>
            <p style={{ fontSize: "12px", color: "#52525b", margin: 0 }}>
              {fmtDate(meeting.createdAt)} · {fmtDuration(meeting.duration)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#71717a",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {meeting.sentiment?.label && (
          <div
            style={{
              background: "#161a22",
              border: "1px solid #27272a",
              borderRadius: "10px",
              padding: "14px 16px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#52525b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Sentiment
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: sc.bg,
                  color: sc.text,
                  fontWeight: 500,
                }}
              >
                {meeting.sentiment.label}
              </span>
              <span style={{ fontSize: "12px", color: "#71717a" }}>
                score: {meeting.sentiment.score?.toFixed(2)}
              </span>
            </div>
            {meeting.sentiment.insight && (
              <p style={{ fontSize: "13px", color: "#a1a1aa", margin: 0, lineHeight: 1.6 }}>
                {meeting.sentiment.insight}
              </p>
            )}
          </div>
        )}

        {meeting.participants?.length > 0 && (
          <div>
            <p style={{ fontSize: "11px", color: "#52525b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Participants
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {meeting.participants.map((p) => (
                <div
                  key={p}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "#161a22",
                    border: "1px solid #27272a",
                    borderRadius: "20px",
                    padding: "4px 12px 4px 6px",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#f97316",
                      color: "#000",
                      fontSize: "10px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(p)}
                  </div>
                  <span style={{ fontSize: "13px", color: "#d4d4d8" }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {meeting.actionItems?.length > 0 && (
          <div>
            <p style={{ fontSize: "11px", color: "#52525b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Action items
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {meeting.actionItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    fontSize: "13px",
                    color: "#a1a1aa",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "#f97316", flexShrink: 0, marginTop: "2px" }}>→</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {meeting.tags?.length > 0 && (
          <div>
            <p style={{ fontSize: "11px", color: "#52525b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tags
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {meeting.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "12px",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    background: "#1c1917",
                    border: "1px solid #292524",
                    color: "#f97316",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {meeting.summary && (
          <div>
            <p style={{ fontSize: "11px", color: "#52525b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Summary
            </p>
            <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
              {meeting.summary.slice(0, 600)}{meeting.summary.length > 600 ? "…" : ""}
            </p>
          </div>
        )}

        <Link
          href={`/history`}
          style={{
            marginTop: "auto",
            display: "block",
            textAlign: "center",
            padding: "11px",
            borderRadius: "10px",
            border: "1px solid #27272a",
            color: "#f97316",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          View full meeting →
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [range, setRange] = useState("all");
  const [search, setSearch] = useState("");
  const [sentFilter, setSentFilter] = useState("all");

  // ── Auth guard ──
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
    setChecked(true);
  }, []);

  // ── Fetch summaries ──
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/user/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load meetings");
      const data = await res.json();
      setSummaries(data.summaries || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (checked && user) fetchData();
  }, [checked, user, fetchData]);

  // ── Derived stats ──
  const filtered = summaries.filter((s) => {
    const now = Date.now();
    const days = range === "7" ? 7 : range === "30" ? 30 : range === "90" ? 90 : null;
    if (days && now - new Date(s.createdAt).getTime() > days * 86400000) return false;
    if (sentFilter !== "all" && s.sentiment?.label !== sentFilter) return false;
    if (search && !s.meetingTitle?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalMeetings = filtered.length;
  const avgDuration = filtered.length
    ? Math.round(filtered.reduce((a, s) => a + (s.duration || 0), 0) / filtered.length)
    : 0;
  const avgParticipants = filtered.length
    ? (filtered.reduce((a, s) => a + (s.participants?.length || 0), 0) / filtered.length).toFixed(1)
    : 0;

  const sentCounts = filtered.reduce(
    (acc, s) => {
      const l = s.sentiment?.label || "neutral";
      acc[l] = (acc[l] || 0) + 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const positivePct = totalMeetings
    ? Math.round((sentCounts.positive / totalMeetings) * 100)
    : 0;

  const participantFreq = {};
  filtered.forEach((s) => {
    s.participants?.forEach((p) => {
      participantFreq[p] = (participantFreq[p] || 0) + 1;
    });
  });
  const topParticipants = Object.entries(participantFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxFreq = topParticipants[0]?.[1] || 1;

  const avatarColors = ["#1d4ed8", "#15803d", "#b45309", "#7c3aed", "#be185d"];

  if (!checked || !user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #18181b",
          padding: "24px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
            Analytics{" "}
            <span style={{ color: "#f97316" }}>Dashboard</span>
          </h1>
          <p style={{ fontSize: "13px", color: "#52525b", margin: "4px 0 0" }}>
            Welcome back, {user.name?.split(" ")[0] || user.email?.split("@")[0]}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", "7", "30", "90"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: range === r ? "#f97316" : "#27272a",
                background: range === r ? "#431407" : "transparent",
                color: range === r ? "#f97316" : "#71717a",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: range === r ? 600 : 400,
              }}
            >
              {r === "all" ? "All time" : `${r}d`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: "1280px", margin: "0 auto" }}>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#fecaca",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "24px",
              fontSize: "13px",
            }}
          >
            {error} —{" "}
            <button
              onClick={fetchData}
              style={{ color: "#fca5a5", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              retry
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <StatCard label="Total meetings" value={loading ? "…" : totalMeetings} accent />
          <StatCard label="Avg duration" value={loading ? "…" : fmtDuration(avgDuration)} sub="per meeting" />
          <StatCard label="Avg participants" value={loading ? "…" : avgParticipants} sub="per meeting" />
          <StatCard label="Positive sentiment" value={loading ? "…" : `${positivePct}%`} sub="of all meetings" />
        </div>

        {/* Sentiment bar + top participants */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              background: "#161a22",
              border: "1px solid #27272a",
              borderRadius: "14px",
              padding: "20px 22px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#52525b", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Sentiment breakdown
            </p>
            {loading ? (
              <p style={{ color: "#3f3f46", fontSize: "13px" }}>Loading…</p>
            ) : (
              <SentimentBar
                positive={sentCounts.positive}
                neutral={sentCounts.neutral}
                negative={sentCounts.negative}
              />
            )}
          </div>

          <div
            style={{
              background: "#161a22",
              border: "1px solid #27272a",
              borderRadius: "14px",
              padding: "20px 22px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#52525b", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Top participants
            </p>
            {loading ? (
              <p style={{ color: "#3f3f46", fontSize: "13px" }}>Loading…</p>
            ) : topParticipants.length === 0 ? (
              <p style={{ color: "#3f3f46", fontSize: "13px" }}>No data yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {topParticipants.map(([name, count], i) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: avatarColors[i % avatarColors.length],
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", color: "#d4d4d8", marginBottom: "4px" }}>{name}</div>
                      <div style={{ height: "4px", background: "#27272a", borderRadius: "2px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.round((count / maxFreq) * 100)}%`,
                            background: "#f97316",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", color: "#52525b", flexShrink: 0 }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Meetings table */}
        <div
          style={{
            background: "#161a22",
            border: "1px solid #27272a",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {/* Table toolbar */}
          <div
            style={{
              padding: "16px 16px 12px",
              borderBottom: "1px solid #27272a",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#fff", margin: 0, flex: 1 }}>
              Meetings{" "}
              <span style={{ color: "#3f3f46", fontWeight: 400 }}>({filtered.length})</span>
            </p>
            <input
              type="text"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "#0f0f0f",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
                padding: "7px 12px",
                outline: "none",
                width: "200px",
              }}
            />
            <div style={{ display: "flex", gap: "6px" }}>
              {["all", "positive", "neutral", "negative"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSentFilter(s)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: sentFilter === s ? "#f97316" : "#27272a",
                    background: sentFilter === s ? "#431407" : "transparent",
                    color: sentFilter === s ? "#f97316" : "#71717a",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 80px 90px 36px",
              gap: "12px",
              padding: "10px 16px",
              borderBottom: "1px solid #27272a",
            }}
          >
            {["Meeting", "Date", "Duration", "Sentiment", ""].map((h) => (
              <span key={h} style={{ fontSize: "11px", color: "#3f3f46", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#3f3f46", fontSize: "13px" }}>
              Loading your meetings…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#3f3f46", fontSize: "13px" }}>
              No meetings found
            </div>
          ) : (
            filtered.map((m) => (
              <MeetingRow key={m._id} meeting={m} onClick={setSelected} />
            ))
          )}
        </div>
      </div>

      <MeetingDrawer meeting={selected} onClose={() => setSelected(null)} />
    </div>
  );
}