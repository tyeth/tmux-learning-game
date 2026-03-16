---
name: tmux-trainer-content
description: Add new questions, topics, subtopics, and boss scenarios to the tmux Trainer game. Use this skill whenever you need to expand the question bank, add a new topic category, create new boss round scenarios, or rebalance difficulty. Also use when the user says "add questions about X", "new topic for Y", "more boss rounds", or "expand the trainer". Consult agents.md for accurate tmux/screen reference material before writing any new content.
---

# tmux Trainer — Content Authoring Skill

This skill describes how to add content to the tmux Trainer React app. The game has three question types across a topic/subtopic tree structure. Follow this guide to add content correctly without breaking the game.

## Before Writing Content

Read `agents.md` first. It is the authoritative reference for all tmux and screen commands, shortcuts, and workflows. Every question, answer, and teach-back in the game must be accurate against that document. If `agents.md` doesn't cover the topic you want to add, update `agents.md` first, then write questions.

## Architecture Overview

All game content lives in two data structures at the top of the React file:

1. **`QUESTION_BANK`** — A nested object: Topic → Subtopic → { easy[], medium[] }
2. **`BOSS_SCENARIOS`** — A flat array of scenario objects

The config screen builds its tree UI directly from `QUESTION_BANK`'s keys. Adding a new topic or subtopic to the object automatically creates the corresponding checkbox in the tree — no UI code changes needed.

## Adding Easy Questions (Multiple Choice)

Easy questions are recognition-based. The user picks from 4 options. Worth 3–5 points.

### Structure

```js
{
  q: "The question text — conversational, direct",
  options: ["Correct answer", "Plausible wrong", "Plausible wrong", "Plausible wrong"],
  correct: 0,          // index of the correct option (0-based)
  pts: 3,              // 3 for basic, 4 for moderate, 5 for tricky
  teach: "Explanation shown after answering. Keep it 1-2 sentences. Include a mnemonic or memory aid if possible."
}
```

### Rules

- Always 4 options. No more, no fewer.
- `correct` is a 0-based index pointing to the right answer.
- **Randomise the correct answer position.** Don't always put it at index 0. Spread across 0–3 across your batch.
- Wrong options should be plausible — real-looking commands or shortcuts that someone might confuse with the right one. Avoid joke answers.
- The `teach` field fires on both correct and incorrect answers, so write it to work in both cases. Don't say "You got it right!" — the UI handles that.
- Points: 3 for "you'd know this after reading the basics once", 4 for "requires remembering a specific flag or key", 5 for "easy to confuse with something similar".

### Example

```js
{
  q: "How do you make all tmux panes equal size?",
  options: [
    "Ctrl+B then : then select-layout even-horizontal",
    "Ctrl+B then =",
    "Ctrl+B then E",
    "Ctrl+B then Ctrl+="
  ],
  correct: 0,
  pts: 5,
  teach: "Use command mode (Ctrl+B :) and type 'select-layout even-horizontal' or 'even-vertical'. Or press Ctrl+B Space to cycle layouts until you hit an even one."
}
```

## Adding Medium Questions (Type-the-Answer)

Medium questions test recall. The user types the command or key combo from memory. Worth 10 points. Partial credit is automatic for close matches.

### Structure

```js
{
  q: "Prompt — tell the user exactly what to type (command or key combo)",
  answer: ["primary accepted answer", "alt spelling", "another variant"],
  hint: "Partial reveal with underscores, e.g. tmux n__ -_ d__",
  pts: 10,
  teach: "Explanation shown after. Reinforce the pattern."
}
```

### Rules

- `answer` is an array of accepted strings. The game normalises to lowercase and collapses whitespace before comparing. Include common variations:
  - For CLI commands: `["tmux a -t build", "tmux attach -t build"]`
  - For key combos: `["ctrl+b d", "ctrl+b then d", "ctrl-b d", "Ctrl+B D", "Ctrl+B then D"]`
- The matching also does substring inclusion for partial credit, so if the user types `tmux a -t` when the answer is `tmux a -t build`, they get half points automatically.
- `hint` uses underscores to blank out parts. Preserve the structure so the user can see the shape of the command. The hint button has no point penalty.
- Always 10 points. Don't vary this — the sliders assume uniform medium question weighting.

### Example

```js
{
  q: "Type the tmux COMMAND to resize the current pane LEFT by 10 cells (after Ctrl+B :)",
  answer: ["resize-pane -L 10"],
  hint: "r_____-p___ -_ 10",
  pts: 10,
  teach: "resize-pane -L 10. Flags: -L(left), -R(right), -U(up), -D(down)."
}
```

## Adding Boss Scenarios (Sequence Ordering)

Boss scenarios present a real-world task as a series of steps. The user drags them into the correct order. Worth 30 points, with partial credit for steps in the right position.

