import { useState } from "react";

const NAV = [
  { id: "overview", label: "🗺️ Overview" },
  { id: "phases", label: "📅 Phases" },
  { id: "daily", label: "⏰ Daily Schedule" },
  { id: "tools", label: "🧰 Power Tools" },
  { id: "errors", label: "🗂️ Error System" },
  { id: "tracker", label: "📊 Tracker" },
];

const phases = [
  {
    id: 1, label: "Phase 1", name: "Fix the Foundation", days: "Days 1–14",
    color: "#f87171", goal: "Turn Red → Amber, Amber → Green",
    rules: [
      "70% testing yourself, 30% reading. Always.",
      "Attack Red topics every morning using Feynman Technique.",
      "Every Monday: 10-question timed mini-mock to track baseline. Don't skip this.",
      "Spaced Repetition calendar: Day 1 topic → review Day 2, 4, 8, 15.",
      "Do your Retrieval Sprint every afternoon (15 mins, blank paper, everything from memory).",
      "Start your Top 20 Kill List on Day 1. Review it every morning.",
    ],
    upgrade: "Added weekly mini-mocks so exam pressure doesn't blindside you on Day 21. Most students first feel exam anxiety on mock day — you'll have already dealt with it.",
  },
  {
    id: 2, label: "Phase 2", name: "Output Mode", days: "Days 15–20",
    color: "#fbbf24", goal: "Bridge knowing → applying under pressure",
    rules: [
      "Zero new concepts. 100% application only from here.",
      "Morning: randomized practice questions across all subjects. No notes.",
      "Log every wrong answer by Error Type in your Mistake Journal.",
      "Evening: target the error type that appears most in your journal that week.",
      "Do one timed half-paper every 2 days. Grade harshly.",
      "Update your Rapid Recall Sheet with any formula you hesitated on.",
    ],
    upgrade: "Error-type logging means you're not just redoing questions — you're fixing the specific reason you got them wrong. Careless errors and conceptual gaps need completely different fixes.",
  },
  {
    id: 3, label: "Phase 3", name: "The Crucible", days: "Days 21–27",
    color: "#a78bfa", goal: "Build exam stamina, speed, and psychological readiness",
    rules: [
      "One full timed past paper every morning. Exact conditions: clear desk, no phone, no music.",
      "Afternoon: brutal self-grading. Every dropped mark → 3 targeted recall questions.",
      "Day 22 & Day 25: Pressure Day. Full clothes, exact exam time, exact length. Make it feel real.",
      "Review your Mistake Journal: is your most common error type shrinking? Adjust focus.",
      "No new topics. Unknown content in a mock → note it, don't deep-dive.",
      "Check your Daily Scorecard trend. If sleep is under 8h, scores drop — fix this now.",
    ],
    upgrade: "Added two Pressure Days (full simulation with clothes, timing, environment). The actual exam should feel like the 3rd time you've done this, not the first.",
  },
  {
    id: 4, label: "Phase 4", name: "The Taper", days: "Days 28–30",
    color: "#34d399", goal: "Peak your brain on exam day, not the day before",
    rules: [
      "Day 28: Light review only. Mistake Journal, Rapid Recall Sheet, Top 20 Kill List.",
      "Day 29: Morning — review your BEST mock exam (not a new one). Afternoon: completely free.",
      "Day 29 Evening: pack your bag, prepare clothes, review your Top 20 Kill List once.",
      "Day 30 Morning Ritual: light breakfast, 5-min Rapid Recall review, arrive early.",
      "No new studying after 6 PM on Day 29. Sleep is your last and most important study session.",
      "9–10 hours sleep both nights. Your brain is encoding 30 days of learning right now.",
    ],
    upgrade: "Day 29 uses your BEST mock (not a new one) — if you attempt new material and perform badly, you destroy your mindset the night before. Reviewing a strong performance builds confidence.",
  },
];

