#!/usr/bin/env node
// One script, one policy. Reads the hook event on stdin; exits 2 to block.
//
// Wired on PreToolUse for matcher "Bash" and for matcher "Edit|Write".
// The script does not know which group fired it — it branches on the event.
//
// The catch block below exits 0 (fail open). That is deliberate while you are
// developing. See the note at the bottom before you trust this in a repo.

// Adding a rule is adding a line, not adding a branch.
const BLOCKED_COMMANDS = [
  // Push is a human decision here — with one exception: --force-with-lease, which
  // refuses to overwrite a remote that has moved. Blocking the safe variant
  // teaches people to route around the guardrail instead of through it.
  { pattern: /^git\s+push\b(?!.*--force-with-lease)/, reason: 'Pushing is a human decision here. Use --force-with-lease if you really must.' },
  { pattern: /--force(?!-with-lease)/, reason: 'Force-push can destroy a colleague’s work.' },
  { pattern: /\brm\s+-rf?\b/, reason: 'Recursive delete. Delete one path at a time.' },
  { pattern: /\bgit\s+reset\s+--hard\b/, reason: 'Uncommitted work dies here.' },
];

const BLOCKED_PATHS = [/(^|\/)dist\//, /(^|\/)node_modules\//, /\.min\.(js|css)$/];

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));

process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    process.stderr.write('guardrail: unreadable event, allowing\n');
    process.exit(0);
  }

  if (event.hook_event_name !== 'PreToolUse') {
    process.exit(0);
  }

  if (event.tool_name === 'Bash') {
    // An Edit event has no .command; a Bash event has no .file_path.
    // Without ?? '' the undefined reaches .test() and throws.
    const command = event.tool_input?.command ?? '';
    const hit = BLOCKED_COMMANDS.find((rule) => rule.pattern.test(command));
    if (hit) {
      process.stderr.write(`Blocked: ${hit.reason}\n`);
      process.exit(2);
    }
  } else if (event.tool_name === 'Edit' || event.tool_name === 'Write') {
    const file = event.tool_input?.file_path ?? '';
    const hit = BLOCKED_PATHS.find((pattern) => pattern.test(file));
    if (hit) {
      process.stderr.write(`Blocked: ${file} is generated or build output.\n`);
      process.exit(2);
    }
  }

  process.exit(0);
});

// Fail-open note: an unreadable event lets the action through. Fine while you
// are debugging, wrong once other people depend on this. To fail closed, either
// exit 2 in the catch block above, or set "onFailure": "block" on the handler
// in .claude/settings.json — the latter also covers timeouts and crashes.
// Deliberate either way; make sure you know which one you picked.