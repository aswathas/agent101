# Harnessing Claude Code — Catalog

> From zero to graph engineering. 19 phases, 119 lessons, 19 practice modules.
> Every lesson is one directory. The path is the URL.

**Lesson layout:** `phases/NN-phase-slug/NN-lesson-slug/docs/en.md`, plus `code/`
(runnable) and `quiz.json` (machine-readable).
**Practice module:** `practice/NN-module-slug/{BRIEF.md,RUBRIC.md}`

**This file is parsed by `scripts/scaffold-catalog.mjs`.** Three shapes are
machine-read: `## Phase NN — Name`, the lesson tables (`| N | Title | \`path\` |`),
and the module lines (`**Module NN.N** — Title (\`Type\`)` followed by
`→ \`practice/NN-slug\``). Don't restyle those without updating the parser.
`node scripts/scaffold-catalog.mjs --dry-run` reports what it would create.

Bold lesson = the load-bearing one in that phase; the others ground it.

---

## Phase 00 — Setup & Tooling
Your tools shape your thinking. Set them up once.
Prereq: none. Lessons 1–5.

| # | Lesson | Path |
|---|---|---|
| 1 | Dev Environment | `00-setup-and-tooling/01-dev-environment` |
| 2 | **Git & Collaboration** — your safety net, not optional | `00-setup-and-tooling/02-git-and-collaboration` |
| 3 | Terminal & Shell | `00-setup-and-tooling/03-terminal-and-shell` |
| 4 | Editor Setup | `00-setup-and-tooling/04-editor-setup` |
| 5 | Debugging & Profiling | `00-setup-and-tooling/05-debugging-and-profiling` |

**Module 00.1** — Break this repo on purpose. Recover it. Recover it faster. (`Break`)
→ `practice/00-break-the-repo-recover-it`

---

## Phase 01 — Foundations of AI
The words everything else leans on.
Prereq: Phase 00. Lessons 6–11.

| # | Lesson | Path |
|---|---|---|
| 6 | What a Language Model Is | `01-foundations-of-ai/06-what-a-language-model-is` |
| 7 | Tokens — why text becomes currency | `01-foundations-of-ai/07-tokens-why-text-becomes-currency` |
| 8 | The Context Window — the only budget that matters | `01-foundations-of-ai/08-the-context-window` |
| 9 | Prompt, Inference, API | `01-foundations-of-ai/09-prompt-inference-api` |
| 10 | What "Agentic" Means | `01-foundations-of-ai/10-what-agentic-means` |
| 11 | Latency, Cost, and Rate Limits | `01-foundations-of-ai/11-latency-cost-and-rate-limits` |

**Module 01.1** — Explain any codebase to yourself, out loud. Find the jargon leaks. (`Instrument`)
→ `practice/01-explain-a-codebase`

---

## Phase 02 — Git Deep
Commit = photograph. Branch = label. `worktree` hides `working tree`.
Prereq: Phase 00, lesson 2 especially. Lessons 12–18.

| # | Lesson | Path |
|---|---|---|
| 12 | Commit Is a Photograph, Not a Diff | `02-git-deep/12-commit-is-a-photograph-not-a-diff` |
| 13 | Branches Are Movable Labels, Not Copies | `02-git-deep/13-branches-are-movable-labels-not-copies` |
| 14 | Merge and Rebase | `02-git-deep/14-merge-and-rebase` |
| 15 | Conflicts: What They Are, How They Resolve | `02-git-deep/15-conflicts-what-they-are-how-they-resolve` |
| 16 | Recovering Lost Work | `02-git-deep/16-recovering-lost-work` |
| 17 | Stashing, and Why Agents Break Things | `02-git-deep/17-stashing-and-why-agents-break-things` |
| 18 | Remotes, Forks, and the Full Mental Model | `02-git-deep/18-remotes-forks-and-the-full-mental-model` |

**Module 02.1** — Break it. Recover it. Recover it again, faster. (`Break`)
→ `practice/02-break-it-recover-it`

---

## Phase 03 — Models & Families
Open-weight vs frontier. What actually costs money.
Prereq: Phase 01. Lessons 19–26.

