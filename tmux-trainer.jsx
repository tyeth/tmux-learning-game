import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Question Bank ───
const QUESTION_BANK = {
  "Session Management": {
    icon: "🔌",
    subtopics: {
      "Start Sessions": {
        easy: [
          { q: "What command starts a new tmux session?", options: ["tmux", "tmux start", "tmux begin", "tmux init"], correct: 0, pts: 3, teach: "Just type 'tmux' to start an unnamed session. For named ones, 'tmux new -s NAME'." },
          { q: "How do you start a NAMED tmux session called 'work'?", options: ["tmux new -s work", "tmux start work", "tmux -S work", "tmux session work"], correct: 0, pts: 3, teach: "tmux new -s NAME creates a named session. Named sessions are easier to find later." },
          { q: "In GNU Screen, how do you start a named session?", options: ["screen -S work", "screen new work", "screen -n work", "screen start work"], correct: 0, pts: 4, teach: "screen -S NAME starts a named screen session. Capital -S for Session name." },
        ],
        medium: [
          { q: "Type the command to START a new tmux session named 'dev'", answer: ["tmux new -s dev"], hint: "tmux n__ -_ d__", pts: 10, teach: "tmux new -s NAME — you'll type this constantly." },
          { q: "Type the command to start a named Screen session called 'logs'", answer: ["screen -S logs"], hint: "screen -_ l___", pts: 10, teach: "screen -S NAME — capital S for the session name flag." },
        ],
      },
      "Detach": {
        easy: [
          { q: "You're inside tmux and want to detach. What do you press?", options: ["Ctrl+B then D", "Ctrl+A then D", "Ctrl+D", "Ctrl+B then Q"], correct: 0, pts: 3, teach: "Ctrl+B is tmux's prefix. Press it, release, THEN press D to detach." },
          { q: "In GNU Screen, how do you detach?", options: ["Ctrl+A then D", "Ctrl+B then D", "Ctrl+D", "Ctrl+A then Q"], correct: 0, pts: 3, teach: "Screen uses Ctrl+A as its prefix. Then D to detach — same idea." },
        ],
        medium: [
          { q: "Type the KEY COMBO to detach from tmux", answer: ["ctrl+b d", "ctrl+b then d", "ctrl b d", "ctrl-b d", "Ctrl+B D", "Ctrl+B then D"], hint: "C___+B → _", pts: 10, teach: "Ctrl+B then D — detach safely. Session keeps running." },
        ],
      },
      "Reattach": {
        easy: [
          { q: "Your SSH dropped! How do you reattach to tmux?", options: ["tmux resume", "tmux attach", "tmux reconnect", "tmux open"], correct: 1, pts: 3, teach: "tmux attach (or tmux a) reattaches to your last session." },
          { q: "How do you reattach to a specific session called 'deploy'?", options: ["tmux a -t deploy", "tmux attach deploy", "tmux -r deploy", "tmux get deploy"], correct: 0, pts: 4, teach: "tmux a -t NAME — 'a' for attach, '-t' for target." },
          { q: "In Screen, how do you reattach to 'build'?", options: ["screen -r build", "screen -a build", "screen attach build", "screen resume build"], correct: 0, pts: 4, teach: "screen -r NAME reattaches. -r for reattach." },
        ],
        medium: [
          { q: "Type the command to REATTACH to tmux session 'build'", answer: ["tmux a -t build", "tmux attach -t build", "tmux att -t build"], hint: "tmux a -_ b____", pts: 10, teach: "tmux a -t NAME — your reconnection lifeline." },
          { q: "Type the command to reattach to Screen session 'work'", answer: ["screen -r work"], hint: "screen -_ w___", pts: 10, teach: "screen -r NAME — dash r for reattach." },
        ],
      },
      "List & Kill": {
        easy: [
          { q: "How do you list all running tmux sessions?", options: ["tmux sessions", "tmux ps", "tmux ls", "tmux --list"], correct: 2, pts: 4, teach: "tmux ls lists all active sessions." },
          { q: "In Screen, how do you list sessions?", options: ["screen -ls", "screen list", "screen ps", "screen --all"], correct: 0, pts: 4, teach: "screen -ls lists all screen sessions." },
        ],
        medium: [
          { q: "Type the command to LIST all tmux sessions", answer: ["tmux ls", "tmux list-sessions"], hint: "tmux l_", pts: 10, teach: "tmux ls — run this every time you SSH back in." },
          { q: "Type the command to KILL tmux session 'old'", answer: ["tmux kill-session -t old", "tmux kill-ses -t old"], hint: "tmux k___-s______ -_ o__", pts: 10, teach: "tmux kill-session -t NAME — clean up old sessions." },
        ],
      },
    },
  },
  "Windows": {
    icon: "🪟",
    subtopics: {
      "Create & Close": {
        easy: [
          { q: "How do you create a new window inside tmux?", options: ["Ctrl+B then W", "Ctrl+B then N", "Ctrl+B then C", "Ctrl+B then T"], correct: 2, pts: 5, teach: "Ctrl+B then C. C for Create." },
          { q: "How do you kill the current tmux window?", options: ["Ctrl+B then &", "Ctrl+B then X", "Ctrl+B then Q", "Ctrl+B then K"], correct: 0, pts: 5, teach: "Ctrl+B then & kills the current window (with confirmation)." },
        ],
        medium: [
          { q: "Type the KEY COMBO to create a new tmux window", answer: ["ctrl+b c", "ctrl+b then c", "ctrl-b c", "Ctrl+B C", "Ctrl+B then C"], hint: "C___+B → _", pts: 10, teach: "Ctrl+B then C — C for Create." },
        ],
      },
      "Navigate Windows": {
        easy: [
          { q: "How do you move to the NEXT window in tmux?", options: ["Ctrl+B then N", "Ctrl+B then →", "Ctrl+B then Tab", "Ctrl+B then W"], correct: 0, pts: 4, teach: "Ctrl+B then N for Next. P for Previous." },
          { q: "How do you jump to window number 3?", options: ["Ctrl+B then 3", "Ctrl+B then W3", "Ctrl+B then G3", "Ctrl+B then #3"], correct: 0, pts: 4, teach: "Ctrl+B then a number (0-9) jumps directly to that window." },
        ],
        medium: [
          { q: "Type the KEY COMBO to go to the previous window", answer: ["ctrl+b p", "ctrl+b then p", "ctrl-b p", "Ctrl+B P", "Ctrl+B then P"], hint: "C___+B → _", pts: 10, teach: "Ctrl+B then P — P for Previous." },
        ],
      },
      "Rename Windows": {
        easy: [
          { q: "How do you rename the current tmux window?", options: ["Ctrl+B then ,", "Ctrl+B then R", "Ctrl+B then N", "Ctrl+B then :rename"], correct: 0, pts: 5, teach: "Ctrl+B then comma — type a new name." },
        ],
        medium: [],
      },
    },
  },
  "Panes": {
    icon: "◫",
    subtopics: {
      "Split Panes": {
        easy: [
          { q: "How do you split tmux into LEFT | RIGHT panes?", options: ["Ctrl+B then |", "Ctrl+B then %", "Ctrl+B then S", "Ctrl+B then V"], correct: 1, pts: 5, teach: "Ctrl+B then %. The % has two circles side by side — left|right!" },
          { q: "How do you split tmux into TOP / BOTTOM panes?", options: ['Ctrl+B then "', "Ctrl+B then -", "Ctrl+B then H", "Ctrl+B then S"], correct: 0, pts: 5, teach: 'Ctrl+B then " (double-quote) splits horizontally (top/bottom).' },
        ],
        medium: [
          { q: "Type the KEY COMBO to split into LEFT and RIGHT panes", answer: ["ctrl+b %", "ctrl+b then %", "ctrl-b %", "Ctrl+B %", "Ctrl+B then %"], hint: "C___+B → _", pts: 10, teach: "Ctrl+B then % — percent has two halves side-by-side!" },
          { q: "Type the KEY COMBO to split into TOP and BOTTOM panes", answer: ['ctrl+b "', 'ctrl+b then "', 'ctrl-b "', 'Ctrl+B "', 'Ctrl+B then "'], hint: 'C___+B → "', pts: 10, teach: 'Ctrl+B then " (double-quote) for horizontal split.' },
        ],
      },
      "Navigate Panes": {
        easy: [
          { q: "How do you move between tmux panes?", options: ["Ctrl+B then Arrow Keys", "Alt+Arrow Keys", "Tab", "Ctrl+B then Tab"], correct: 0, pts: 4, teach: "Ctrl+B then any arrow key moves to the pane in that direction." },
          { q: "How do you zoom a pane to fill the whole window?", options: ["Ctrl+B then Z", "Ctrl+B then F", "Ctrl+B then M", "Ctrl+B then Space"], correct: 0, pts: 5, teach: "Ctrl+B then Z toggles zoom. Press again to un-zoom." },
        ],
        medium: [],
      },
      "Resize Panes": {
        easy: [
          { q: "How do you resize a tmux pane in a direction?", options: ["Ctrl+B then Ctrl+Arrow Key", "Ctrl+B then Shift+Arrow", "Alt+Arrow Key", "Ctrl+B then R+Arrow"], correct: 0, pts: 5, teach: "Ctrl+B then hold Ctrl and press an arrow key. Each press resizes by 1 cell in that direction." },
          { q: "Which tmux command resizes the current pane DOWN by 5 cells?", options: [":resize-pane -D 5", ":resize -down 5", ":pane-resize -D 5", ":shrink-pane 5"], correct: 0, pts: 5, teach: "In tmux command mode (Ctrl+B then :), type resize-pane -D 5. Flags: -U(up), -D(down), -L(left), -R(right)." },
          { q: "What does Ctrl+B then Space do to your panes?", options: ["Cycles through preset layouts", "Toggles fullscreen", "Swaps pane positions", "Resets pane sizes to equal"], correct: 0, pts: 4, teach: "Ctrl+B then Space cycles through tmux's built-in layouts: even-horizontal, even-vertical, main-horizontal, main-vertical, tiled." },
          { q: "How do you make all tmux panes equal size?", options: ["Ctrl+B then : then select-layout even-horizontal", "Ctrl+B then =", "Ctrl+B then E", "Ctrl+B then Ctrl+="], correct: 0, pts: 5, teach: "Use Ctrl+B : to enter command mode, then type 'select-layout even-horizontal' or 'even-vertical'. Or press Ctrl+B Space to cycle layouts until you hit an even one." },
        ],
        medium: [
          { q: "Type the tmux COMMAND to resize the current pane LEFT by 10 cells (what you'd type after Ctrl+B :)", answer: ["resize-pane -L 10"], hint: "r_____-p___ -_ 10", pts: 10, teach: "resize-pane -L 10. The flags are compass-like: -L(left), -R(right), -U(up), -D(down)." },
          { q: "Type the KEY COMBO to resize a pane downward (one cell at a time)", answer: ["ctrl+b ctrl+down", "ctrl+b then ctrl+down", "ctrl-b ctrl-down", "Ctrl+B Ctrl+Down", "Ctrl+B then Ctrl+Down", "ctrl+b ctrl+↓", "Ctrl+B Ctrl+↓"], hint: "C___+B → C___+↓", pts: 10, teach: "Ctrl+B then Ctrl+Arrow. Hold Ctrl after the prefix and tap arrow keys to resize incrementally." },
        ],
      },
      "Close Panes": {
        easy: [
          { q: "How do you close the current tmux pane?", options: ["Ctrl+B then X", "Ctrl+B then Q", "Ctrl+B then W", "Ctrl+B then &"], correct: 0, pts: 4, teach: "Ctrl+B then X kills the pane (with confirmation). & kills the whole window." },
        ],
        medium: [],
      },
    },
  },
  "Scroll & Copy": {
    icon: "📜",
    subtopics: {
      "Scroll Mode": {
        easy: [
          { q: "How do you enter scroll mode in tmux?", options: ["Ctrl+B then [", "Ctrl+B then S", "PgUp directly", "Ctrl+B then U"], correct: 0, pts: 5, teach: "Ctrl+B then [ enters copy/scroll mode. Use arrows or PgUp/PgDn. Q to exit." },
          { q: "How do you EXIT scroll mode in tmux?", options: ["Q", "Esc", "Ctrl+C", "Ctrl+B then ]"], correct: 0, pts: 4, teach: "Press Q to exit scroll mode." },
        ],
        medium: [
          { q: "Type the KEY COMBO to enter scroll mode", answer: ["ctrl+b [", "ctrl+b then [", "ctrl-b [", "Ctrl+B [", "Ctrl+B then ["], hint: "C___+B → _", pts: 10, teach: "Ctrl+B then [ — square bracket enters scroll mode." },
        ],
      },
    },
  },
  "Prefix Keys": {
    icon: "⚡",
    subtopics: {
      "tmux vs Screen Prefixes": {
        easy: [
          { q: "What is tmux's prefix key?", options: ["Ctrl+A", "Ctrl+B", "Ctrl+T", "Alt+T"], correct: 1, pts: 3, teach: "tmux = Ctrl+B. Screen = Ctrl+A." },
          { q: "What is GNU Screen's prefix key?", options: ["Ctrl+B", "Ctrl+S", "Ctrl+A", "Ctrl+X"], correct: 2, pts: 3, teach: "Screen uses Ctrl+A." },
          { q: "How does the prefix key actually work?", options: ["Press prefix, RELEASE, then action key", "Hold prefix AND press action key", "Double-tap prefix then action", "Press action then prefix"], correct: 0, pts: 3, teach: "Two separate keystrokes: prefix combo, let go, then action key." },
        ],
        medium: [],
      },
    },
  },
};

