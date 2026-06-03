import loginBg from "./assets/login-bg.jpeg";
import {
  FaGoogle,
} from "react-icons/fa";
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import {
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  auth,
  googleProvider,
} from "./firebase";




const TOTAL = 60;
const START = new Date(2026, 5, 1);

const getDay = (n) => {
  const d = new Date(START);
  d.setDate(d.getDate() + n - 1);
  return {
    long: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    week: Math.ceil(n / 7),
    isWeekStart: (n - 1) % 7 === 0,
  };
};

const CATS = [
  { id: "am", icon: "🌅", name: "MORNING RITUAL", time: "3:30 – 8:00 AM", col: "amber",
    tasks: ["Wake up at 4:00 AM", "Morning Meditation (10 min)", "Kharach rehaas", "Breakfast: 3 Eggs + Oats + Banana"] },
  { id: "s1", icon: "📚", name: "STUDY DUNGEON — SLOT I", time: "4:00 – 8:00 AM", col: "blue",
    tasks: ["Lecture 1", "Lecture 2", "DPP — Daily Practice Problems", "Revision"] },
  { id: "pt", icon: "⚔️", name: "PHYSICAL TRAINING ARC", time: "8:30 AM – 12:00 PM", col: "red",
    tasks: ["MMA Training ", "Protein Shake + Soy Protein", "Calisthenics ", "Bath"] },
  { id: "nu", icon: "🍱", name: "NUTRITION PROTOCOL", time: "All Day", col: "green",
    tasks: ["Clean Lunch — No Sugar", "3L Water Rule (track daily)", "Zero Sugar Today", "Supplements"] },
  { id: "ca", icon: "📰", name: "CURRENT AFFAIRS ", time: "1:00 – 4:00 PM", col: "purple",
    tasks: ["Newspaper Reading", "Daily Current Affairs", "Answer Writing Practice", "Project / Strategy Work "] },
  { id: "ai", icon: "🤖", name: "AI AUTOMATION TRAINING", time: "4:00 – 5:30 PM", col: "cyan",
    tasks: ["AI Automation Work"] },
  { id: "sk", icon: "🎯", name: "SKILLS DEVELOPMENT", time: "5:30 – 6:30 PM", col: "orange",
    tasks: ["Other Skills ", "Guitar Practice (10 min)", "Piano Drills (10 min)", "Supplements"] },
  { id: "ev", icon: "🌙", name: "EVENING WIND-DOWN", time: "6:30 – 9:00 PM", col: "violet",
    tasks: ["Journaling + Day Reflection ", "Non-Fiction Book (20 min)", "Personality Development", "Evening Meditation (10 min)", "Skin Care + Brush Teeth", "No Screens after 8:00 PM", "Sleep by 9:00 PM"] },
  { id: "wk", icon: "💀", name: "WEEKLY SPECIAL QUEST", time: "Once per Week", col: "yellow", weekly: true,
    tasks: ["3-Hour Disappear (No phone, no wifi, alone)"] },
  { id: "cx", icon: "⚡", name: "CUSTOM QUESTS", time: "Edit as needed", col: "slate",
    tasks: ["Custom Task 1", "Custom Task 2", "Custom Task 3", "Custom Task 4", "Custom Task 5", "Custom Task 6"] },
];

const CM = {
  amber:  { t: "text-amber-400",   bg: "bg-amber-900/20",   bdr: "border-amber-500/30",   hex: "#f59e0b" },
  blue:   { t: "text-blue-400",    bg: "bg-blue-900/20",    bdr: "border-blue-500/30",    hex: "#3b82f6" },
  red:    { t: "text-red-400",     bg: "bg-red-900/20",     bdr: "border-red-500/30",     hex: "#ef4444" },
  green:  { t: "text-emerald-400", bg: "bg-emerald-900/20", bdr: "border-emerald-500/30", hex: "#10b981" },
  purple: { t: "text-purple-400",  bg: "bg-purple-900/20",  bdr: "border-purple-500/30",  hex: "#8b5cf6" },
  cyan:   { t: "text-cyan-400",    bg: "bg-cyan-900/20",    bdr: "border-cyan-500/30",    hex: "#06b6d4" },
  orange: { t: "text-orange-400",  bg: "bg-orange-900/20",  bdr: "border-orange-500/30",  hex: "#f97316" },
  violet: { t: "text-violet-400",  bg: "bg-violet-900/20",  bdr: "border-violet-500/30",  hex: "#6366f1" },
  yellow: { t: "text-yellow-400",  bg: "bg-yellow-900/20",  bdr: "border-yellow-500/30",  hex: "#eab308" },
  slate:  { t: "text-slate-400",   bg: "bg-slate-800/40",   bdr: "border-slate-600/30",   hex: "#64748b" },
};

