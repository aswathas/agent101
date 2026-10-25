# Harnessing Claude Code

**From zero to graph engineering on AI agents — for people who use them.**

A free, open-source course. 119 lessons across 19 phases on using AI agents well:
subagents, agent teams, MCP servers, hooks, plugins, worktree isolation, dynamic
workflows, harness engineering, and task graphs.

Not an ML course. It assumes you're *using* models, not training them. For
building AI from linear algebra up, see
[AI Engineering from Scratch](https://aiengineeringfromscratch.com) — 542 lessons,
complementary, no overlap.

---

## Why this course exists

Most agentic tooling is taught in two broken ways: as a list of features, or as
prompts to copy. Neither teaches the *mechanism*. This course teaches the
mechanism — what the agent is doing, why it fails, and how to make it not fail.

The premise: every abstraction in Claude Code resolves to something you can
reason about, break, and rebuild.

---

## Start here

| You want to… | Read |
|---|---|
| See the whole map | [`CATALOG.md`](CATALOG.md) |
| Give an agent the full context | [`COURSE-CONTEXT.md`](COURSE-CONTEXT.md) |
| Start learning now | [the site](https://github.com/666ghj) — or just open a folder |
| Know how a lesson is written | [`LESSON-TEMPLATE.md`](LESSON-TEMPLATE.md) |
| Understand the repo | [`AGENTS.md`](AGENTS.md) |

**Reading in a repo, not the site?** Every lesson lives at
`phases/NN-phase-slug/NN-lesson-slug/docs/en.md`. Open it and read.

---

## Teaching it to yourself, with an agent

This repo is designed to be pointed at an AI agent. Five skills, each invoked
deliberately by the learner:

| Command | Does |
|---|---|
| `/teach-me` | Teach one lesson, at the learner's actual level |
| `/run-module` | Start or grade a practice module |
| `/where-am-i` | What's demonstrated, what's next |
| `/write-lesson` | Author a new lesson |
| `/run-workflow` | Author the rest of the corpus, validate it, rebuild the site |

Any agent works — Cursor, Codex, plain Claude Code. The skills are thin wrappers
over conventions that live in files. Read [`AGENTS.md`](AGENTS.md) and you have
everything.

---

## Run it locally

The site is static and has no dependencies — no `package.json`, no install:

```bash
node scripts/serve-site.mjs          # http://127.0.0.1:4180/
node scripts/serve-site.mjs --port 8080
```

Opening `site/index.html` from disk will not work properly: the lesson pages use
relative links, and the API described on `/developer.html` needs a server. This
one implements it, so what the site documents is what the site does:

| Endpoint | Returns |
|---|---|
| `/api/v1/catalog?q=worktree&limit=10` | search the curriculum as JSON |
| `/api/v1/resource?path=phases/NN/NN-slug` | a lesson's markdown source |
| `/api/v1/markdown?path=/catalog` | any page's markdown twin |
| `/.well-known/mcp.json` | the MCP manifest |
| `Accept: text/markdown` on a lesson | its markdown source |

Rebuild the site after editing a lesson — `catalog.html`, `glossary.html`,
`sitemap.xml` and `llms.txt` are generated, not hand-written:

```bash
node scripts/build-site.mjs          # rebuild
node scripts/build-site.mjs --check  # fail if the committed site is stale
```

---

## How a lesson works

Every lesson follows one shape:

**Problem** (the consequence, before the definition) → **Concept** (one reframe, a
diagram) → **Build It** (numbered steps you run) → **Use It** (the reference table)
→ **Exercises** (each with a pass criterion) → **Key Terms** (what people say vs
what it actually means).

The grounding rule governs everything: **a concept is established before any later
lesson leans on it.** That's why Phase 01 exists. It's the single most common
failure in courses like this, and it's why "explain in simple words" is usually a
symptom of ordering, not vocabulary.

---

## Practice

19 modules, four types — **Instrument** (you can measure), **Build** (you can make
it), **Break** (you know it by its failure mode), **Decide** (you can choose under
trade-offs).

A module isn't done when code runs. It's done when the rubric's criteria are met
and you can explain the mechanism with the code closed.

See [`PRACTICE.md`](PRACTICE.md).

---

## Status

In progress. The scaffold, catalog, template, skills, and practice structure are
in place. Lessons are being written phase by phase.

Progress is tracked in [`CATALOG.md`](CATALOG.md).

---

## Contributing

Lessons are authored with a split: an agent drafts structure, objectives,
exercises, and pass criteria; a human writes the Problem and the reframe — the two
parts that carry the teaching.

If you want to contribute a lesson, read
[`LESSON-TEMPLATE.md`](LESSON-TEMPLATE.md) and [`AGENTS.md`](AGENTS.md) first.

---

## License

MIT. See [`LICENSE`](LICENSE).