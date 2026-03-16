import { useState, useEffect, useRef } from "react";

const TOOLS = {
  tmux: {
    name: "tmux",
    tagline: "Terminal Multiplexer — the modern standard",
    color: "#1bb76e",
    icon: "⧉",
    install: [
      { os: "Ubuntu/Debian", cmd: "sudo apt install tmux" },
      { os: "macOS", cmd: "brew install tmux" },
      { os: "Alpine", cmd: "apk add tmux" },
    ],
    prefix: "Ctrl + B",
    prefixNote: "Press Ctrl+B first, release, THEN press the next key",
    sections: [
      {
        title: "Session Survival (Your #1 Need)",
        icon: "🔌",
        desc: "Disconnect from SSH? No problem. Your session lives on.",
        commands: [
          { keys: "tmux", desc: "Start a new session", type: "cli" },
          { keys: "tmux new -s work", desc: "Start named session 'work'", type: "cli" },
          { keys: "Ctrl+B → D", desc: "Detach (session keeps running!)", type: "combo" },
          { keys: "tmux ls", desc: "List all sessions", type: "cli" },
          { keys: "tmux attach", desc: "Reattach to last session", type: "cli" },
          { keys: "tmux a -t work", desc: "Reattach to session 'work'", type: "cli" },
          { keys: "tmux kill-session -t work", desc: "Kill session 'work'", type: "cli" },
        ],
      },
      {
        title: "Windows (like browser tabs)",
        icon: "🪟",
        desc: "Multiple terminal views inside one session.",
        commands: [
          { keys: "Ctrl+B → C", desc: "Create new window", type: "combo" },
          { keys: "Ctrl+B → N", desc: "Next window", type: "combo" },
          { keys: "Ctrl+B → P", desc: "Previous window", type: "combo" },
          { keys: "Ctrl+B → 0-9", desc: "Jump to window by number", type: "combo" },
          { keys: "Ctrl+B → ,", desc: "Rename current window", type: "combo" },
          { keys: "Ctrl+B → &", desc: "Kill current window", type: "combo" },
        ],
      },
      {
        title: "Panes (split screen)",
        icon: "◫",
        desc: "Split your terminal into multiple areas.",
        commands: [
          { keys: 'Ctrl+B → %', desc: "Split vertically (left|right)", type: "combo" },
          { keys: 'Ctrl+B → "', desc: "Split horizontally (top/bottom)", type: "combo" },
          { keys: "Ctrl+B → Arrow Keys", desc: "Move between panes", type: "combo" },
          { keys: "Ctrl+B → X", desc: "Kill current pane", type: "combo" },
          { keys: "Ctrl+B → Z", desc: "Zoom pane (toggle fullscreen)", type: "combo" },
          { keys: "Ctrl+B → Space", desc: "Cycle pane layouts", type: "combo" },
        ],
      },
      {
        title: "Scroll & Copy",
        icon: "📜",
        desc: "Scroll back through terminal output.",
        commands: [
          { keys: "Ctrl+B → [", desc: "Enter scroll mode (use arrows/PgUp)", type: "combo" },
          { keys: "Q", desc: "Exit scroll mode", type: "key" },
        ],
      },
    ],
    scenarios: [
      {
        title: "SSH dropped — resume work",
        steps: [
          { action: "SSH back into your server", cmd: "ssh user@server" },
          { action: "See what sessions are still running", cmd: "tmux ls" },
          { action: "Reattach to your session", cmd: "tmux attach" },
          { action: "Everything is exactly where you left it!", cmd: null },
        ],
      },
      {
        title: "Long-running task (safe from disconnect)",
        steps: [
          { action: "Create a named session", cmd: "tmux new -s build" },
          { action: "Start your long task", cmd: "npm run build:all" },
          { action: "Detach safely", cmd: "Ctrl+B → D" },
          { action: "Go home, sleep, reconnect tomorrow", cmd: "tmux a -t build" },
        ],
      },
      {
        title: "Monitor logs + edit code side-by-side",
        steps: [
          { action: "Start a session", cmd: "tmux new -s dev" },
          { action: "Split screen vertically", cmd: "Ctrl+B → %" },
          { action: "Run your log tail on the right", cmd: "tail -f /var/log/app.log" },
          { action: "Move to left pane", cmd: "Ctrl+B → ←" },
          { action: "Edit your code", cmd: "nano app.py" },
        ],
      },
    ],
  },
  screen: {
    name: "GNU Screen",
    tagline: "The classic — available almost everywhere",
    color: "#e8a020",
    icon: "▣",
    install: [
      { os: "Ubuntu/Debian", cmd: "sudo apt install screen" },
      { os: "macOS", cmd: "brew install screen" },
      { os: "Alpine", cmd: "apk add screen" },
    ],
    prefix: "Ctrl + A",
    prefixNote: "Press Ctrl+A first, release, THEN press the next key",
    sections: [
      {
        title: "Session Survival (Your #1 Need)",
        icon: "🔌",
        desc: "Same idea — your session persists after disconnect.",
        commands: [
          { keys: "screen", desc: "Start a new session", type: "cli" },
          { keys: "screen -S work", desc: "Start named session 'work'", type: "cli" },
          { keys: "Ctrl+A → D", desc: "Detach (session keeps running!)", type: "combo" },
          { keys: "screen -ls", desc: "List all sessions", type: "cli" },
          { keys: "screen -r", desc: "Reattach to last session", type: "cli" },
          { keys: "screen -r work", desc: "Reattach to session 'work'", type: "cli" },
          { keys: "screen -X -S work quit", desc: "Kill session 'work'", type: "cli" },
        ],
      },
      {
        title: "Windows (like browser tabs)",
        icon: "🪟",
        desc: "Multiple shells inside one screen session.",
        commands: [
          { keys: "Ctrl+A → C", desc: "Create new window", type: "combo" },
          { keys: "Ctrl+A → N", desc: "Next window", type: "combo" },
          { keys: "Ctrl+A → P", desc: "Previous window", type: "combo" },
          { keys: "Ctrl+A → 0-9", desc: "Jump to window by number", type: "combo" },
          { keys: "Ctrl+A → A", desc: "Rename current window", type: "combo" },
          { keys: "Ctrl+A → K", desc: "Kill current window", type: "combo" },
        ],
      },
      {
        title: "Split Screen",
        icon: "◫",
        desc: "Screen can split too, but it's clunkier than tmux.",
        commands: [
          { keys: "Ctrl+A → S", desc: "Split horizontally", type: "combo" },
          { keys: "Ctrl+A → |", desc: "Split vertically (if supported)", type: "combo" },
          { keys: "Ctrl+A → Tab", desc: "Move between regions", type: "combo" },
          { keys: "Ctrl+A → X", desc: "Close current region", type: "combo" },
        ],
      },
      {
        title: "Scroll & Copy",
        icon: "📜",
        desc: "Scroll back through output history.",
        commands: [
          { keys: "Ctrl+A → [", desc: "Enter scroll/copy mode", type: "combo" },
          { keys: "Esc", desc: "Exit scroll mode", type: "key" },
        ],
      },
    ],
    scenarios: [
      {
        title: "SSH dropped — resume work",
        steps: [
          { action: "SSH back into your server", cmd: "ssh user@server" },
          { action: "See what sessions are still running", cmd: "screen -ls" },
          { action: "Reattach to your session", cmd: "screen -r" },
          { action: "Everything is exactly where you left it!", cmd: null },
        ],
      },
      {
        title: "Long-running task (safe from disconnect)",
        steps: [
          { action: "Create a named session", cmd: "screen -S build" },
          { action: "Start your long task", cmd: "npm run build:all" },
          { action: "Detach safely", cmd: "Ctrl+A → D" },
          { action: "Go home, sleep, reconnect tomorrow", cmd: "screen -r build" },
        ],
      },
    ],
  },
};