const BOSS_SCENARIOS = [
  { id: "dropped", title: "🔌 The Dropped Connection", topics: ["Session Management"], narrative: "Your SSH died mid-migration. You've reconnected. What now?", steps: [{ id: "ssh", text: "ssh user@server", order: 1 }, { id: "ls", text: "tmux ls", order: 2 }, { id: "attach", text: "tmux a -t migrate", order: 3 }], pts: 30, teach: "SSH in → list sessions → reattach. The migration never stopped." },
  { id: "devsetup", title: "🛠 The Dev Setup", topics: ["Session Management", "Panes"], narrative: "Create a named session, split screen, logs on right, code on left:", steps: [{ id: "new", text: "tmux new -s dev", order: 1 }, { id: "split", text: "Ctrl+B then %", order: 2 }, { id: "logs", text: "tail -f app.log", order: 3 }, { id: "move", text: "Ctrl+B then ←", order: 4 }, { id: "edit", text: "nano app.py", order: 5 }], pts: 30, teach: "Create → split → logs on right → move left → edit. Survives disconnects!" },
  { id: "multiwindow", title: "🪟 Multi-Window Flow", topics: ["Session Management", "Windows"], narrative: "Three windows: server, git, tests. Order the steps:", steps: [{ id: "new", text: "tmux new -s project", order: 1 }, { id: "server", text: "npm start", order: 2 }, { id: "win2", text: "Ctrl+B then C", order: 3 }, { id: "git", text: "git status", order: 4 }, { id: "win3", text: "Ctrl+B then C", order: 5 }, { id: "test", text: "npm test", order: 6 }], pts: 30, teach: "Session → server → new window → git → new window → tests. Switch with Ctrl+B N/P." },
  { id: "cleanup", title: "🧹 Server Cleanup", topics: ["Session Management"], narrative: "Old sessions everywhere. List, check one, detach, kill it:", steps: [{ id: "ls", text: "tmux ls", order: 1 }, { id: "attach", text: "tmux a -t old-session", order: 2 }, { id: "detach", text: "Ctrl+B then D", order: 3 }, { id: "kill", text: "tmux kill-session -t old-session", order: 4 }], pts: 30, teach: "List → attach to inspect → detach → kill." },
  { id: "resize", title: "◫ The Perfect Layout", topics: ["Session Management", "Panes"], narrative: "You need a wide code pane on the left and a narrow log pane on the right. Set it up and resize:", steps: [{ id: "new", text: "tmux new -s layout", order: 1 }, { id: "split", text: "Ctrl+B then %", order: 2 }, { id: "resize", text: "Ctrl+B then :resize-pane -R 20", order: 3 }, { id: "move", text: "Ctrl+B then ←", order: 4 }], pts: 30, teach: "After splitting, use resize-pane to adjust. -R 20 pushes the divider right, making the left pane wider." },
];