| # | Lesson | Path |
|---|---|---|
| 19 | Open-Weight vs Frontier | `03-models-and-families/19-open-weight-vs-frontier` |
| 20 | Model Aliases and Routing — teach `sonnet`, never hardcoded IDs | `03-models-and-families/20-model-aliases-and-routing` |
| 21 | Effort Levels and Extended Thinking | `03-models-and-families/21-effort-levels-and-extended-thinking` |
| 22 | Prompt Caching — why switching models makes a turn slow | `03-models-and-families/22-prompt-caching` |
| 23 | Quantization, Distillation, Fine-Tuning | `03-models-and-families/23-quantization-distillation-fine-tuning` |
| 24 | **SLMs — When a 350M Model Wins** | `03-models-and-families/24-slms-when-a-small-model-wins` |
| 25 | **Decision Models Beat Generation on Cost** | `03-models-and-families/25-decision-models` |
| 26 | **The Taxonomy: LLM / Decision Model / SLM** | `03-models-and-families/26-the-taxonomy` |

**Module 03.1** — Route a real workload across model tiers. Find where the frontier model was wasted. (`Instrument`)
→ `practice/03-route-a-workload`

Decision-models material names the pattern, not products. Jev, Jeff, LFM, and similar
families are referenced as *examples of the pattern* in lesson prose, not as lesson titles.
If a specific product name is verified later, the lesson is renamed in place; until then,
the pattern is the lesson.

---

## Phase 04 — Claude Code
The tool, from first run to fluency.
Prereq: Phases 01, 03. Lessons 27–37. **The gateway phase.**

| # | Lesson | Path |
|---|---|---|
| 27 | What Claude Code Is | `04-claude-code/27-what-claude-code-is` |
| 28 | Install, First Run, Verify | `04-claude-code/28-install-first-run-verify` |
| 29 | Files and Edits — and When It Refuses | `04-claude-code/29-files-and-edits-and-when-it-refuses` |
| 30 | Sessions, `/clear`, `/compact` | `04-claude-code/30-sessions-clear-compact` |
| 31 | **The Agentic Loop** — the one concept everything hangs on | `04-claude-code/31-the-agentic-loop` |
| 32 | What Loads Into the Window, and What Doesn't | `04-claude-code/32-what-loads-into-the-window` |
| 33 | Permissions and Permission Modes | `04-claude-code/33-permissions-and-permission-modes` |
| 34 | Settings — 4 Files, 5 Precedence Levels | `04-claude-code/34-settings-and-precedence` |
| 35 | Plan Mode and Checkpoints | `04-claude-code/35-plan-mode-and-checkpoints` |
| 36 | Checkpointing, `/rewind`, Recovery | `04-claude-code/36-checkpointing-rewind-recovery` |
| 37 | Troubleshooting — Reading Errors Properly | `04-claude-code/37-troubleshooting-reading-errors-properly` |

**Module 04.1** — Configure a real project. Know which settings file won. (`Build`)
→ `practice/04-configure-a-project`

---

## Phase 05 — Commands & Skills
The most flexible extension layer.
Prereq: Phase 04. Lessons 38–44.

| # | Lesson | Path |
|---|---|---|
| 38 | Built-in Commands *(renamed from "slash commands")* | `05-commands-and-skills/38-built-in-commands` |
| 39 | Why Custom Commands **Merged Into Skills** | `05-commands-and-skills/39-commands-merged-into-skills` |
| 40 | What a Skill Is | `05-commands-and-skills/40-what-a-skill-is` |
| 41 | **Anatomy — the 21-Field Frontmatter Table** | `05-commands-and-skills/41-skill-frontmatter-anatomy` |
| 42 | **The Invocation Matrix — Who Can Trigger It** | `05-commands-and-skills/42-the-invocation-matrix` |
| 43 | **Install a Skill** | `05-commands-and-skills/43-install-a-skill` |
| 44 | **Author a Skill From Scratch** | `05-commands-and-skills/44-author-a-skill` |

**Module 05.1** — Author a skill. Use it. Break it. Fix the frontmatter. (`Break`)
→ `practice/05-author-a-skill`

---

## Phase 06 — Subagents
Context isolation.
Prereq: Phases 04, 05. Lessons 45–48.

| # | Lesson | Path |
|---|---|---|
| 45 | Subagent Markdown Format | `06-subagents/45-subagent-format` |
| 46 | Built-ins — `Explore`, `Plan`, `general-purpose` | `06-subagents/46-built-in-subagents` |
| 47 | **Author a Subagent** + the fork-context subtlety | `06-subagents/47-author-a-subagent` |
| 48 | Skills Inside Subagents — the genuinely confusing case | `06-subagents/48-skills-inside-subagents` |

**Module 06.1** — Write a subagent that does one job perfectly and refuses everything else. (`Build`)
→ `practice/06-one-job-one-subagent`

---

## Phase 07 — MCP
A protocol, not a tool.
Prereq: Phase 04. Lessons 49–54.

