# Awtsmoos Agent Law For geelooy/ai

B"H

The Awtsmoos renews every file, process, task, and thought from absolute nothing every instant. An agent working here must therefore inspect real files, run real commands, and leave real verification behind. Never pretend that a claim is true because it appears in a prompt; prove it through files, git, tests, browser/runtime responses, tunnel actions, or explicit tool results.

## The tunnel action crown

Every AI agent, sub-agent, chapter agent, Code Chat agent, Vibe agent, and provider delegate must treat the generated tunnel action catalog as the source of action names. Do not guess. Discover through `ALL_TUNNEL_ACTIONS`, `generatedTunnelActions.js`, `awtsmoos_tool_details`, or `awtsmoos_tool_call`.

Direct tools may expose only a safe subset for convenience. Full access is through the guarded generic call surface: use the exact action name and the exact arguments. The final router decides whether the call may reach a native tunnel, browser local bridge, OAuth/cloud vessel, or Virtual OS fallback.

## Native, browser, OAuth, and Virtual OS routing

Prefer a live native/local tunnel when one is available. Browser agents should try the local tunnel API at `http://127.0.0.1:3977`; users may override it with localStorage key `awtsmoos.localTunnelApiUrl`. Node-side local agents may use `LocalToolBridge` against the current repository root.

If no local tunnel is available, try the Awtsmoos-authenticated route provided by the host app. Use the user's existing Awtsmoos OAuth/session credentials when the platform exposes them. Never ask for or store passwords in files. Never print tokens. Never copy OAuth cookies into reports. If an OAuth session has connected devices, choose the current connected tunnel automatically when the device API provides exactly one; ask only when multiple are connected.

If no live bridge or OAuth vessel exists, use Virtual OS fallback honestly. Virtual OS can read, write, list, search, bulk read/write, mkdir, stat, simulate simple runtime, and build context packs. It cannot truthfully execute every live-tunnel-only action. When a requested action returns `requires-live-tunnel`, explain that a native tunnel, browser local tunnel, or OAuth control session is needed.

Use `tunnelName: "awtsmoos-virtual-os"` or `targetVessel: "virtual-os"` only when the user wants hosted Virtual OS work or no local tunnel is available. Use a real native `tunnelName` when one is known.

## Command payload law

The canonical command field is `command`. The server also accepts legacy aliases `commands` and `commands64`, but new code and prompts should teach `command` and `command64`. On Windows/PowerShell tunnels, do not use Unix heredocs or unsupported shell separators. Prefer temporary `.cjs` files created with PowerShell here-strings, run them, then delete them.

## Continuation and sub-agent law

When an agent is spawned to write a chapter, it must keep going through the configured `agentCycles` / `chapterCycles` count. The default is eight cycles. A chapter agent writes the first draft, then repeatedly expands and verifies it until the required cycles are complete or the parent cancels.

A parent task may return immediately after spawning children, but it must keep polling the children in the background and must not mark itself complete until all child tasks are complete or failed. Every chapter run should use `finishAndContinue` semantics: summarize what was written, list what remains, and spawn/continue the next chapter when the budget allows.

If a provider response is truncated, ambiguous, or tool-starved, continue with the available tool bridge instead of calling the task done. Search for TODOs, failing tests, missing files, and stale assumptions.

## File and secret discipline

Do not store provider keys, OAuth credentials, cookies, or tunnel secrets in git. Use environment variables, browser/session state, or the existing secure provider-key actions. If a tool returns secret-like values, summarize their presence without revealing them.

When modifying source files, rewrite whole files rather than applying partial patches. Keep files small when possible. Prefer splitting oversized logic into smaller modules. After writing, reread the touched files, run syntax/tests, check `git diff --check`, and only then commit.

## Truthful final answers

A final answer must separate verified facts from untested assumptions. Say when a feature has full catalog discovery but only guarded execution. Say when Virtual OS fallback is partial. Say when deployment has not yet picked up committed source. The Awtsmoos is revealed in truth, not in overclaiming.
