# Terminal Multiplexer Reference — agents.md

A complete reference for **tmux** and **GNU Screen**: the two tools that keep your CLI sessions alive when SSH drops out. Written for someone coming from Windows who needs to SSH into Linux boxes and not lose work.

---

## The Core Concept

When you SSH into a server and run a command, that command is tied to your SSH connection. If the connection drops, the command dies. Terminal multiplexers solve this by running a **server process** on the remote machine that holds your sessions independently of your SSH connection.

```
Without multiplexer:          With multiplexer:
┌──────────┐                  ┌──────────┐
│ Your PC  │──SSH──▶ shell    │ Your PC  │──SSH──▶ tmux client
└──────────┘       (dies if   └──────────┘           │
                    SSH dies)                    tmux server (persists!)
                                                     │
                                                   shell (keeps running)
```

You can **detach** from the multiplexer (or just lose your connection), and the server keeps every process alive. When you reconnect, you **reattach** and everything is exactly where you left it.

---

## Which Tool to Use

| Factor | tmux | GNU Screen |
|--------|------|------------|
| Active development | Yes (actively maintained) | Minimal (legacy) |
| Default on most servers | Sometimes | Often pre-installed |
| Pane splitting | Excellent, intuitive | Clunky, limited |
| Pane resizing | Built-in key combos + commands | Very limited |
| Scripting / automation | Powerful command interface | Basic |
| Prefix key | Ctrl+B | Ctrl+A |
| Learning curve | Moderate | Moderate |

**Recommendation**: Use tmux if you can install it. Fall back to screen if it's all that's available.

---

## tmux

### How the Prefix Key Works

tmux uses a **two-step** keystroke system. The prefix is **Ctrl+B** by default.

1. Press `Ctrl+B` (hold Ctrl, tap B)
2. **Release both keys**
3. Press the action key (e.g., D for detach)

This is NOT a three-key chord. It's two separate keypresses. The prefix tells tmux "the next key is a command, not terminal input."

### Session Lifecycle

Sessions are the top-level container. Each session can contain multiple windows, each window can contain multiple panes.

```
Session "dev"
├── Window 0: "editor"
│   ├── Pane 0 (vim)
│   └── Pane 1 (terminal)
├── Window 1: "logs"
│   └── Pane 0 (tail -f)
└── Window 2: "git"
    └── Pane 0 (shell)
```

#### Start

| Command | What it does |
|---------|-------------|
| `tmux` | Start unnamed session |
| `tmux new -s NAME` | Start named session |
| `tmux new -s NAME -d` | Start named session detached (background) |

#### Detach

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+B` → `D` | Detach from current session |

The session keeps running. All processes inside it continue.

#### List

| Command | What it does |
|---------|-------------|
| `tmux ls` | List all sessions |
| `tmux list-sessions` | Same thing, long form |

Output looks like: `work: 3 windows (created Mon Mar 16 10:00:00 2026)`

#### Reattach

| Command | What it does |
|---------|-------------|
| `tmux attach` | Attach to most recent session |
| `tmux a` | Short form |
| `tmux a -t NAME` | Attach to specific session |
| `tmux a -dt NAME` | Detach others, then attach (force takeover) |

#### Kill

| Command | What it does |
|---------|-------------|
| `tmux kill-session -t NAME` | Kill a specific session |
| `tmux kill-server` | Kill ALL sessions (nuclear option) |

### Windows (Tabs)

Windows are like browser tabs inside a session.

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+B` → `C` | **C**reate new window |
| `Ctrl+B` → `N` | **N**ext window |
| `Ctrl+B` → `P` | **P**revious window |
| `Ctrl+B` → `0-9` | Jump to window by number |
| `Ctrl+B` → `,` | Rename current window |
| `Ctrl+B` → `W` | Visual window picker (interactive list) |
| `Ctrl+B` → `&` | Kill current window (with confirmation) |

### Panes (Split Screen)

Panes divide a single window into multiple terminal areas.

#### Splitting

| Shortcut | What it does | Memory aid |
|----------|-------------|------------|
| `Ctrl+B` → `%` | Split left \| right | % has two circles side by side |
| `Ctrl+B` → `"` | Split top / bottom | " has two dots stacked |

#### Navigating

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+B` → `←↑→↓` | Move to pane in that direction |
| `Ctrl+B` → `O` | Cycle to next pane |
| `Ctrl+B` → `;` | Toggle to last active pane |
| `Ctrl+B` → `Q` | Flash pane numbers, then type number to jump |

#### Resizing

This is the area people forget most. There are two approaches:

**Approach 1: Key combos (incremental, one cell at a time)**

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+B` → `Ctrl+↑` | Resize pane upward |
| `Ctrl+B` → `Ctrl+↓` | Resize pane downward |
| `Ctrl+B` → `Ctrl+←` | Resize pane left |
| `Ctrl+B` → `Ctrl+→` | Resize pane right |

Note: after pressing `Ctrl+B`, keep holding Ctrl and tap the arrow key. Each tap moves the boundary by 1 cell. You can tap repeatedly.

**Approach 2: Command mode (precise, by N cells)**

Press `Ctrl+B` → `:` to enter command mode, then type:

| Command | What it does |
|---------|-------------|
| `resize-pane -U N` | Resize up by N cells |
| `resize-pane -D N` | Resize down by N cells |
| `resize-pane -L N` | Resize left by N cells |
| `resize-pane -R N` | Resize right by N cells |