| # | Lesson | Path |
|---|---|---|
| 49 | What MCP Is | `07-mcp/49-what-mcp-is` |
| 50 | **Four Transports** — http / sse *(deprecated)* / stdio / ws | `07-mcp/50-four-transports` |
| 51 | Scopes, Precedence, Config Shape | `07-mcp/51-scopes-and-config` |
| 52 | **Build an MCP Server From Scratch** | `07-mcp/52-build-an-mcp-server` |
| 53 | The Trust Model and Prompt Injection | `07-mcp/53-trust-model-and-prompt-injection` |
| 54 | OAuth, Headers, and MCP Tool Search | `07-mcp/54-oauth-and-tool-search` |

**Module 07.1** — Build an MCP server. Then ask: would you trust a repo you cloned? (`Decide`)
→ `practice/07-build-an-mcp-server`

---

## Phase 08 — Hooks
Events on the loop. Enforcement, not requests.
Prereq: Phase 04, lesson 31 especially. Lessons 55–60.

| # | Lesson | Path |
|---|---|---|
| 55 | What a Hook Is | `08-hooks/55-what-a-hook-is` |
| 56 | **All 32 Events**, Matchers, Handler Types | `08-hooks/56-all-32-events` |
| 57 | Script Shape — stdin JSON → stdout / exit code | `08-hooks/57-hook-script-shape` |
| 58 | **The Exit-1-vs-2 Trap** | `08-hooks/58-exit-1-vs-2` |
| 59 | **Build a Guardrail Hook** | `08-hooks/59-build-a-guardrail-hook` |
| 60 | Debugging Hooks | `08-hooks/60-debugging-hooks` |

**Module 08.1** — Write a hook that makes an unsafe action *impossible*. (`Build`)
→ `practice/08-make-it-impossible`

---

## Phase 09 — Plugins
The packaging layer. Comes last for a reason.
Prereq: Phases 05, 06, 08. Lessons 61–64.

| # | Lesson | Path |
|---|---|---|
| 61 | *"Plugins Are the Packaging Layer"* — and why | `09-plugins/61-plugins-are-the-packaging-layer` |
| 62 | Anatomy and the Manifest | `09-plugins/62-plugin-anatomy` |
| 63 | Install from Marketplace, and Author One | `09-plugins/63-install-and-author-a-plugin` |
| 64 | Plugin Economics — What Every Enabled Plugin Costs | `09-plugins/64-plugin-economics` |

**Module 09.1** — Package your skill + subagent + hook as one installable plugin. (`Build`)
→ `practice/09-package-a-plugin`

---

## Phase 10 — Memory & Instructions
How context persists.
Prereq: Phase 04, lesson 32. Lessons 65–70.

| # | Lesson | Path |
|---|---|---|
| 65 | CLAUDE.md — the 200-Line Rule | `10-memory-and-instructions/65-claude-md` |
| 66 | AGENTS.md, CLAUDE.local.md | `10-memory-and-instructions/66-agents-md-and-local-md` |
| 67 | Rules and Path-Scoped Rules | `10-memory-and-instructions/67-rules` |
| 68 | Auto Memory and `MEMORY.md` | `10-memory-and-instructions/68-auto-memory` |
| 69 | Output Styles | `10-memory-and-instructions/69-output-styles` |
| 70 | Imports and External Context | `10-memory-and-instructions/70-imports-and-external-context` |

**Module 10.1** — Write a CLAUDE.md that changes behavior. Prove it. (`Build`)
→ `practice/10-write-a-claude-md`

---

## Phase 11 — Parallelism I
The five names, and why they're different.
Prereq: Phases 02, 04, 06. Lessons 71–76.

| # | Lesson | Path |
|---|---|---|
| 71 | The Five Names | `11-parallelism-i/71-the-five-names` |
| 72 | Subagents as Isolation | `11-parallelism-i/72-subagents-as-isolation` |
| 73 | Agent Teams — Mailbox, Task List, Documented Limits | `11-parallelism-i/73-agent-teams` |
| 74 | **Worktrees, Deep** — session vs per-agent | `11-parallelism-i/74-worktrees-deep` |
| 75 | Base Ref, Cleanup, and the `/batch` Path | `11-parallelism-i/75-base-ref-cleanup-and-batch` |
| 76 | **How Isolation Is Actually Enforced** — the blocking checks | `11-parallelism-i/76-how-isolation-is-enforced` |

**Module 11.1** — Build a parallel system. Prove isolation held. (`Build`)
→ `practice/11-prove-isolation-held`

---

## Phase 12 — Parallelism II
Orchestration.
Prereq: Phase 11. Lessons 77–85.

