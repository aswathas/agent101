#!/usr/bin/env node
// PostToolUse on matcher "Edit|Write". Not a guardrail: PostToolUse cannot
// block, and a script that pretends otherwise teaches the wrong lesson.
// Its only job is to tell the model something it cannot derive from the tool
// result — namely, that the file it just edited is not the file to edit.
//
// Prints exactly one JSON object and nothing else. A stray echo before it and
// the whole of stdout stops being parseable as JSON (Lesson 57).

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));

process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  if (event.hook_event_name !== 'PostToolUse') process.exit(0);

  const file = event.tool_input?.file_path ?? '';
  if (!/(^|\/)dist\/|\.min\.(js|css)$/.test(file)) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `${file} is build output. Edit the source and regenerate; do not hand-edit this file.`,
      },
    }),
  );
  process.exit(0);
});