const dailySchedule = [
  { time: "7:30 AM", label: "Wake Up", detail: "Hydrate immediately. No phone for 30 mins. Light breakfast.", icon: "☀️", type: "rest" },
  { time: "7:50 AM", label: "Rapid Recall Sprint", detail: "5 mins: glance at your Rapid Recall Sheet (formulas, definitions, traps). Instant memory activation.", icon: "⚡", type: "study" },
  { time: "8:00 AM", label: "Morning Brain Dump", detail: "15 mins: write everything you remember from last night. No notes. This is active recall before caffeine fully kicks in.", icon: "🧠", type: "study" },
  { time: "8:20 AM", label: "Daily Scorecard Check", detail: "2 mins: log yesterday's sleep, energy, and recall score. Spot your personal patterns over time.", icon: "📊", type: "study" },
  { time: "8:30 AM", label: "Red Topic Zone", detail: "3 × 50-min blocks / 10-min breaks. Feynman everything. Hard topics only. If you can't explain it simply, you don't know it yet.", icon: "🔴", type: "study" },
  { time: "11:30 AM", label: "Midday Break", detail: "Lunch + short walk. Strictly screen-free. Mental consolidation happens during downtime, not just sleep.", icon: "🥗", type: "rest" },
  { time: "1:00 PM", label: "Retrieval Sprint", detail: "15 mins: blank paper, write every formula/definition/theorem from memory. Brutally exposes gaps faster than any other method.", icon: "📝", type: "study" },
  { time: "1:20 PM", label: "Problem-Solving Zone", detail: "3 × 50-min blocks / 10-min breaks. Interleave subjects (e.g. 1.5h Math → 1.5h Physics). No notes. Log every wrong answer by error type.", icon: "⚙️", type: "study" },
  { time: "4:00 PM", label: "Exercise", detail: "30–45 mins. Exercise releases BDNF — literally grows new memory neurons. Non-negotiable.", icon: "🏃", type: "rest" },
  { time: "5:00 PM", label: "Dinner + Recharge", detail: "Eat well. Avoid short-form video scrolling — it fragments your attention span for the next day.", icon: "🍽️", type: "rest" },
  { time: "6:30 PM", label: "Amber Topic Review", detail: "Optional 60-min session for topics you're shaky on. Lower intensity. Good for subjects needing memorisation.", icon: "🟡", type: "study" },
  { time: "8:00 PM", label: "Spaced Repetition", detail: "Anki/flashcards. Review today's formulas, vocab, key concepts. Check your spaced repetition calendar for scheduled reviews.", icon: "🃏", type: "study" },
  { time: "9:30 PM", label: "Hardest Concept + Rapid Recall", detail: "Review ONE hard concept from today. Then spend 5 mins on your Rapid Recall Sheet. Your brain will process both during sleep.", icon: "💡", type: "study" },
  { time: "10:00 PM", label: "Hard Stop", detail: "Lights out. 8–10 hours. Sleep is the study session you can't skip — this is when your brain encodes everything.", icon: "😴", type: "rest" },
];

const errorTypes = [
  { type: "Careless Error", color: "#fbbf24", icon: "✏️", example: "Copied the number wrong / didn't read units.", fix: "Slow down. Underline key words. In exams, save 5 mins at the end to check." },
  { type: "Conceptual Gap", color: "#f87171", icon: "🧩", example: "Didn't understand WHY the method works.", fix: "Feynman this concept tonight. Add to spaced repetition calendar immediately." },
  { type: "Formula Forgotten", color: "#a78bfa", icon: "📐", example: "Knew the topic but blanked on the formula.", fix: "Add to Rapid Recall Sheet. Test yourself on it every morning this week." },
  { type: "Misread Question", color: "#67e8f9", icon: "👁️", example: "Answered the wrong thing — didn't read carefully.", fix: "Circle the 'action word' in every question (calculate, explain, compare, evaluate)." },
  { type: "Ran Out of Time", color: "#34d399", icon: "⏱️", example: "Got stuck and didn't manage the clock.", fix: "Never spend more than 3 mins on one question. Mark it, move on, come back." },
  { type: "Confidence Error", color: "#f472b6", icon: "🎯", example: "Knew it, but second-guessed and changed the answer.", fix: "Circle your first instinct. Only change answers if you find concrete evidence you were wrong. First instinct is right more often than students believe." },
];

