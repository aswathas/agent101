#!/usr/bin/env node
// PreToolUse hook for Bash. Reads the tool call JSON on stdin.
// Exits 0 to allow, 2 to block and show stderr to the model.
// No arguments: the patterns live in DENY below.

import { createInterface } from 'node:readline';

const DENY = [
  { re: /\bgit\s+push\b[^|;&\n]*(--force\b(?!-with-lease)|\s-f\b)/, why: 'force push overwrites a branch others may already have based work on. Use --force-with-lease, or push to a new branch.' },
  { re: /\bgit\s+reset\b[^|;&\n]*--hard\b/, why: 'reset --hard discards uncommitted work with no undo. Commit or stash first.' },
  { re: /\bgit\s+clean\b[^|;&\n]*-[a-z]*f/, why: 'git clean deletes untracked files. Run it without -f first and read the list.' },
  { re: /\bgit\s+branch\b[^|;&\n]*\s-D\b/, why: '-D deletes a branch even when unmerged. Use -d and let git refuse when it should.' },
  { re: /\bgit\s+checkout\s+--\s+\./, why: 'checkout -- . throws away every uncommitted edit in the tree. Stash first.' },
  { re: /\bgit\s+push\b[^|;&\n]*\s--delete\b|\bgit\s+push\b[^|;&\n]*\s-D\b/, why: 'deleting a remote branch is hard to undo for anyone who pulled from it.' },
];

const rl = createInterface({ input: process.stdin });
let raw = '';
for await (const chunk of rl) raw += chunk;

let toolInput = {};
try {
  toolInput = JSON.parse(raw || '{}').tool_input ?? {};
} catch {
  // Unparseable stdin is not our call to make. Let the tool run.
  process.exit(0);
}

const command = String(toolInput.command ?? '');
// Strip line continuations so a split-out flag cannot slip past.
const normalized = command.replace(/\\\r?\n/g, ' ');

const hit = DENY.find(({ re }) => re.test(normalized));
if (hit) {
  process.stderr.write(`guardrail-kit blocked this command: ${hit.why}\n`);
  process.exit(2);
}

process.exit(0);