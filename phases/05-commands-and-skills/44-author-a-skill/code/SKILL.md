---
name: review
description: Review changed code for correctness, security, and consistency with the project's conventions. Use when the user says review, check my changes, or asks for feedback on a diff, branch, or set of edited files.
argument-hint: "[path-or-branch]"
arguments: target
disable-model-invocation: false
---

**Always report what you checked and what you did not.** A review that silently
skips a file reads as an all-clear.

Target: $target

Run after every file you examine: the project's test suite, or the narrowest
command that covers the change.

## Order

1. Read the diff. Establish what changed before judging anything.
2. For each changed file, ask in this order:
   - **Correctness.** Does it do what it claims, on the edge cases it will meet?
   - **Security.** Untrusted input, missing validation, secrets in source.
   - **Consistency.** Does it match neighbouring code, or invent a third pattern?
3. Read `references/security-checklist.md` when the change touches input
   handling, auth, or anything a user can reach.

## Output

For each finding: the file and line, what is wrong, and the concrete failure it
causes. Rank by severity. If nothing is wrong, say so plainly — do not invent a
nit to look thorough.