### Structure

```js
{
  id: "unique-kebab-id",
  title: "🔌 Short Evocative Title",
  topics: ["Session Management", "Panes"],   // which top-level topics this relates to
  narrative: "1-2 sentence setup. What's the situation? What does the user need to do?",
  steps: [
    { id: "step1", text: "tmux new -s dev",    order: 1 },
    { id: "step2", text: "Ctrl+B then %",      order: 2 },
    { id: "step3", text: "tail -f app.log",    order: 3 },
    { id: "step4", text: "Ctrl+B then ←",      order: 4 },
  ],
  pts: 30,
  teach: "Explain the full flow and why this order matters. 1-2 sentences."
}
```

### Rules

- `id` must be unique across all boss scenarios. Use kebab-case.
- `topics` controls which topic selections make this scenario available. Use exact top-level topic names from `QUESTION_BANK` (e.g., `"Session Management"`, `"Windows"`, `"Panes"`). A scenario appears if ANY of its topics are selected.
- `steps[].order` is the correct sequence (1-based). The game shuffles them for display.
- `steps[].id` must be unique within the scenario.
- `steps[].text` should be the actual command or key combo the user would type/press. Keep each step to one action.
- Aim for 3–6 steps per scenario. Fewer than 3 is too easy to guess; more than 6 is frustrating to reorder.
- Always 30 points. Don't vary this.
- The `title` should include an emoji and be evocative enough to hint at the scenario theme.

### Example

```js
{
  id: "resize-layout",
  title: "◫ The Perfect Layout",
  topics: ["Session Management", "Panes"],
  narrative: "You need a wide code pane on the left and a narrow log pane on the right. Set it up and resize:",
  steps: [
    { id: "new",    text: "tmux new -s layout",              order: 1 },
    { id: "split",  text: "Ctrl+B then %",                   order: 2 },
    { id: "resize", text: "Ctrl+B then :resize-pane -R 20",  order: 3 },
    { id: "move",   text: "Ctrl+B then ←",                   order: 4 },
  ],
  pts: 30,
  teach: "After splitting, use resize-pane to adjust. -R 20 pushes the divider right, making the left pane wider."
}
```

## Adding a New Topic

Add a new top-level key to `QUESTION_BANK`:

```js
"Your Topic Name": {
  icon: "🔧",       // single emoji, shown in the tree
  subtopics: {
    "Subtopic One": {
      easy: [ /* easy question objects */ ],
      medium: [ /* medium question objects */ ],
    },
    "Subtopic Two": {
      easy: [],
      medium: [],
    },
  },
},
```

The config screen tree will automatically show the new topic with its subtopics as expandable children. The question counts and slider maximums update automatically.

## Adding a New Subtopic

Add a new key inside an existing topic's `subtopics` object:

```js
"Session Management": {
  icon: "🔌",
  subtopics: {
    // ... existing subtopics ...
    "Your New Subtopic": {
      easy: [ /* questions */ ],
      medium: [ /* questions */ ],
    },
  },
},
```

Both `easy` and `medium` arrays must exist, even if empty (`[]`).

## Content Quality Checklist

Before committing new content, verify each item:

- [ ] **Accuracy**: Every command, flag, and key combo is correct per `agents.md`
- [ ] **No duplicates**: The question isn't already covered by an existing question (similar phrasing is fine if it tests a different aspect)
- [ ] **Teach-back quality**: The `teach` field explains the WHY, not just restates the answer. Include a mnemonic or memory aid where possible
- [ ] **Distractor quality**: Wrong options in easy questions are plausible, not absurd
- [ ] **Answer variants**: Medium questions include at least 3 accepted answer spellings
- [ ] **Hint formatting**: Medium hints preserve command structure with underscores, showing enough to jog memory without giving it away
- [ ] **Point values**: Easy = 3–5, Medium = 10, Boss = 30
- [ ] **Boss topic mapping**: Boss scenarios list all relevant top-level topics in their `topics` array
- [ ] **Step count**: Boss scenarios have 3–6 steps

## Content Ideas for Expansion

Areas not yet covered or lightly covered that would make good additions:

- **tmux.conf customisation**: Remapping prefix key, enabling mouse, setting default shell
- **Named panes**: Using `select-pane -T "name"` for labelling
- **Session groups**: `tmux new -t existing-session` to share windows between sessions
- **Send keys / scripting**: `tmux send-keys` for automation
- **Clipboard integration**: Getting tmux copy buffer into system clipboard (xclip, pbcopy)
- **Screen .screenrc**: Config file basics
- **Nested sessions**: SSH into a server that's already running tmux (prefix key conflicts)
- **tmux plugins**: tpm (tmux plugin manager), tmux-resurrect, tmux-continuum