// ─── Helpers ───
function shuffleArray(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function gatherQuestions(sel, split) {
  let allEasy = [], allMed = [];
  for (const [tn, t] of Object.entries(QUESTION_BANK))
    for (const [sn, sub] of Object.entries(t.subtopics))
      if (sel.has(`${tn}::${sn}`)) { allEasy.push(...(sub.easy || [])); allMed.push(...(sub.medium || [])); }
  allEasy = shuffleArray(allEasy); allMed = shuffleArray(allMed);
  const st = new Set(); for (const k of sel) st.add(k.split("::")[0]);
  const eb = BOSS_SCENARIOS.filter(b => b.topics.some(t => st.has(t)));
  return { easy: allEasy.slice(0, Math.min(split.easy, allEasy.length)), med: allMed.slice(0, Math.min(split.medium, allMed.length)), bosses: shuffleArray(eb).slice(0, Math.min(split.boss, eb.length)) };
}

const MONO = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";
const BODY = "'Nunito Sans','Segoe UI',system-ui,sans-serif";
const GREEN = "#1bb76e", AMBER = "#e8a020", RED = "#e84020";

// ─── Shared UI ───
function DiffBadge({ level, pts }) {
  const c = { easy: { bg: `${GREEN}18`, bdr: `${GREEN}44`, txt: GREEN, lbl: "EASY" }, medium: { bg: `${AMBER}18`, bdr: `${AMBER}44`, txt: AMBER, lbl: "RECALL" }, boss: { bg: `${RED}18`, bdr: `${RED}44`, txt: RED, lbl: "BOSS" } }[level];
  return <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: c.txt, background: c.bg, border: `1px solid ${c.bdr}`, padding: "3px 10px", borderRadius: 4 }}>{c.lbl}</span><span style={{ fontFamily: MONO, fontSize: 11, color: "#555" }}>{pts} pts</span></div>;
}
function NextBtn({ onClick, label = "Next →" }) { return <button onClick={onClick} style={{ padding: "10px 28px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#ccc", cursor: "pointer", fontFamily: MONO, fontSize: 13, fontWeight: 600 }}>{label}</button>; }
function Teach({ color, children }) { return <div style={{ padding: "14px 16px", borderRadius: 8, background: `${color}0d`, border: `1px solid ${color}33`, marginBottom: 12 }}>{children}</div>; }