const powerTools = [
  {
    name: "Rapid Recall Sheet",
    icon: "⚡",
    color: "#fbbf24",
    what: "One page per subject containing ONLY: formulas, dates, definitions, exceptions, and common exam traps.",
    when: "Review for 5 mins right after waking. Review for 5 mins right before sleep.",
    why: "Your brain consolidates whatever it sees last before sleep. Start each morning with instant activation of core knowledge.",
    howto: [
      "Take a blank A4 page for each subject.",
      "Write only what you'd lose marks for forgetting — nothing else.",
      "Update it whenever you hesitate on a formula during practice.",
      "Never let it exceed one page. Ruthlessly edit.",
    ],
  },
  {
    name: "Top 20 Kill List",
    icon: "🎯",
    color: "#f87171",
    what: "A ranked list of the 20 concepts most likely to appear on your exam and worth the most marks.",
    when: "Review every morning (2 mins). Ensure Phase 1 & 2 are focused on these, not low-yield content.",
    why: "Most students spread effort evenly across all topics. Top scorers know that 20% of concepts usually yield 80% of marks.",
    howto: [
      "Look at the last 5 years of past papers. What appears every year? That's your list.",
      "Ask your teacher: 'What are the highest-yield topics?'",
      "Rank by: frequency of appearance × marks available.",
      "On Day 1, make sure every item is Green before Phase 3.",
    ],
  },
  {
    name: "Retrieval Sprint",
    icon: "📝",
    color: "#a78bfa",
    what: "15 minutes, blank paper, write every formula/definition/theorem/process from memory. No notes allowed.",
    when: "Every afternoon after lunch, before your problem-solving session.",
    why: "This exposes knowledge gaps faster than any other method. If you can't write it from memory, you don't actually know it.",
    howto: [
      "Set a 15-minute timer.",
      "Blank paper only. No peeking.",
      "Write everything: formulas, definitions, processes, key dates.",
      "After time's up, check against notes. Circle everything you missed.",
      "Those gaps go on your Rapid Recall Sheet immediately.",
    ],
  },
  {
    name: "Pressure Day",
    icon: "🔥",
    color: "#f472b6",
    what: "A full exam simulation: same clothes, same start time, exact exam duration, real conditions.",
    when: "Day 22 and Day 25 during Phase 3.",
    why: "Exam anxiety spikes from unfamiliarity. When the real exam day arrives, it should feel like the third time you've done this — not the first.",
    howto: [
      "Wear your exam clothes or school uniform.",
      "Start at the exact same time your real exam starts.",
      "Clear desk. Water bottle. No phone. No music.",
      "Simulate everything: bathroom break timing, how to skip stuck questions.",
      "Debrief after: how did your body feel? What surprised you? Fix those gaps.",
    ],
  },
];

const scorecardFields = [
  { label: "Focus Level", key: "focus", unit: "/ 10", type: "number", max: 10 },
  { label: "Energy Level", key: "energy", unit: "/ 10", type: "number", max: 10 },
  { label: "Recall Accuracy", key: "recall", unit: "%", type: "number", max: 100 },
  { label: "Practice Questions", key: "questions", unit: "% correct", type: "number", max: 100 },
  { label: "Sleep Hours", key: "sleep", unit: "hrs", type: "number", max: 12 },
  { label: "Exercise Done?", key: "exercise", unit: "", type: "bool" },
];

const defaultEntry = { focus: "", energy: "", recall: "", questions: "", sleep: "", exercise: false };