Example: `resize-pane -R 20` pushes the divider 20 cells to the right.

**Approach 3: Preset layouts**

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+B` → `Space` | Cycle through built-in layouts |
| `Ctrl+B` → `:` then `select-layout even-horizontal` | All panes equal width |
| `Ctrl+B` → `:` then `select-layout even-vertical` | All panes equal height |
| `Ctrl+B` → `:` then `select-layout main-horizontal` | One big top, rest below |
| `Ctrl+B` → `:` then `select-layout main-vertical` | One big left, rest right |
| `Ctrl+B` → `:` then `select-layout tiled` | Grid arrangement |

#### Other Pane Operations

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+B` → `Z` | Zoom pane (toggle fullscreen / restore) |
| `Ctrl+B` → `X` | Kill current pane (with confirmation) |
| `Ctrl+B` → `{` | Swap pane with previous |
| `Ctrl+B` → `}` | Swap pane with next |
| `Ctrl+B` → `!` | Break pane into its own window |

### Scroll / Copy Mode

By default you can't scroll up in tmux with your mouse wheel or PgUp. You need to enter copy mode first.

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+B` → `[` | Enter copy/scroll mode |
| `Q` | Exit copy mode |
| Arrow keys / PgUp / PgDn | Navigate while in copy mode |
| `Space` (in copy mode) | Start selection |
| `Enter` (in copy mode) | Copy selection to tmux buffer |
| `Ctrl+B` → `]` | Paste from tmux buffer |

### Command Mode

Press `Ctrl+B` → `:` to open the command prompt at the bottom of the screen. This accepts any tmux command, such as:

- `resize-pane -D 10`
- `select-layout even-horizontal`
- `rename-window myname`
- `swap-window -t 0`
- `set -g mouse on` (enable mouse support for the session)

---

## GNU Screen

### Prefix Key

Screen uses **Ctrl+A** as its prefix. Same two-step system as tmux.

### Session Lifecycle

| Action | Command / Shortcut |
|--------|-------------------|
| Start unnamed | `screen` |
| Start named | `screen -S NAME` |
| Detach | `Ctrl+A` → `D` |
| List sessions | `screen -ls` |
| Reattach last | `screen -r` |
| Reattach specific | `screen -r NAME` |
| Force reattach | `screen -dr NAME` |
| Kill session | `screen -X -S NAME quit` |

### Windows

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+A` → `C` | Create new window |
| `Ctrl+A` → `N` | Next window |
| `Ctrl+A` → `P` | Previous window |
| `Ctrl+A` → `0-9` | Jump to window by number |
| `Ctrl+A` → `A` | Rename window |
| `Ctrl+A` → `"` | Visual window list |
| `Ctrl+A` → `K` | Kill current window |

### Split Regions

Screen's split support is less polished than tmux's.

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+A` → `S` | Split horizontally |
| `Ctrl+A` → `\|` | Split vertically (may not work in all versions) |
| `Ctrl+A` → `Tab` | Move between regions |
| `Ctrl+A` → `X` | Close current region |

Important: after splitting, the new region is **empty**. You must press `Ctrl+A` → `Tab` to move into it, then `Ctrl+A` → `C` to create a window there (or `Ctrl+A` → `0-9` to assign one).

### Scroll Mode

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+A` → `[` | Enter copy/scroll mode |
| `Esc` | Exit scroll mode |

---

## The Recovery Flow (Memorise This)

When your SSH connection drops, here is what you do every single time:

```
1. ssh user@server          ← reconnect
2. tmux ls                  ← see what's running  (or: screen -ls)
3. tmux a -t NAME           ← reattach            (or: screen -r NAME)
```

That's it. Three commands. Everything is where you left it.

---

## Common Workflows

### Long-Running Build (safe from disconnect)

```bash
ssh user@server
tmux new -s build
npm run build:all            # starts your long task
# Press Ctrl+B then D to detach
# Close laptop, go home, sleep
# Next day:
ssh user@server
tmux a -t build              # everything still running
```

### Side-by-Side Logs + Editor

```bash
tmux new -s dev
# You're in the left pane by default
nano app.py                  # edit code here
# Press Ctrl+B then % to split right
tail -f /var/log/app.log     # logs stream here
# Press Ctrl+B then ← to go back to editor
# Press Ctrl+B then : then type: resize-pane -R 15
# Now editor pane is wider
```

### Three-Window Workflow

```bash
tmux new -s project
npm start                    # Window 0: dev server
# Ctrl+B C                  # Window 1: create new
git status                   # use for git
# Ctrl+B C                  # Window 2: create new
npm test -- --watch          # use for tests
# Ctrl+B 0/1/2 to jump between them
```

---

## Troubleshooting

**"sessions should be nested with care"** — You tried to start tmux inside tmux. You're already in a session. Use `Ctrl+B C` for a new window instead.

**"no sessions"** — `tmux ls` found nothing. Either the session was killed, the server rebooted, or you're on the wrong machine.

**"already attached"** — Someone (or another terminal of yours) is already attached. Use `tmux a -dt NAME` to steal the session.

**Can't scroll** — Press `Ctrl+B` then `[` first. Then use arrows/PgUp. Press `Q` to exit.

**Mouse doesn't work** — Run `tmux set -g mouse on` inside a session, or add `set -g mouse on` to `~/.tmux.conf`.

**Pane too small** — Use `Ctrl+B Z` to zoom it temporarily, or resize with `Ctrl+B : resize-pane -R 20`.