| # | Lesson | Path |
|---|---|---|
| 77 | Cross-Session Messaging | `12-parallelism-ii/77-cross-session-messaging` |
| 78 | Dynamic Workflows — the Script Decides | `12-parallelism-ii/78-dynamic-workflows` |
| 79 | `parallel()` vs `pipeline()` | `12-parallelism-ii/79-parallel-vs-pipeline` |
| 80 | **The Completion-Order Gotcha** | `12-parallelism-ii/80-the-completion-order-gotcha` |
| 81 | Workflow Runtime Caps | `12-parallelism-ii/81-workflow-runtime-caps` |
| 82 | Loops — Scheduled and Recurring | `12-parallelism-ii/82-loops` |
| 83 | Hooks-Driven Automation — Events as Control Flow | `12-parallelism-ii/83-hooks-driven-automation` |
| 84 | **The Decision Framework** — Which Mechanism, When | `12-parallelism-ii/84-the-decision-framework` |
| 85 | **When NOT to Parallelize** | `12-parallelism-ii/85-when-not-to-parallelize` |

**Module 12.1** — Write a workflow with propose → verify. Hit the completion-order trap *on purpose*. (`Break`)
→ `practice/12-hit-the-completion-order-trap`

---

## Phase 13 — Context Engineering
Context as architecture.
Prereq: Phases 05, 10. Lessons 86–90.

| # | Lesson | Path |
|---|---|---|
| 86 | What Loads, What Costs | `13-context-engineering/86-what-loads-what-costs` |
| 87 | Progressive Disclosure — Skills as a Loading Strategy | `13-context-engineering/87-progressive-disclosure` |
| 88 | **Context as Architecture, Not a Dump** | `13-context-engineering/88-context-as-architecture` |
| 89 | Prompt Caching as a Design Constraint | `13-context-engineering/89-prompt-caching-as-constraint` |
| 90 | Reducing Context Without Losing Capability | `13-context-engineering/90-reducing-context` |

**Module 13.1** — Cut a bloated context by half. Prove capability survived. (`Instrument`)
→ `practice/13-cut-context-in-half`

---

## Phase 14 — Harness Engineering
The loop minus the intelligence.
Prereq: Phases 04, 13. Lessons 91–97. **A destination phase.**

| # | Lesson | Path |
|---|---|---|
| 91 | What a Harness Is | `14-harness-engineering/91-what-a-harness-is` |
| 92 | **Most Agent Calls Are Decisions, Not Generation** | `14-harness-engineering/92-decisions-not-generation` |
| 93 | **Decision Models Inside a Loop** | `14-harness-engineering/93-decision-models-in-a-loop` |
| 94 | **Confidence Gating** — Escalate Only When Unsure | `14-harness-engineering/94-confidence-gating` |
| 95 | **Verification Loops** — the prerequisite for unattended runs | `14-harness-engineering/95-verification-loops` |
| 96 | **Guardrails vs Instructions** — requests vs enforcement | `14-harness-engineering/96-guardrails-vs-instructions` |
| 97 | **Design Your Own Harness** — and defend the trade-offs | `14-harness-engineering/97-design-your-own-harness` |

**Module 14.1** — Instrument a real loop. Find the 20% of calls costing 80%. (`Instrument`)
→ `practice/14-find-the-expensive-20-percent`

---

## Phase 15 — Graph Engineering
Nodes, edges, and what genuinely parallelizable means.
Prereq: Phases 11, 12, 14. Lessons 98–105. **A destination phase.**

| # | Lesson | Path |
|---|---|---|
| 98 | Nodes and Edges | `15-graph-engineering/98-nodes-and-edges` |
| 99 | **Task Graphs** — Dependencies and the Frontier | `15-graph-engineering/99-task-graphs` |
| 100 | **Blocking Edges** — What's Actually Parallelizable | `15-graph-engineering/100-blocking-edges` |
| 101 | **Claiming** — Stopping Two Agents Doing One Job | `15-graph-engineering/101-claiming` |
| 102 | Wayfinding — Producing Decisions, Not Deliverables | `15-graph-engineering/102-wayfinding` |
| 103 | Fan-Out / Fan-In Patterns | `15-graph-engineering/103-fan-out-fan-in` |
| 104 | Failure Propagation — What Happens When One Node Dies | `15-graph-engineering/104-failure-propagation` |
| 105 | **Design a Graph** for a Real Project | `15-graph-engineering/105-design-a-graph` |

**Module 15.1** — Decompose a real project. Find the critical path. (`Decide`)
→ `practice/15-design-a-task-graph`

---

## Phase 16 — Worktrees in Practice
Deep on the one you came for.
Prereq: Phases 02, 11. Lessons 106–110.

