---
name: run-workflow
description: Report what is left to author in this curriculum, author it in isolated git worktrees, validate it, and rebuild the site. Use when the user asks to finish the course, author the remaining lessons, check what is unwritten, run the workflow, or rebuild the site.
disable-model-invocation: true
---

# Run Workflow

The course is 119 lessons. Authoring them by hand one at a time is how 89
lessons sat as scaffolds looking finished — the validator passes a skeleton,
because structure is not authorship. This skill runs the pipeline instead.

## The one rule

**Never declare a lesson written because it validates.** The validator checks
shape — required sections, one reframe, exercise criteria, quiz fields. A
skeleton satisfies all of it. `scripts/workflow-status.mjs` checks for the
scaffold markers the validator only warns about, and is the thing to trust.

## Read what is left

```bash
node scripts/workflow-status.mjs           # the table, exit 1 while gaps remain
node scripts/workflow-status.mjs --json    # machine-readable
```

Three kinds of gap, because they cost different amounts of work: a lesson body,
a quiz, a practice module. A phase with a finished body and a placeholder
`quiz.json` is not done, and the old `git grep` for one marker thought it was.

## Author it

```bash
node scripts/dynamic-workflow.mjs                 # status → author → validate → site
node scripts/dynamic-workflow.mjs --status-only   # just report
node scripts/dynamic-workflow.mjs --phases 08-hooks,10-memory-and-instructions
```

Or drive the steps yourself:

```bash
node scripts/author-phases.mjs --concurrency 3 --worker opencode
node scripts/author-phases.mjs --phases 18-capstone --concurrency 1 --worker claude
node scripts/author-phases.mjs --dry-run          # show the plan, author nothing
node scripts/write-phase.mjs 08-hooks --dry-run   # the exact prompt for one phase
```

## How it works, and why

- **One worker per phase, one worktree per worker.** A phase is one boundary in
  the concept spine (`COURSE-CONTEXT.md`), so its lessons ground each other.
  Two phases in one worker lets the later lean on a concept the earlier hasn't
  written yet.
- **The prompt names the missing files.** A worker told to "rewrite the phase"
  re-does finished work. A worker told "write these eleven quiz.json files"
  finishes in one pass.
- **A commit is mandatory.** A worker that exits 0 with no `feat()` commit is a
  failure. This is not hypothetical: a previous run left phase 08 and phase 09
  fully written and completely uncommitted, in worktrees nobody merged.
- **Merges happen as each wave lands, in catalog order.** Branches drift and
  merges worsen; the longer work sits on a branch, the worse the merge.
- **Workers are external CLIs.** `--worker claude` uses headless `claude -p`;
  `--worker opencode` uses `opencode run`. When one is rate-limited the other
  still works. `opencode` must be given piped stdio — with inherited stdio it
  exits silently and the failure looks like a worker that ran and did nothing.

## Rebuild the site

```bash
node scripts/build-site.mjs          # lesson pages + index surfaces
node scripts/build-site.mjs --check  # exit 1 if the site is stale
```

`site/index.html`, `catalog.html`, `glossary.html`, `sitemap.xml` and
`llms.txt` are generated from the corpus, not hand-maintained. They used to be
hand-written and they rotted immediately — a catalog listing four of nineteen
phases, and links to three pages that did not exist.

Serve it locally to check the result (no dependencies, no `package.json`):

```bash
node scripts/serve-site.mjs --port 4180   # http://127.0.0.1:4180/
```

Opening `site/index.html` from disk does not work: lesson pages use relative
links, and the API on `/developer.html` needs a server. `serve-site.mjs`
implements that API, so what the site documents is what the site does.

## The completion gate

```bash
node scripts/verify-all.mjs     # exit 0 only when the project is finished
```

One command, four checks: no scaffolds remain, every phase passes the
validator, the committed site matches the corpus, and the corpus is internally
consistent (every lesson has a title and a well-formed `quiz.json`, every
practice module has a brief and a rubric). `dynamic-workflow.mjs` runs it as
its last step, so "the workflow exited 0" and "the course is finished" are the
same statement.

## Before you present results

Check:

- [ ] `node scripts/validate-lessons.mjs` exits 0
- [ ] `node scripts/workflow-status.mjs` exits 0 (no scaffolds left)
- [ ] `node scripts/build-site.mjs --check` exits 0 (site matches the corpus)
- [ ] `node scripts/check-contrast.mjs` exits 0 (palette readable in both themes)
- [ ] Every worker committed; nothing is sitting uncommitted in a worktree
- [ ] `git worktree list` shows no leftovers