function TrackerTab() {
  const [entries, setEntries] = useState({});
  const [today, setToday] = useState(1);
  const [form, setForm] = useState({ ...defaultEntry });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEntries(prev => ({ ...prev, [today]: { ...form } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const trendDays = Array.from({ length: 30 }, (_, i) => i + 1).filter(d => entries[d]);
  const avgSleep = trendDays.length
    ? (trendDays.reduce((s, d) => s + (parseFloat(entries[d].sleep) || 0), 0) / trendDays.length).toFixed(1)
    : "—";
  const avgRecall = trendDays.length
    ? Math.round(trendDays.reduce((s, d) => s + (parseFloat(entries[d].recall) || 0), 0) / trendDays.length)
    : "—";
  const avgFocus = trendDays.length
    ? (trendDays.reduce((s, d) => s + (parseFloat(entries[d].focus) || 0), 0) / trendDays.length).toFixed(1)
    : "—";

  const barMax = 100;
  const barColor = (val, max) => {
    const pct = val / max;
    if (pct >= 0.8) return "#34d399";
    if (pct >= 0.6) return "#fbbf24";
    return "#f87171";
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, color: "#f0f0f0" }}>Daily Scorecard</h2>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>Track daily. Discover your personal performance patterns.</p>
      </div>

      {/* Summary cards */}
      {trendDays.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "Avg Sleep", val: avgSleep + "h", icon: "😴", color: "#67e8f9" },
            { label: "Avg Recall", val: avgRecall + "%", icon: "🧠", color: "#a78bfa" },
            { label: "Avg Focus", val: avgFocus + "/10", icon: "🎯", color: "#fbbf24" },
            { label: "Days Logged", val: trendDays.length + "/30", icon: "📅", color: "#34d399" },
          ].map((c, i) => (
            <div key={i} style={{
              flex: 1, minWidth: 120,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: "14px 16px",
              border: `1px solid ${c.color}40`,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.color }}>{c.val}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Day selector */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        borderRadius: 12,
        padding: "16px",
        marginBottom: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ fontSize: 12, fontFamily: "monospace", color: "#94a3b8", marginBottom: 10, letterSpacing: "0.1em" }}>SELECT DAY</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
            <button key={d} onClick={() => { setToday(d); setForm(entries[d] ? { ...entries[d] } : { ...defaultEntry }); }} style={{
              width: 36, height: 36,
              borderRadius: 8,
              border: today === d ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)",
              background: entries[d]
                ? "rgba(167,139,250,0.25)"
                : today === d ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)",
              color: today === d ? "#c4b5fd" : entries[d] ? "#a78bfa" : "#64748b",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "monospace",
              fontWeight: today === d ? 700 : 400,
            }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        borderRadius: 12,
        padding: "20px",
        border: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontFamily: "monospace", color: "#a78bfa", marginBottom: 16, letterSpacing: "0.08em" }}>
          DAY {today} SCORECARD
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {scorecardFields.map(f => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <label style={{ fontSize: 14, color: "#cbd5e1", flex: 1 }}>{f.label}</label>
              {f.type === "bool" ? (
                <button onClick={() => setForm(p => ({ ...p, exercise: !p.exercise }))} style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: form.exercise ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.2)",
                  background: form.exercise ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.05)",
                  color: form.exercise ? "#34d399" : "#64748b",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}>
                  {form.exercise ? "✓ Yes" : "✗ No"}
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min={0} max={f.max}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: 64,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.07)",
                      color: "#f0f0f0",
                      fontSize: 14,
                      fontFamily: "monospace",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", minWidth: 50 }}>{f.unit}</span>
                  {form[f.key] !== "" && f.type === "number" && (
                    <div style={{ width: 60, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(100, (parseFloat(form[f.key]) / f.max) * 100)}%`,
                        background: barColor(parseFloat(form[f.key]), f.max),
                        borderRadius: 3,
                        transition: "width 0.3s",
                      }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleSave} style={{
          marginTop: 20,
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          border: "none",
          background: saved ? "rgba(52,211,153,0.3)" : "rgba(167,139,250,0.25)",
          color: saved ? "#34d399" : "#c4b5fd",
          cursor: "pointer",
          fontSize: 14,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          fontWeight: 700,
          border: saved ? "1px solid #34d399" : "1px solid rgba(167,139,250,0.4)",
          transition: "all 0.2s",
        }}>
          {saved ? "✓ SAVED" : "SAVE DAY " + today}
        </button>
      </div>

      {/* Trend bars */}
      {trendDays.length > 1 && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12,
          padding: "16px 20px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "#94a3b8", marginBottom: 14, letterSpacing: "0.1em" }}>RECALL ACCURACY TREND</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
            {trendDays.map(d => {
              const val = parseFloat(entries[d].recall) || 0;
              return (
                <div key={d} title={`Day ${d}: ${val}%`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{
                    width: "100%",
                    height: `${(val / 100) * 50}px`,
                    background: barColor(val, 100),
                    borderRadius: "3px 3px 0 0",
                    minHeight: 3,
                    transition: "height 0.3s",
                  }} />
                  <span style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>{d}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyPlan() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activePhase, setActivePhase] = useState(1);
  const [activeTool, setActiveTool] = useState(0);

  const phase = phases.find(p => p.id === activePhase);
  const tool = powerTools[activeTool];

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "#0d0d14",
      minHeight: "100vh",
      color: "#f0f0f0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(103,232,249,0.08) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "28px 20px 20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#a78bfa", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
          v2.0 — Fully Upgraded
        </div>
        <h1 style={{
          fontSize: "clamp(24px, 5vw, 42px)",
          fontWeight: 700, margin: "0 0 6px",
          background: "linear-gradient(90deg, #f9a8d4 0%, #c4b5fd 50%, #67e8f9 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: 1.2,
        }}>
          60% → Perfect Score
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0, fontStyle: "italic" }}>30 days. 7 upgrades. One system.</p>
      </div>

      {/* Nav */}
      <div style={{
        display: "flex",
        overflowX: "auto",
        gap: 6,
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        scrollbarWidth: "none",
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setActiveTab(n.id)} style={{
            whiteSpace: "nowrap",
            padding: "8px 16px",
            borderRadius: 100,
            border: activeTab === n.id ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.1)",
            background: activeTab === n.id ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.03)",
            color: activeTab === n.id ? "#c4b5fd" : "#64748b",
            cursor: "pointer", fontSize: 12,
            fontFamily: "monospace", letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}>{n.label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 16px 60px", maxWidth: 760, margin: "0 auto" }}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div style={{ marginBottom: 20, padding: "16px 20px", background: "rgba(167,139,250,0.08)", borderRadius: 12, border: "1px solid rgba(167,139,250,0.25)" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#a78bfa", letterSpacing: "0.15em", marginBottom: 8 }}>YOUR SITUATION</div>
              <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1", lineHeight: 1.7 }}>
                You're at 60–70%. That means your foundation exists — you just have <strong style={{ color: "#f0f0f0" }}>specific gaps, specific error patterns, and no exam-condition practice.</strong> This system fixes all three. Upgrade v2.0 adds 7 tools on top of the core plan.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { icon: "⚡", title: "Rapid Recall Sheet", desc: "One-page memory activator. Morning + night, 5 mins each.", color: "#fbbf24" },
                { icon: "🎯", title: "Top 20 Kill List", desc: "Highest-yield 20 concepts. Review daily. Don't waste time on low-yield content.", color: "#f87171" },
                { icon: "📝", title: "Retrieval Sprint", desc: "15 mins, blank paper, everything from memory. Exposes gaps instantly.", color: "#a78bfa" },
                { icon: "🔥", title: "Pressure Day", desc: "Full simulation: clothes, timing, conditions. Twice in Phase 3.", color: "#f472b6" },
                { icon: "🗂️", title: "Error Journal v2", desc: "6 error types including Confidence Error — the one strong students lose marks on.", color: "#67e8f9" },
                { icon: "📊", title: "Daily Scorecard", desc: "Track focus, sleep, recall. Discover your personal performance patterns.", color: "#34d399" },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  border: `1px solid ${item.color}30`,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.15em", marginBottom: 12 }}>THE 4-PHASE ROADMAP</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {phases.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${p.color}25`, border: `2px solid ${p.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: p.color, fontFamily: "monospace", flexShrink: 0 }}>{p.id}</div>
                      {i < phases.length - 1 && <div style={{ width: 2, height: 28, background: "rgba(255,255,255,0.08)" }} />}
                    </div>
                    <div style={{ paddingBottom: i < phases.length - 1 ? 16 : 0, paddingTop: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.name} <span style={{ fontFamily: "monospace", fontWeight: 400, color: "#64748b", fontSize: 11 }}>{p.days}</span></div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{p.goal}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PHASES */}
        {activeTab === "phases" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {phases.map(p => (
                <button key={p.id} onClick={() => setActivePhase(p.id)} style={{
                  flex: 1, minWidth: 120, padding: "12px 10px", borderRadius: 10,
                  border: activePhase === p.id ? `2px solid ${p.color}` : "2px solid rgba(255,255,255,0.08)",
                  background: activePhase === p.id ? `${p.color}18` : "rgba(255,255,255,0.03)",
                  color: activePhase === p.id ? p.color : "#64748b",
                  cursor: "pointer", textAlign: "center", transition: "all 0.15s",
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", marginBottom: 3 }}>{p.days}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                </button>
              ))}
            </div>

            {phase && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, border: `1px solid ${phase.color}35`, overflow: "hidden" }}>
                <div style={{ background: `${phase.color}12`, padding: "18px 20px", borderBottom: `1px solid ${phase.color}25` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ background: phase.color, color: "#0d0d14", padding: "3px 12px", borderRadius: 100, fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.1em" }}>{phase.days}</span>
                    <h2 style={{ margin: 0, fontSize: 20, color: "#f0f0f0" }}>{phase.name}</h2>
                  </div>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>🎯 {phase.goal}</p>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  {phase.rules.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ background: phase.color, color: "#0d0d14", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, fontFamily: "monospace", marginTop: 1 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.6, color: "#e2e8f0" }}>{r}</span>
                    </div>
                  ))}
                  <div style={{ background: `${phase.color}0e`, border: `1px solid ${phase.color}35`, borderRadius: 8, padding: "12px 14px", marginTop: 8, display: "flex", gap: 10 }}>
                    <span>✨</span>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: "monospace", color: phase.color, letterSpacing: "0.12em", marginBottom: 4 }}>UPGRADE NOTE</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{phase.upgrade}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DAILY SCHEDULE */}
        {activeTab === "daily" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>Your Daily Blueprint</h2>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>6–8 focused hours, structured around your brain's natural rhythm.</p>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 55, top: 18, bottom: 18, width: 1, background: "linear-gradient(180deg, #a78bfa44, #67e8f944, #a78bfa44)" }} />
              {dailySchedule.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ minWidth: 54, textAlign: "right", fontSize: 10, color: "#475569", paddingTop: 14, fontFamily: "monospace", lineHeight: 1.3 }}>{item.time}</div>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                    background: item.type === "study" ? "rgba(167,139,250,0.18)" : "rgba(100,116,139,0.15)",
                    border: item.type === "study" ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(100,116,139,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>{item.icon}</div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#f0f0f0" }}>{item.label}</span>
                      <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 100, background: item.type === "study" ? "rgba(167,139,250,0.15)" : "rgba(100,116,139,0.15)", color: item.type === "study" ? "#a78bfa" : "#64748b", fontFamily: "monospace" }}>{item.type}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POWER TOOLS */}
        {activeTab === "tools" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>Power Tools</h2>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>4 upgrades that separate top scorers from good students.</p>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {powerTools.map((t, i) => (
                <button key={i} onClick={() => setActiveTool(i)} style={{
                  flex: 1, minWidth: 120, padding: "12px 10px", borderRadius: 10, cursor: "pointer", textAlign: "center", transition: "all 0.15s",
                  border: activeTool === i ? `2px solid ${t.color}` : "2px solid rgba(255,255,255,0.08)",
                  background: activeTool === i ? `${t.color}15` : "rgba(255,255,255,0.03)",
                  color: activeTool === i ? t.color : "#64748b",
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>{t.name}</div>
                </button>
              ))}
            </div>
            {tool && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, border: `1px solid ${tool.color}35`, overflow: "hidden" }}>
                <div style={{ background: `${tool.color}12`, padding: "18px 20px", borderBottom: `1px solid ${tool.color}25` }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{tool.icon}</div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 18, color: tool.color }}>{tool.name}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{tool.what}</p>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 160, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.12em", marginBottom: 4 }}>WHEN</div>
                      <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>{tool.when}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.12em", marginBottom: 4 }}>WHY IT WORKS</div>
                      <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>{tool.why}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: tool.color, letterSpacing: "0.12em", marginBottom: 10 }}>HOW TO DO IT</div>
                  {tool.howto.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 7, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ background: tool.color, color: "#0d0d14", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0, fontFamily: "monospace" }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ERROR SYSTEM */}
        {activeTab === "errors" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>Mistake Journal v2</h2>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>6 error types. Each needs a different fix. Log every wrong answer here.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>
                For every wrong practice question: <strong style={{ color: "#f0f0f0" }}>identify the error type → apply the fix → tally weekly.</strong> Whatever type appears most is where you spend your evening review. Most students just redo questions — you'll fix the actual root cause.
              </p>
            </div>
            {errorTypes.map((e, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${e.color}35`, padding: "14px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{e.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: e.color, fontFamily: "monospace" }}>{e.type}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", marginBottom: 8 }}>Example: {e.example}</div>
                <div style={{ background: `${e.color}0e`, border: `1px solid ${e.color}25`, borderRadius: 7, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: e.color, letterSpacing: "0.1em", marginBottom: 3 }}>FIX</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{e.fix}</p>
                </div>
              </div>
            ))}
            <div style={{ background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.3)", borderRadius: 10, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#f472b6", letterSpacing: "0.12em", marginBottom: 6 }}>✨ NEW IN V2 — CONFIDENCE ERROR</div>
              <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>This error type is almost exclusive to strong students. As you move from 70% → 95%+, this becomes your biggest leak. Circle your first instinct on every question and track how often changing it cost you marks.</p>
            </div>
          </div>
        )}

        {/* TRACKER */}
        {activeTab === "tracker" && <TrackerTab />}

      </div>
    </div>
  );
}