const COMPARISON = [
  { feature: "Prefix key", tmux: "Ctrl+B", screen: "Ctrl+A" },
  { feature: "New session", tmux: "tmux new -s NAME", screen: "screen -S NAME" },
  { feature: "Detach", tmux: "Ctrl+B → D", screen: "Ctrl+A → D" },
  { feature: "List sessions", tmux: "tmux ls", screen: "screen -ls" },
  { feature: "Reattach", tmux: "tmux a -t NAME", screen: "screen -r NAME" },
  { feature: "New window", tmux: "Ctrl+B → C", screen: "Ctrl+A → C" },
  { feature: "Next window", tmux: "Ctrl+B → N", screen: "Ctrl+A → N" },
  { feature: "Split horizontal", tmux: 'Ctrl+B → "', screen: "Ctrl+A → S" },
  { feature: "Split vertical", tmux: "Ctrl+B → %", screen: "Ctrl+A → |" },
  { feature: "Scroll mode", tmux: "Ctrl+B → [", screen: "Ctrl+A → [" },
];

function KeyBadge({ text, type, accentColor }) {
  const isCombo = type === "combo";
  const isCli = type === "cli";
  if (isCli) {
    return (
      <code
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: 13,
          background: "rgba(0,0,0,0.5)",
          color: accentColor,
          padding: "3px 10px",
          borderRadius: 4,
          border: `1px solid ${accentColor}33`,
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      >
        $ {text}
      </code>
    );
  }
  if (isCombo) {
    const parts = text.split(" → ");
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {parts.map((p, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {i > 0 && (
              <span style={{ color: "#666", fontSize: 11, fontWeight: 700 }}>then</span>
            )}
            <kbd
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                background: "rgba(255,255,255,0.08)",
                color: "#e0e0e0",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
                whiteSpace: "nowrap",
              }}
            >
              {p}
            </kbd>
          </span>
        ))}
      </span>
    );
  }
  return (
    <kbd
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        background: "rgba(255,255,255,0.08)",
        color: "#e0e0e0",
        padding: "2px 8px",
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </kbd>
  );
}