| # | Lesson | Path |
|---|---|---|
| 106 | Session vs Agent Scope | `16-worktrees-in-practice/106-session-vs-agent-scope` |
| 107 | Manual Worktrees — `git worktree add` | `16-worktrees-in-practice/107-manual-worktrees` |
| 108 | The Startup-Cache Trap (cost us a session) | `16-worktrees-in-practice/108-the-startup-cache-trap` |
| 109 | Merge Strategy for Agent Branches | `16-worktrees-in-practice/109-merge-strategy` |
| 110 | **Isolation Without a Commit Is Not a Backup** | `16-worktrees-in-practice/110-isolation-without-a-commit` |

**Module 16.1** — Reproduce the empty-branch bug. Then prevent it. (`Break`)
→ `practice/16-reproduce-the-empty-branch-bug`

---

## Phase 17 — Scaling & Operations
Running it for real.
Prereq: Phases 04, 09, 10. Lessons 111–115.

| # | Lesson | Path |
|---|---|---|
| 111 | Headless / Non-Interactive Mode | `17-scaling-and-operations/111-headless-mode` |
| 112 | The Claude Agent SDK | `17-scaling-and-operations/112-the-agent-sdk` |
| 113 | Channels and Surfaces | `17-scaling-and-operations/113-channels-and-surfaces` |
| 114 | Sandboxing and Security Model | `17-scaling-and-operations/114-sandboxing-and-security` |
| 115 | Managing Settings at Scale | `17-scaling-and-operations/115-managing-settings-at-scale` |

**Module 17.1** — Automate a real task headlessly, end to end. (`Build`)
→ `practice/17-automate-headlessly`

---

## Phase 18 — Capstone
Ship it.
Prereq: everything. Lessons 116–119.

| # | Lesson | Path |
|---|---|---|
| 116 | Spec → Graph → Build → Verify | `18-capstone/116-spec-graph-build-verify` |
| 117 | Review Against the Docs | `18-capstone/117-review-against-the-docs` |
| 118 | What Breaks in Production | `18-capstone/118-what-breaks-in-production` |
| 119 | Keeping Up — Claude Code Ships Weekly | `18-capstone/119-keeping-up` |

**Module 18.1** — End-to-end with everything. (`Build`)
→ `practice/18-ship-it`

---

## Totals

| | Count |
|---|---|
| Phases | 19 |
| Lessons | 119 |
| Practice modules | 19 |

Per-phase lesson counts: 5, 6, 7, 8, 11, 7, 4, 6, 6, 4, 6, 6, 9, 5, 7, 8, 5, 5, 4 = 119.

## Grounding spine

Ground in this order. A lesson may only use a concept an earlier lesson established.

```
tokens           L7   text becomes countable currency
  ↓
context window   L8   the only budget that matters
  ↓
agentic loop     L31  model decides → tool executes → result returns → repeat
  ↓
tools            L52  the loop's only way to touch reality
  ↓
compaction       L30  the window fills; something must give
  ↓
isolation        L72  separate windows = the reason parallelism works
  ↓
harness          L91  the loop minus the intelligence
  ↓
graph            L98  dependencies = what's genuinely parallelizable
```

`scripts/validate-lessons.mjs` enforces the mechanical half of this: required
sections, the `# ` title line, the `>` hook, exactly one reframe, exercise pass
criteria, quiz shape, and a per-phase forbidden-term list.

The `GROUNDING` table is still the open half — it currently only covers Phase 00
lesson 1. Extend it as phases are written. It is deliberately conservative:
a term listed there is one a lesson provably may not use yet, and a wrong entry
blocks good content rather than bad.

## Writing a lesson

Each phase block is one agent's unit of work. Before writing:

- Read `MISSION.md`, `NOTES.md`, and `learning-records/`.
- Read `LESSON-TEMPLATE.md` — sections are mandatory, one reframe, and every
  exercise gets an observable pass criterion.
- Check the forbidden-term list for your phase. Cut or ground the reference.
- Verify version-gated claims against `https://code.claude.com/docs/llms.txt`.
  Say "unconfirmed" instead of guessing.
- Commit. **Isolated work with no commit is not a backup.**

Run `node scripts/validate-lessons.mjs` when the phase is complete.

## Coverage note

Phases 04–17 cover material **aiengineeringfromscratch.com does not have** (542
lessons, none of it Claude Code as a harness). Phases 00–03 overlap in spirit only.

**Resolved:** lessons 25–26 are titled for the pattern, not a product. The
product names appear once, in lesson 25's prose, explicitly flagged as
unverified as of October 2026. Nothing is titled on a guess.