// ─── Round Components ───
function EasyRound({ question, onAnswer }) {
  const [sel, setSel] = useState(null);
  const [rev, setRev] = useState(false);
  const pick = i => { if (rev) return; setSel(i); setRev(true); };
  const ok = sel === question.correct;
  return (
    <div>
      <DiffBadge level="easy" pts={question.pts} />
      <p style={{ color: "#d0d0d0", fontSize: 15, lineHeight: 1.7, margin: "0 0 20px", fontFamily: BODY }}>{question.q}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)", bdr = "rgba(255,255,255,0.08)", clr = "#bbb";
          if (rev) { if (i === question.correct) { bg = `${GREEN}15`; bdr = `${GREEN}55`; clr = GREEN; } else if (i === sel && !ok) { bg = `${RED}15`; bdr = `${RED}55`; clr = RED; } else clr = "#444"; }
          return <button key={i} onClick={() => pick(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, border: `1.5px solid ${bdr}`, background: bg, cursor: rev ? "default" : "pointer", textAlign: "left", fontFamily: MONO, fontSize: 13, color: clr, transition: "all 0.15s" }}><span style={{ width: 24, height: 24, borderRadius: 6, background: rev && i === question.correct ? `${GREEN}22` : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, color: rev && i === question.correct ? GREEN : "#555" }}>{String.fromCharCode(65 + i)}</span><code style={{ fontSize: 13 }}>{opt}</code></button>;
        })}
      </div>
      {rev && <div style={{ marginTop: 16, animation: "fadeUp 0.35s ease" }}><Teach color={ok ? GREEN : RED}><div style={{ fontSize: 14, fontWeight: 700, color: ok ? GREEN : RED, marginBottom: 6, fontFamily: MONO }}>{ok ? `✓ Correct! +${question.pts}` : "✗ Not quite"}</div><div style={{ fontSize: 13, color: "#999", lineHeight: 1.6, fontFamily: BODY }}>{question.teach}</div></Teach><NextBtn onClick={() => onAnswer(ok ? question.pts : 0)} /></div>}
    </div>
  );
}