function CommandRow({ cmd, accentColor, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(200px, auto) 1fr",
        gap: 16,
        padding: "8px 12px",
        borderRadius: 6,
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "background 0.15s",
        alignItems: "center",
        animation: `fadeSlideIn 0.3s ease ${index * 0.03}s both`,
      }}
    >
      <KeyBadge text={cmd.keys} type={cmd.type} accentColor={accentColor} />
      <span style={{ color: "#aaa", fontSize: 13, lineHeight: 1.5 }}>{cmd.desc}</span>
    </div>
  );
}

function ScenarioCard({ scenario, accentColor, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        overflow: "hidden",
        animation: `fadeSlideIn 0.4s ease ${index * 0.1}s both`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#e0e0e0",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          fontWeight: 600,
          textAlign: "left",
        }}
      >
        <span>
          <span style={{ color: accentColor, marginRight: 8 }}>▶</span>
          {scenario.title}
        </span>
        <span
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            fontSize: 12,
            color: "#666",
          }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px" }}>
          {scenario.steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 0",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: accentColor + "22",
                  color: accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: 1,
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#ccc", fontSize: 13, marginBottom: step.cmd ? 6 : 0 }}>
                  {step.action}
                </div>
                {step.cmd && (
                  <code
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      background: "rgba(0,0,0,0.4)",
                      color: accentColor,
                      padding: "3px 10px",
                      borderRadius: 4,
                      display: "inline-block",
                    }}
                  >
                    {step.cmd}
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolView({ tool }) {
  const [activeSection, setActiveSection] = useState(0);
  const [tab, setTab] = useState("commands");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          background: "rgba(0,0,0,0.3)",
          borderRadius: 8,
          padding: 4,
        }}
      >
        {["commands", "scenarios", "install"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "9px 16px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              background: tab === t ? tool.color + "22" : "transparent",
              color: tab === t ? tool.color : "#666",
              transition: "all 0.15s",
            }}
          >
            {t === "commands" ? "⌨ Commands" : t === "scenarios" ? "▶ Scenarios" : "📦 Install"}
          </button>
        ))}
      </div>

      {tab === "install" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 8px" }}>
            Install {tool.name} on your server, then connect via SSH as usual:
          </p>
          {tool.install.map((inst, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 8,
                animation: `fadeSlideIn 0.3s ease ${i * 0.08}s both`,
              }}
            >
              <span style={{ color: "#888", fontSize: 12, minWidth: 100, fontWeight: 600 }}>
                {inst.os}
              </span>
              <code
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: tool.color,
                }}
              >
                {inst.cmd}
              </code>
            </div>
          ))}
        </div>
      )}

      {tab === "commands" && (
        <div>
          <div
            style={{
              background: `${tool.color}11`,
              border: `1px solid ${tool.color}33`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>⚡</span>
            <div>
              <strong style={{ color: tool.color, fontSize: 13 }}>Prefix key: {tool.prefix}</strong>
              <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{tool.prefixNote}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {tool.sections.map((sec, i) => (
              <button
                key={i}
                onClick={() => setActiveSection(i)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: `1px solid ${activeSection === i ? tool.color + "66" : "rgba(255,255,255,0.08)"}`,
                  background: activeSection === i ? tool.color + "18" : "transparent",
                  color: activeSection === i ? tool.color : "#888",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {sec.icon} {sec.title}
              </button>
            ))}
          </div>

          <div>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
              {tool.sections[activeSection].desc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {tool.sections[activeSection].commands.map((cmd, i) => (
                <CommandRow key={i} cmd={cmd} accentColor={tool.color} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "scenarios" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 4px" }}>
            Real-world walkthroughs — click to expand each one:
          </p>
          {tool.scenarios.map((sc, i) => (
            <ScenarioCard key={i} scenario={sc} accentColor={tool.color} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function ComparisonView() {
  return (
    <div style={{ overflowX: "auto" }}>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }}>
        Side-by-side equivalents. Most commands follow the same logic — the main difference is the prefix key 
        (<span style={{ color: TOOLS.tmux.color }}>Ctrl+B</span> vs{" "}
        <span style={{ color: TOOLS.screen.color }}>Ctrl+A</span>).
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 3px",
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "#666", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              Action
            </th>
            <th style={{ textAlign: "left", padding: "8px 12px", color: TOOLS.tmux.color, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              tmux
            </th>
            <th style={{ textAlign: "left", padding: "8px 12px", color: TOOLS.screen.color, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              screen
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((row, i) => (
            <tr
              key={i}
              style={{
                animation: `fadeSlideIn 0.3s ease ${i * 0.04}s both`,
              }}
            >
              <td style={{ padding: "8px 12px", color: "#aaa", background: "rgba(255,255,255,0.02)", borderRadius: "6px 0 0 6px" }}>
                {row.feature}
              </td>
              <td style={{ padding: "8px 12px", color: TOOLS.tmux.color, background: "rgba(255,255,255,0.02)" }}>
                {row.tmux}
              </td>
              <td style={{ padding: "8px 12px", color: TOOLS.screen.color, background: "rgba(255,255,255,0.02)", borderRadius: "0 6px 6px 0" }}>
                {row.screen}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuickDecision() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 20,
        marginTop: 0,
      }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 15, margin: "0 0 14px", fontFamily: "'JetBrains Mono', monospace" }}>
        💡 Which should I use?
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          style={{
            background: TOOLS.tmux.color + "0d",
            border: `1px solid ${TOOLS.tmux.color}33`,
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ color: TOOLS.tmux.color, fontWeight: 700, fontSize: 14, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            ⧉ Use tmux if…
          </div>
          <ul style={{ color: "#aaa", fontSize: 12, lineHeight: 2, margin: 0, paddingLeft: 18 }}>
            <li>You can install software on the server</li>
            <li>You want easy split-pane workflows</li>
            <li>You want the more modern, active project</li>
            <li>You're setting things up fresh</li>
          </ul>
        </div>
        <div
          style={{
            background: TOOLS.screen.color + "0d",
            border: `1px solid ${TOOLS.screen.color}33`,
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ color: TOOLS.screen.color, fontWeight: 700, fontSize: 14, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            ▣ Use screen if…
          </div>
          <ul style={{ color: "#aaa", fontSize: 12, lineHeight: 2, margin: 0, paddingLeft: 18 }}>
            <li>It's already installed (often is by default)</li>
            <li>You mainly need session persistence</li>
            <li>You're on older/minimal systems</li>
            <li>You prefer Ctrl+A as the prefix</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTool, setActiveTool] = useState("tmux");
  const [view, setView] = useState("learn"); // learn | compare

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#e0e0e0",
        fontFamily: "'Nunito Sans', 'Segoe UI', sans-serif",
        padding: "24px 20px 40px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700;800&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, animation: "fadeSlideIn 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>⧉</span>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                background: "linear-gradient(135deg, #1bb76e, #e8a020)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Session Survival Guide
            </h1>
          </div>
          <p style={{ color: "#666", fontSize: 13, margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
            Never lose your SSH work again. Learn <strong style={{ color: TOOLS.tmux.color }}>tmux</strong> and{" "}
            <strong style={{ color: TOOLS.screen.color }}>screen</strong> — terminal multiplexers that keep your
            sessions alive when your connection drops.
          </p>
        </div>

        {/* Main nav */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {["learn", "compare"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: view === v ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                background: view === v ? "rgba(255,255,255,0.06)" : "transparent",
                color: view === v ? "#e0e0e0" : "#666",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Nunito Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {v === "learn" ? "📖 Learn" : "⚖ Compare"}
            </button>
          ))}
        </div>

        {view === "compare" ? (
          <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
            <ComparisonView />
            <div style={{ marginTop: 20 }}>
              <QuickDecision />
            </div>
          </div>
        ) : (
          <>
            {/* Tool tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {Object.values(TOOLS).map((t) => (
                <button
                  key={t.name}
                  onClick={() => setActiveTool(t.name === "tmux" ? "tmux" : "screen")}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `2px solid ${activeTool === (t.name === "tmux" ? "tmux" : "screen") ? t.color + "66" : "rgba(255,255,255,0.06)"}`,
                    background:
                      activeTool === (t.name === "tmux" ? "tmux" : "screen")
                        ? t.color + "0d"
                        : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                  <div
                    style={{
                      color: activeTool === (t.name === "tmux" ? "tmux" : "screen") ? t.color : "#888",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{t.tagline}</div>
                </button>
              ))}
            </div>

            <div style={{ animation: "fadeSlideIn 0.3s ease" }} key={activeTool}>
              <ToolView tool={TOOLS[activeTool]} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
