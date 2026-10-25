# Install, First Run, Verify

> Presence is not correctness. Verify that it runs, not that the binary exists.

**Type:** Build
**Prerequisites:** Lesson 27 (What Claude Code Is)
**Time:** ~20 minutes

## Learning Objectives

By the end of this lesson, you can:

1. Install Claude Code on your machine using the official method for your platform.
2. Launch Claude Code from a terminal and exit it cleanly.
3. Verify the install is *real*: the tool launches, reads a file, and answers one instruction.
4. Re-run the Phase 00 setup-check script and read its verdict on the `claude` entry.
5. Update or uninstall Claude Code using the same three-command lifecycle.

## The Problem

You run the install command. The terminal prints a path. You type `claude` and it runs. So it's working.

Or so you think.

This is the failure mode Phase 00 warned about: a shim on `PATH` that prints a version number and exits. The binary exists. The tool does not work. You cannot tell the difference from the outside until you ask the tool to do something.

Lesson 5 told the same story with a different tool. The fix is the same fix: do not trust that the install command succeeded. Trust the *use* of the tool.

## The Concept

Three commands. One per platform for install. One for verify. One for update.

```
# macOS / Linux / WSL: the official install command from the docs
# Windows (native): the official install command for Windows from the docs
# pick the one for YOUR machine
```

The principle, restated: **The reframe: presence is not correctness.** A successful install is one where you can ask the tool to do one thing and it does it. Not one where the binary exists.

The verification step matters because it is the only way to tell a working install from a shim.

## Build It

Numbered. End each step with a check.

**Step 1 — Install.** Run the install command for your OS from the official source. The command is one line. Do not improvise it. Do not copy a blog post. Do not follow a Stack Overflow answer. Use the official docs page for your platform.

Check: the install prints a success line. If it printed an error, fix that first. Do not proceed.

**Step 2 — Launch once.** Open a terminal in any directory. Type the launch command. Wait for the prompt.

```
claude
```

You should see Claude Code's interface. If you see "command not found," the install failed or the binary is not on your `PATH`. Stop and fix this before going further.

To leave: type `/exit` and press Enter. (Slash commands are covered properly in Lesson 30. For now, just know `/exit` exists.)

Check: you exited cleanly back to your shell prompt.

**Step 3 — Read a file from a directory.** From inside a project directory you trust, launch Claude Code and ask it to read one specific file. Pick a file you know exists.

```
claude
> Read the file README.md and tell me the first line.
```

A working install answers. A shim, even a clever one, does not.

Check: the tool returned the first line of the file. If it did not, the install is not real. Go back to Step 1.

**Step 4 — Re-run setup-check.sh.** From your project root (the same place you ran it in Phase 00), run:

```
./scripts/setup-check.sh
```

Look at the line for `claude`. After a real install, the entry should report `ok` — your script's "real binary" marker, the one that distinguishes it from the `MISS` or `shim` state from Phase 00.

Check: the `claude` line is no longer flagged as missing or shim.

**Step 5 — Know the lifecycle commands.** You do not need to run update or uninstall now. Just know they exist. The table below has them.

## Use It

| Action | Command | Notes |
|---|---|---|
| Install | the official command for your platform from the docs | One line. Pick the one for YOUR OS. |
| Update | the official update command for your platform | Run when a new version ships. |
| Uninstall | the official uninstall command for your platform | Reversible. You can reinstall. |
| Exit a session | `/exit` | From inside Claude Code. |
| Check the install | `./scripts/setup-check.sh` | From your project root. The `claude` line should not read `MISS`. |

## Exercises

**Exercise 1 — Install and launch.**
Run the install command for your platform. Launch Claude Code. Exit with `/exit`.

Pass: you end back at your shell prompt with no error message in the transcript.

**Exercise 2 — Verify it actually reads a file.**
From a directory that contains a file you know (e.g. `README.md`), launch Claude Code and ask it to read the file and report one fact about it.

Pass: the tool reports a fact that matches the file's actual content. A shim cannot do this.

**Exercise 3 — Confirm via setup-check.sh.**
Run `./scripts/setup-check.sh` from your project root.

Pass: the `claude` entry reports `ok` (or your script's equivalent of "real binary"). It must not report `MISS` or `shim`.

## Key Terms

**Installed.** What people say: "the install command finished without an error." What it actually means: the binary exists *and* it can read a file *and* it responds to an instruction. The first alone is not enough.

**PATH.** What people say: "it's on PATH, so it works." What it actually means: the shell can find a file by that name. That file might be a working binary, an old binary, or a shim. PATH is a lookup mechanism, not a correctness guarantee.

**Verification.** What people say: "I checked it runs." What it actually means: you asked the tool to do a task it cannot fake. For Claude Code the floor is: read a file you named and report something true about it.

**Shim.** What people say: "a placeholder for the real thing." What it actually means here: a script or binary on PATH that imitates the real tool enough to fool a presence check. The Phase 00 setup-check.sh was written to catch exactly this.

## What this lesson skipped

Custom configuration (model selection, paid plans, default settings) — Lesson 29. The full introduction to slash commands beyond `/exit` — Lesson 30. The first real "give Claude a goal and let it work" session — Lesson 31.