function MedRound({ question, onAnswer }) {
  const [input, setInput] = useState("");
  const [rev, setRev] = useState(false);
  const [hint, setHint] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const norm = s => s.toLowerCase().replace(/\s+/g, " ").trim();
  const submit = () => { if (!input.trim() || rev) return; setRev(true); };
  const ok = rev && question.answer.some(a => norm(a) === norm(input));
  const close = rev && !ok && question.answer.some(a => { const n = norm(input), t = norm(a); return t.includes(n) || n.includes(t); });
  const pts = ok ? question.pts : close ? Math.floor(question.pts / 2) : 0;
  return (
    <div>
      <DiffBadge level="medium" pts={question.pts} />
      <p style={{ color: "#d0d0d0", fontSize: 15, lineHeight: 1.7, margin: "0 0 6px", fontFamily: BODY }}>{question.q}</p>
      {!hint && !rev && <button onClick={() => setHint(true)} style={{ background: "none", border: "none", color: AMBER, fontSize: 12, fontFamily: MONO, cursor: "pointer", padding: "4px 0", marginBottom: 12, opacity: 0.7 }}>💡 Show hint</button>}
      {hint && !rev && <div style={{ fontFamily: MONO, fontSize: 13, color: AMBER, marginBottom: 12 }}>Hint: <code style={{ background: `${AMBER}12`, padding: "2px 8px", borderRadius: 4 }}>{question.hint}</code></div>}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#0a0e14", border: `1.5px solid ${rev ? (pts > 0 ? `${GREEN}55` : `${RED}55`) : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "0 14px" }}>
          <span style={{ color: "#444", fontFamily: MONO, fontSize: 13, marginRight: 8 }}>$</span>
          <input ref={ref} value={input} onChange={e => !rev && setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Type command or key combo..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e0e0e0", fontFamily: MONO, fontSize: 14, padding: "12px 0" }} readOnly={rev} />
        </div>
        {!rev && <button onClick={submit} disabled={!input.trim()} style={{ padding: "0 24px", borderRadius: 8, border: "none", background: input.trim() ? GREEN : `${GREEN}33`, color: input.trim() ? "#000" : `${GREEN}66`, cursor: input.trim() ? "pointer" : "default", fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>Enter</button>}
      </div>
      {rev && <div style={{ animation: "fadeUp 0.35s ease" }}><Teach color={ok ? GREEN : close ? AMBER : RED}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, fontFamily: MONO, color: ok ? GREEN : close ? AMBER : RED }}>{ok ? `✓ Perfect! +${question.pts}` : close ? `≈ Close! +${pts}` : "✗ Not quite"}</div><div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontFamily: MONO }}>Accepted: <code style={{ color: GREEN }}>{question.answer[0]}</code></div><div style={{ fontSize: 13, color: "#999", lineHeight: 1.6, fontFamily: BODY }}>{question.teach}</div></Teach><NextBtn onClick={() => onAnswer(pts)} /></div>}
    </div>
  );
}

function BossRound({ scenario, onAnswer }) {
  const [order, setOrder] = useState(() => shuffleArray(scenario.steps));
  const [rev, setRev] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const move = (f, t) => { if (f === t || rev) return; const n = [...order]; const [it] = n.splice(f, 1); n.splice(t, 0, it); setOrder(n); };
  const ok = order.every((s, i) => s.order === i + 1);
  const cc = order.filter((s, i) => s.order === i + 1).length;
  const pts = ok ? scenario.pts : Math.floor(scenario.pts * (cc / scenario.steps.length) * 0.5);
  return (
    <div>
      <DiffBadge level="boss" pts={scenario.pts} />
      <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: RED, marginBottom: 8 }}>{scenario.title}</div>
      <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.7, margin: "0 0 18px", fontFamily: BODY }}>{scenario.narrative}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {order.map((step, i) => {
          let bc = "rgba(255,255,255,0.08)"; if (rev) bc = step.order === i + 1 ? `${GREEN}55` : `${RED}55`;
          return <div key={step.id} draggable={!rev} onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragIdx !== null) move(dragIdx, i); setDragIdx(null); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${bc}`, background: dragIdx === i ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)", cursor: rev ? "default" : "grab", userSelect: "none" }}>
            <span style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: MONO, background: rev ? (step.order === i + 1 ? `${GREEN}22` : `${RED}22`) : "rgba(255,255,255,0.05)", color: rev ? (step.order === i + 1 ? GREEN : RED) : "#666", flexShrink: 0 }}>{i + 1}</span>
            <code style={{ fontFamily: MONO, fontSize: 13, color: "#d0d0d0", flex: 1 }}>{step.text}</code>
            {!rev && <div style={{ display: "flex", gap: 2 }}><button onClick={() => i > 0 && move(i, i - 1)} disabled={i === 0} style={{ background: "none", border: "none", color: i > 0 ? "#666" : "#333", cursor: i > 0 ? "pointer" : "default", fontSize: 14, padding: "2px 6px" }}>▲</button><button onClick={() => i < order.length - 1 && move(i, i + 1)} disabled={i === order.length - 1} style={{ background: "none", border: "none", color: i < order.length - 1 ? "#666" : "#333", cursor: i < order.length - 1 ? "pointer" : "default", fontSize: 14, padding: "2px 6px" }}>▼</button></div>}
          </div>;
        })}
      </div>
      <p style={{ color: "#555", fontSize: 11, fontFamily: MONO, marginBottom: 14 }}>Drag to reorder, or use ▲▼</p>
      {!rev && <button onClick={() => setRev(true)} style={{ padding: "12px 32px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${RED}, #e86020)`, color: "#fff", cursor: "pointer", fontFamily: MONO, fontSize: 14, fontWeight: 700 }}>Lock In Answer</button>}
      {rev && <div style={{ animation: "fadeUp 0.35s ease" }}><Teach color={ok ? GREEN : RED}><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, fontFamily: MONO, color: ok ? GREEN : pts > 0 ? AMBER : RED }}>{ok ? `🎯 Perfect! +${scenario.pts}` : pts > 0 ? `Partial — +${pts}` : "Wrong order"}</div>{!ok && <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontFamily: MONO }}>Correct: {[...scenario.steps].sort((a, b) => a.order - b.order).map(s => s.text).join(" → ")}</div>}<div style={{ fontSize: 13, color: "#999", lineHeight: 1.7, fontFamily: BODY }}>{scenario.teach}</div></Teach><NextBtn onClick={() => onAnswer(pts)} /></div>}
    </div>
  );
}

