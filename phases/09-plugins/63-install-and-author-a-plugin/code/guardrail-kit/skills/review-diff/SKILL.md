---
name: review-diff
description: Review the current diff for lost work, secrets, and scope creep before committing. Use when the user says review, check my changes, or before commit.
disable-model-invocation: true
---

Review the working-tree diff for three things, in this order. Report file paths.

1. **Lost work.** Any edit that removes behaviour another file still calls.
2. **Secrets.** Any string that looks like a credential: keys, tokens,
   passwords, connection strings. Quote the path, never the value.
3. **Scope.** Anything in the diff that the user's stated task did not ask for.

End with one line: `SAFE TO COMMIT`, or `BLOCKED: <reason>`.

Do not edit files. This skill reads and reports; it does not fix.