const ALL_IDS = CATS.flatMap(c => c.tasks.map((_, i) => `${c.id}_${i}`));

function CatCard({ cat, dayDone, onToggle }) {
  const [open, setOpen] = useState(true);
  const c = CM[cat.col];
  const doneCnt = cat.tasks.filter((_, i) => !!dayDone[`${cat.id}_${i}`]).length;
  const allDone = doneCnt === cat.tasks.length;

  return (
    <div className={`mb-2 rounded-xl border overflow-hidden transition-all duration-300 ${allDone ? `${c.bg} ${c.bdr}` : "bg-slate-900/80 border-slate-800"}`}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">{cat.icon}</span>
          <div>
            <div className={`text-xs font-bold tracking-widest ${allDone ? c.t : "text-slate-200"}`}>{cat.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{cat.time}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${allDone ? "bg-emerald-400/15 text-emerald-400" : `${c.bg} ${c.t}`}`}>
            {doneCnt}/{cat.tasks.length}{allDone ? " ✓" : ""}
          </span>
          <span className="text-slate-600 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-1">
          {cat.tasks.map((task, i) => {
            const id = `${cat.id}_${i}`;
            const isDone = !!dayDone[id];
            return (
              <button
                key={id}
                onClick={() => onToggle(id)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all duration-150 ${isDone ? `${c.bg} border ${c.bdr}` : "hover:bg-white/5"}`}
              >
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center border-2 transition-all duration-150"
                  style={{ border: `2px solid ${isDone ? c.hex : "rgba(255,255,255,0.15)"}`, background: isDone ? c.hex : "transparent", boxShadow: isDone ? `0 0 5px ${c.hex}88` : "none" }}
                >
                  {isDone && <span style={{ color: "#fff", fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                </div>
                <span className={`text-xs flex-1 ${isDone ? "line-through text-slate-600" : "text-slate-300"}`}>
                  {task}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
function PremiumLogin({
  email,
  password,
  setEmail,
  setPassword,
  
  loginEmail,
  signInGoogle,
  
}) {


const [activeTab, setActiveTab] = useState("email");

      return (
  <div
  className="min-h-screen w-full overflow-hidden"
   style={{
  backgroundImage: `url(${loginBg})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  backgroundColor: "#02030a",
}}
  >
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30" />

    {/* Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-purple-950/20" />

    {/* Main Container */}
    <div
  
  className="min-h-screen w-full flex flex-col items-center justify-center">

        {/* Logo */}
        <div className="text-center mb-12">

          <h1
  className="text-white tracking-[10px]"
  style={{
    fontFamily: "Cinzel, serif",
    fontSize: "140px",
    fontWeight: 700,
    textShadow:
      "0 0 15px #7c6cff, 0 0 40px #7c6cff",
  }}
>
            ARISE
          </h1>

          <h2

  className="text-purple-300"

  style={{

    fontFamily: "Cinzel, serif",

    letterSpacing: "12px",

    fontSize: "28px",

  }}

>
            PROTOCOL
          </h2>

          <p className="text-slate-300 text-sm mt-3 tracking-[3px] uppercase">
            Become The Strongest Version
            Of Yourself
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-[30px] p-8 border relative overflow-hidden"
          style={{
            background:
              "rgba(5,8,25,0.65)",

            backdropFilter:
              "blur(20px)",

            border:
              "1px solid rgba(129,140,248,0.4)",

            boxShadow:
              "0 0 35px rgba(99,102,241,0.35)",
          }}
        >
          {/* Card Glow */}
          <div className="absolute inset-0 rounded-[30px] border border-purple-400/20 pointer-events-none" />
<div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-cyan-400" />

<div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-cyan-400" />

<div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-cyan-400" />

<div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-cyan-400" />

          <div className="flex items-center justify-center gap-5 mb-10">

  <div className="w-24 h-px bg-cyan-400" />

  <h3
    style={{
      fontFamily: "Cinzel, serif",
      letterSpacing: "4px",
      fontSize: "30px",
    }}
    className="text-white"
  >
    HUNTER LOGIN
  </h3>

  <div className="w-24 h-px bg-cyan-400" />

</div>
          {activeTab === "email" && (
            <>
              {/* EMAIL */}
          <div className="mb-5">
            <label className="text-purple-300 text-sm tracking-[4px] uppercase block mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full h-[74px] bg-[#050816cc] border border-[#6f3cff66] rounded-[18px] px-6 text-white outline-none focus:border-[#8d5bff] transition"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-purple-300 text-sm tracking-[4px] uppercase block mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full h-[74px] bg-[#050816cc] border border-[#6f3cff66] rounded-[18px] px-6 text-white outline-none focus:border-[#8d5bff] transition"
            />
          </div>

          <div className="text-right mt-3">
            <button className="text-purple-300 text-sm hover:text-white transition">
              Forgot Password?
            </button>
          </div>

          {/* LOGIN BTN */}
          <button
            onClick={loginEmail}
            className="w-full mt-6 h-[74px] rounded-[24px] text-white tracking-[2px] font-semibold text-[18px]"
            style={{
              background:
                "linear-gradient(90deg,#9333ea,#2563eb)",

              boxShadow:
                "0 0 25px rgba(139,92,246,0.6)",
            }}
          >
            LOGIN →
          </button>
          </>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="h-px bg-purple-500/30 flex-1" />
            <span className="text-slate-300">
              OR
            </span>
            <div className="h-px bg-purple-500/30 flex-1" />
          </div>

          {/* GOOGLE */}
          <div className="mb-4">
            
            <button
              onClick={signInGoogle}
              className="w-full h-[74px] rounded-[24px] border border-[#6f3cff66] bg-[#050816cc] backdrop-blur-xl px-7 flex items-center gap-5 justify-start transition-all duration-300 hover:scale-[1.01] hover:border-[#8d5bff] hover:shadow-[0_0_30px_rgba(129,92,255,0.35)]"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#14172b] flex items-center justify-center">
                  <FaGoogle className="text-cyan-400 text-xl" />
                </div>

                <span className="text-white tracking-[2px] font-medium text-[15px]">
                  LOGIN WITH GOOGLE
                </span>
              </div>
            </button>
          </div>

          

          

          <div className="text-center mt-8 text-purple-200 tracking-[5px] text-xs">
            SHADOW MONARCH SYSTEM ACTIVE
          </div>
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
 }


export default function App() {
  const [user, setUser] = useState(null);

const [email, setEmail] =
  useState("");

const [password, setPassword] =
  useState("");



const [confirmationResult,
  setConfirmationResult] =
  useState(null);
  
 const [day, setDay] = useState(() => {
  const savedDay = localStorage.getItem("hunter-current-day");
  return savedDay ? Number(savedDay) : 1;
});
  const [done, setDone] = useState(() => {
  const saved = localStorage.getItem("hunter-progress");
  return saved ? JSON.parse(saved) : {};
});
  const [view, setView] = useState("quests");
useEffect(() => {
  localStorage.setItem(
    "hunter-progress",
    JSON.stringify(done)
  );
}, [done]);
useEffect(() => {
  localStorage.setItem(
    "hunter-current-day",
    day.toString()
  );
}, [day]);
  const info = useMemo(() => getDay(day), [day]);
  const dayDone = useMemo(() => done[day] || {}, [done, day]);
// Listen auth state
useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

  return () => unsubscribe();
}, []);

// Google Login
const signInGoogle =
  async () => {
    try {
      await signInWithPopup(
        auth,
        googleProvider
      );
    } catch (err) {
      alert(err.message);
    }
  };

// Email Login / Signup
const loginEmail =
  async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch {
      try {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } catch (err) {
        alert(err.message);
      }
    }
  };


const logout =
  async () => {
    await signOut(auth);
  };
  const toggle = useCallback((id) => {
    setDone(p => ({ ...p, [day]: { ...(p[day] || {}), [id]: !(p[day] || {})[id] } }));
  }, [day]);

  const dPct = useMemo(() => {
    const n = ALL_IDS.filter(id => dayDone[id]).length;
    return { n, t: ALL_IDS.length, pct: Math.round(n / ALL_IDS.length * 100) };
  }, [dayDone]);

  const overall = useMemo(() => {
    const total = Array.from({ length: TOTAL }, (_, i) => i + 1)
      .reduce((s, d) => s + ALL_IDS.filter(id => (done[d] || {})[id]).length, 0);
    return Math.round(total / (ALL_IDS.length * TOTAL) * 100);
  }, [done]);
if (!user) {
  return (
    <PremiumLogin
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
   
      loginEmail={loginEmail}
      signInGoogle={signInGoogle}
    
    />
  );
}
  if (view === "calendar") return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4" style={{ fontFamily: "system-ui" }}>
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <div className="text-amber-400 font-black text-sm tracking-widest">📅 60-DAY PROGRESS MAP</div>
          <button onClick={() => setView("quests")} className="text-xs text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-400/10 transition-colors">← BACK</button>
        </div>

        <div className="grid gap-1.5 mb-4" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
          {Array.from({ length: 60 }, (_, i) => i + 1).map(d => {
            const n = ALL_IDS.filter(id => (done[d] || {})[id]).length;
            const pct = n / ALL_IDS.length;
            const bg = d === day ? "#4d7eff" : pct === 1 ? "#10b981" : pct > 0.5 ? "#f59e0b" : pct > 0 ? "#3b82f6" : "rgba(255,255,255,0.04)";
            return (
              <button
                key={d}
                onClick={() => { setDay(d); setView("quests"); }}
                className="rounded-md text-xs font-bold flex items-center justify-center transition-transform hover:scale-110"
                style={{ aspectRatio: "1", background: bg, color: pct > 0 || d === day ? "#fff" : "#475569", border: d === day ? "2px solid #e8b84b" : "none" }}
              >{d}</button>
            );
          })}
        </div>

        <div className="flex gap-4 text-xs text-slate-500 flex-wrap mb-6">
          <span>⬛ Not started</span>
          <span className="text-blue-400">■ In progress</span>
          <span className="text-amber-400">■ &gt;50%</span>
          <span className="text-emerald-400">■ Complete</span>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-500 tracking-widest mb-3">OVERALL ASCENSION PROGRESS</div>
          <div className="text-4xl font-black text-amber-400 text-center">{overall}%</div>
          <div className="text-xs text-slate-500 text-center mt-1">of total challenge completed</div>
          <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${overall}%`, background: "linear-gradient(90deg,#4d7eff,#e8b84b)", boxShadow: "0 0 8px rgba(77,126,255,0.5)" }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" style={{ fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .sys-blink { animation: blink 2.5s ease-in-out infinite; }
        .gold-shimmer {
          background: linear-gradient(90deg,#e8b84b 0%,#fff8e1 40%,#e8b84b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .glow-bar { box-shadow: 0 0 8px rgba(77,126,255,0.6); }
      `}</style>

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-50 bg-slate-950/96 backdrop-blur border-b border-blue-900/40 px-4 py-2.5">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-blue-400 text-xs font-bold tracking-widest sys-blink">⚔ SYSTEM ACTIVE — ASCENSION PROTOCOL</div>
              <div className="font-black text-sm tracking-wide mt-0.5 gold-shimmer">THE 60-DAY HUNTER SYSTEM</div>
            </div>
            <div className="flex flex-col gap-2">
  <button
    onClick={() =>
      setView("calendar")
    }
    className="text-xs text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg hover:bg-blue-400/10 transition-colors"
  >
    📅 MAP
  </button>

  <button
    onClick={logout}
    className="text-xs text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
  >
    Logout
  </button>
</div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 glow-bar" style={{ width: `${overall}%`, background: "linear-gradient(90deg,#4d7eff,#e8b84b)" }} />
            </div>
            <span className="text-blue-400 text-xs font-bold min-w-[45px]">{overall}% EXP</span>
          </div>
        </div>
      </div>

      {/* DAY NAVIGATOR */}
      <div className="sticky top-[68px] z-40 bg-slate-950/92 backdrop-blur border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setDay(d => Math.max(1, d - 1))}
            disabled={day === 1}
            className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${day === 1 ? "border-slate-800 text-slate-700 cursor-not-allowed" : "border-blue-500/30 text-blue-400 hover:bg-blue-400/10"}`}
          >← PREV</button>

          <div className="text-center">
            <div className="text-2xl font-black text-amber-400" style={{ textShadow: "0 0 24px rgba(232,184,75,0.5)" }}>
              DAY {day} <span className="text-slate-600 text-sm font-semibold">/ {TOTAL}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{info.long}</div>
            <div className="flex items-center gap-2 justify-center mt-1.5">
              <span className={`text-xs font-bold ${dPct.pct === 100 ? "text-emerald-400" : "text-blue-400"}`}>{dPct.n}/{dPct.t} QUESTS</span>
              <div className="w-14 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${dPct.pct}%`, background: dPct.pct === 100 ? "#10b981" : "#4d7eff" }} />
              </div>
              <span className="text-xs text-slate-500">{dPct.pct}%</span>
            </div>
          </div>

          <button
            onClick={() => setDay(d => Math.min(TOTAL, d + 1))}
            disabled={day === TOTAL}
            className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${day === TOTAL ? "border-slate-800 text-slate-700 cursor-not-allowed" : "border-blue-500/30 text-blue-400 hover:bg-blue-400/10"}`}
          >NEXT →</button>
        </div>
      </div>

      {/* MAIN QUEST BOARD */}
      <div className="max-w-xl mx-auto px-4 pb-8 pt-4">

        {/* Week start alert */}
        {info.isWeekStart && (
          <div className="mb-3 p-3 rounded-xl border border-amber-500/30 bg-amber-900/10" style={{ boxShadow: "0 0 16px rgba(234,179,8,0.08)" }}>
            <div className="text-amber-400 text-xs font-bold tracking-widest">⚔ SYSTEM: WEEK {info.week} BEGINS</div>
            <div className="text-slate-400 text-xs mt-1">Weekly quest unlocked. Complete your 3-Hour Disappear to gain rare EXP.</div>
          </div>
        )}

        {/* Day complete banner */}
        {dPct.pct === 100 && (
          <div className="mb-3 p-3 rounded-xl border border-emerald-500/40 bg-emerald-900/10 text-center" style={{ boxShadow: "0 0 20px rgba(16,185,129,0.12)" }}>
            <div className="text-emerald-400 text-sm font-black tracking-widest">🏆 ALL QUESTS COMPLETE</div>
            <div className="text-slate-400 text-xs mt-1">Day {day} conquered. You are leveling up, Hunter.</div>
          </div>
        )}

        {/* Category cards */}
        {CATS.map(cat => (
          <CatCard key={cat.id} cat={cat} dayDone={dayDone} onToggle={toggle} />
        ))}

        {/* Stats panel */}
        <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-600 tracking-widest mb-3">HUNTER STATS</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "CURRENT DAY", val: `${day}/60`, col: "text-blue-400" },
              { label: "DAILY", val: `${dPct.pct}%`, col: dPct.pct === 100 ? "text-emerald-400" : "text-blue-400" },
              { label: "OVERALL EXP", val: `${overall}%`, col: "text-amber-400" },
            ].map(s => (
              <div key={s.label} className="text-center p-2 bg-slate-950/60 rounded-lg">
                <div className={`text-xl font-black ${s.col}`}>{s.val}</div>
                <div className="text-xs text-slate-600 tracking-widest mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick jump */}
        <div className="mt-3 flex gap-1.5 flex-wrap justify-center">
          {[1, 10, 20, 30, 40, 50, 60].map(d => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${day === d ? "border-amber-500/50 text-amber-400 bg-amber-900/20" : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400"}`}
            >D{d}</button>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-slate-700 tracking-widest">
          ⚔ JUNE 1 – JULY 30, 2026 · 60-HARD PROTOCOL · ARISE, HUNTER
        </div>
      </div>
    </div>
  );
}