function Results({ score, maxScore, onReplay, onReconfig }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  let g, gc, msg;
  if (pct >= 90) { g = "S"; gc = "#ffd700"; msg = "Session master! Dropped connections fear you."; }
  else if (pct >= 70) { g = "A"; gc = GREEN; msg = "Solid! Core flow locked in."; }
  else if (pct >= 50) { g = "B"; gc = "#20c9b0"; msg = "Getting there! Focus on detach/reattach."; }
  else if (pct >= 30) { g = "C"; gc = AMBER; msg = "Essentials: tmux new -s NAME, Ctrl+B D, tmux a -t NAME."; }
  else { g = "D"; gc = RED; msg = "Questions shuffle — try again!"; }
  return (
    <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeUp 0.5s ease" }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${gc}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", background: `${gc}11` }}><span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 800, color: gc }}>{g}</span></div>
      <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 800, color: "#e0e0e0" }}>{score} / {maxScore}</div>
      <div style={{ fontFamily: MONO, fontSize: 13, color: "#666", marginBottom: 20 }}>{pct}%</div>
      <p style={{ color: "#999", fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 28px", fontFamily: BODY }}>{msg}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={onReplay} style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GREEN}, #20c9b0)`, color: "#000", cursor: "pointer", fontFamily: MONO, fontSize: 14, fontWeight: 700 }}>↻ Replay</button>
        <button onClick={onReconfig} style={{ padding: "14px 32px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#ccc", cursor: "pointer", fontFamily: MONO, fontSize: 14, fontWeight: 600 }}>⚙ Topics</button>
      </div>
    </div>
  );
}

// ─── Config: Proper collapsible tree ───
function ConfigScreen({ onStart, initialSelected, initialSplit }) {
  const allKeys = useMemo(() => {
    const keys = new Set();
    for (const [tn, t] of Object.entries(QUESTION_BANK)) for (const sn of Object.keys(t.subtopics)) keys.add(`${tn}::${sn}`);
    return keys;
  }, []);

  const [selected, setSelected] = useState(initialSelected || new Set(allKeys));
  const [split, setSplit] = useState(initialSplit || { easy: 5, medium: 3, boss: 1 });
  const [expanded, setExpanded] = useState(() => {
    const s = new Set(); Object.keys(QUESTION_BANK).forEach(k => s.add(k)); return s;
  });

  const toggleExpand = k => setExpanded(p => { const n = new Set(p); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const toggleSub = key => setSelected(p => { const n = new Set(p); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  const toggleTopic = tn => {
    const subs = Object.keys(QUESTION_BANK[tn].subtopics).map(s => `${tn}::${s}`);
    const allOn = subs.every(s => selected.has(s));
    setSelected(p => { const n = new Set(p); subs.forEach(s => { if (allOn) n.delete(s); else n.add(s); }); return n; });
  };

  const counts = useMemo(() => {
    let e = 0, m = 0;
    for (const [tn, t] of Object.entries(QUESTION_BANK)) for (const [sn, sub] of Object.entries(t.subtopics)) if (selected.has(`${tn}::${sn}`)) { e += (sub.easy || []).length; m += (sub.medium || []).length; }
    const st = new Set(); for (const k of selected) st.add(k.split("::")[0]);
    return { easy: e, medium: m, boss: BOSS_SCENARIOS.filter(s => s.topics.some(t => st.has(t))).length };
  }, [selected]);

  const totalQ = Math.min(split.easy, counts.easy) + Math.min(split.medium, counts.medium) + Math.min(split.boss, counts.boss);
  const canStart = selected.size > 0 && totalQ > 0;

  const Checkbox = ({ checked, indeterminate, color, size = 16, onClick }) => (
    <button onClick={onClick} style={{ width: size, height: size, borderRadius: 4, border: `2px solid ${checked ? color : indeterminate ? AMBER : "#444"}`, background: checked ? `${color}33` : indeterminate ? `${AMBER}15` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.6, color: checked ? color : AMBER, fontWeight: 700, flexShrink: 0, cursor: "pointer", padding: 0, lineHeight: 1 }}>
      {checked ? "✓" : indeterminate ? "−" : ""}
    </button>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Topic Tree */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontFamily: MONO, fontSize: 14, fontWeight: 700, color: "#e0e0e0" }}>Topic Tree</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setSelected(new Set(allKeys))} style={{ background: "none", border: "none", color: GREEN, fontFamily: MONO, fontSize: 11, cursor: "pointer" }}>All</button>
            <span style={{ color: "#333" }}>|</span>
            <button onClick={() => setSelected(new Set())} style={{ background: "none", border: "none", color: "#666", fontFamily: MONO, fontSize: 11, cursor: "pointer" }}>None</button>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
          {Object.entries(QUESTION_BANK).map(([topicName, topic], ti) => {
            const subs = Object.keys(topic.subtopics).map(s => `${topicName}::${s}`);
            const cc = subs.filter(s => selected.has(s)).length;
            const allOn = cc === subs.length;
            const someOn = cc > 0 && !allOn;
            const isOpen = expanded.has(topicName);
            const isLast = ti === Object.keys(QUESTION_BANK).length - 1;

            return (
              <div key={topicName} style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                {/* Topic row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer" }} onClick={() => toggleExpand(topicName)}>
                  <span style={{ color: "#555", fontSize: 11, fontFamily: MONO, width: 14, textAlign: "center", transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                  <Checkbox checked={allOn} indeterminate={someOn} color={GREEN} onClick={e => { e.stopPropagation(); toggleTopic(topicName); }} />
                  <span style={{ fontSize: 16 }}>{topic.icon}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: cc > 0 ? "#e0e0e0" : "#666", flex: 1 }}>{topicName}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: allOn ? GREEN : someOn ? AMBER : "#444", background: allOn ? `${GREEN}15` : someOn ? `${AMBER}10` : "transparent", padding: "2px 8px", borderRadius: 10 }}>{cc}/{subs.length}</span>
                </div>

                {/* Subtopics */}
                {isOpen && (
                  <div style={{ paddingBottom: 8 }}>
                    {Object.entries(topic.subtopics).map(([subName, sub], si) => {
                      const key = `${topicName}::${subName}`;
                      const isOn = selected.has(key);
                      const easyC = (sub.easy || []).length;
                      const medC = (sub.medium || []).length;
                      const isSubLast = si === Object.keys(topic.subtopics).length - 1;

                      return (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 14px 7px 28px", cursor: "pointer" }} onClick={() => toggleSub(key)}>
                          {/* Tree connector */}
                          <div style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: 24 }}>
                            <div style={{ position: "absolute", left: 8, top: 0, bottom: isSubLast ? "50%" : 0, width: 1, background: "rgba(255,255,255,0.08)" }} />
                            <div style={{ position: "absolute", left: 8, top: "50%", width: 10, height: 1, background: "rgba(255,255,255,0.08)" }} />
                          </div>
                          <Checkbox checked={isOn} color={GREEN} size={14} onClick={e => { e.stopPropagation(); toggleSub(key); }} />
                          <span style={{ fontFamily: MONO, fontSize: 12, color: isOn ? "#ccc" : "#555", flex: 1 }}>{subName}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            {easyC > 0 && <span style={{ fontFamily: MONO, fontSize: 9, color: GREEN, opacity: isOn ? 0.8 : 0.3, background: `${GREEN}10`, padding: "1px 6px", borderRadius: 4 }}>{easyC} easy</span>}
                            {medC > 0 && <span style={{ fontFamily: MONO, fontSize: 9, color: AMBER, opacity: isOn ? 0.8 : 0.3, background: `${AMBER}10`, padding: "1px 6px", borderRadius: 4 }}>{medC} recall</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Sliders */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 14px", fontFamily: MONO, fontSize: 14, fontWeight: 700, color: "#e0e0e0" }}>Difficulty Mix</h2>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "easy", label: "Easy", sub: "multiple choice", color: GREEN, max: counts.easy, icon: "○" },
            { key: "medium", label: "Recall", sub: "type from memory", color: AMBER, max: counts.medium, icon: "◐" },
            { key: "boss", label: "Boss", sub: "sequence scenario", color: RED, max: counts.boss, icon: "●" },
          ].map(({ key, label, sub, color, max, icon }) => (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "baseline" }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color }}>
                  {icon} {label} <span style={{ color: "#444", fontSize: 10 }}>{sub}</span>
                </span>
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>
                  {Math.min(split[key], max)}<span style={{ color: "#333", fontWeight: 400, fontSize: 10 }}>/{max}</span>
                </span>
              </div>
              <input type="range" min={0} max={Math.max(max, 1)} value={Math.min(split[key], max)} onChange={e => setSplit(s => ({ ...s, [key]: parseInt(e.target.value) }))} style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 12, color: "#888" }}>Total questions</span>
            <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 800, color: totalQ > 0 ? "#e0e0e0" : "#555" }}>{totalQ}</span>
          </div>
        </div>
      </div>

      <button onClick={() => canStart && onStart(selected, split)} disabled={!canStart} style={{ width: "100%", padding: "16px", borderRadius: 10, border: "none", background: canStart ? `linear-gradient(135deg, ${GREEN}, #20c9b0)` : "rgba(255,255,255,0.05)", color: canStart ? "#000" : "#444", cursor: canStart ? "pointer" : "default", fontFamily: MONO, fontSize: 15, fontWeight: 700 }}>
        {canStart ? `▶  Start (${totalQ} questions)` : "Select topics & set at least 1 question"}
      </button>
    </div>
  );
}

// ─── Main ───
export default function App() {
  const [phase, setPhase] = useState("config");
  const [selSubs, setSelSubs] = useState(null);
  const [split, setSplit] = useState({ easy: 5, medium: 3, boss: 1 });
  const [qs, setQs] = useState({ easy: [], med: [], bosses: [] });
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);

  const total = qs.easy.length + qs.med.length + qs.bosses.length;
  const maxScore = qs.easy.reduce((s, q) => s + q.pts, 0) + qs.med.reduce((s, q) => s + q.pts, 0) + qs.bosses.reduce((s, q) => s + q.pts, 0);

  const start = (subs, sp) => { setSelSubs(subs); setSplit(sp); setQs(gatherQuestions(subs, sp)); setQi(0); setScore(0); setPhase("playing"); };
  const answer = pts => { setScore(s => s + pts); if (qi + 1 >= total) setPhase("results"); else setQi(i => i + 1); };
  const replay = () => { setQs(gatherQuestions(selSubs, split)); setQi(0); setScore(0); setPhase("playing"); };

  let cq, rt;
  if (qi < qs.easy.length) { cq = qs.easy[qi]; rt = "easy"; }
  else if (qi < qs.easy.length + qs.med.length) { cq = qs.med[qi - qs.easy.length]; rt = "medium"; }
  else { cq = qs.bosses[qi - qs.easy.length - qs.med.length]; rt = "boss"; }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e0e0e0", fontFamily: BODY, padding: "24px 20px 48px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #444; }
        input[type="range"] { height: 6px; border-radius: 3px; }
      `}</style>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 24, animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>🕹</span>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 18, fontWeight: 800, background: `linear-gradient(135deg, ${GREEN}, ${AMBER})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>tmux Trainer</h1>
            {phase === "playing" && <button onClick={() => setPhase("config")} style={{ marginLeft: "auto", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#666", fontFamily: MONO, fontSize: 11, padding: "4px 12px", cursor: "pointer" }}>⚙ Config</button>}
          </div>
          <p style={{ margin: 0, fontFamily: BODY, fontSize: 12, color: "#555" }}>
            {phase === "config" ? "Expand topics, pick subtopics, set your difficulty mix" : "Easy → Recall → Boss — shuffled each game"}
          </p>
        </div>

        {phase === "config" && <ConfigScreen onStart={start} initialSelected={selSubs} initialSplit={split} />}
        {phase === "results" && <Results score={score} maxScore={maxScore} onReplay={replay} onReconfig={() => setPhase("config")} />}

        {phase === "playing" && total > 0 && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase" }}>Q {Math.min(qi + 1, total)} / {total}</span>
                <span style={{ fontFamily: MONO, fontSize: 14, color: AMBER, fontWeight: 700 }}>{score} pts</span>
              </div>
              <div style={{ height: 4, background: "#1a1f2b", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(qi / total) * 100}%`, background: `linear-gradient(90deg, ${GREEN}, #20c9b0)`, borderRadius: 2, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
            </div>
            {qi === 0 && qs.easy.length > 0 && <div style={{ fontFamily: MONO, fontSize: 11, color: GREEN, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, animation: "fadeUp 0.3s ease" }}>── Recognition ──</div>}
            {qi === qs.easy.length && qs.med.length > 0 && <div style={{ fontFamily: MONO, fontSize: 11, color: AMBER, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, animation: "fadeUp 0.3s ease" }}>── Type From Memory ──</div>}
            {qi === qs.easy.length + qs.med.length && qs.bosses.length > 0 && <div style={{ fontFamily: MONO, fontSize: 11, color: RED, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, animation: "fadeUp 0.3s ease" }}>── Boss Round ──</div>}
            <div key={qi} style={{ animation: "fadeUp 0.35s ease" }}>
              {rt === "easy" && cq && <EasyRound question={cq} onAnswer={answer} />}
              {rt === "medium" && cq && <MedRound question={cq} onAnswer={answer} />}
              {rt === "boss" && cq && <BossRound scenario={cq} onAnswer={answer} />}
            </div>
          </>
        )}
        {phase === "playing" && total === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#666", fontFamily: MONO, fontSize: 13 }}>No questions match. <button onClick={() => setPhase("config")} style={{ background: "none", border: "none", color: GREEN, fontFamily: MONO, cursor: "pointer", textDecoration: "underline" }}>Config</button></div>}
      </div>
    </div>
  );
}
