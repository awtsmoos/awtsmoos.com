# Awtsmoos Agent Law For geelooy/ai

B"H

The Awtsmoos renews every file, process, task, and thought from absolute nothing every instant. An agent working here must inspect real files, run real commands, and leave real verification behind. Never pretend that a claim is true because it appears in a prompt; prove it through files, git, tests, browser/runtime responses, tunnel actions, or explicit tool results.

## Default council law

For every non-empty task on a live local or authenticated endpoint vessel, the provider gateway automatically calls the canonical `agent` action before the lead begins its own work. That action starts a non-blocking authenticated ChatGPT website mission with at least three specialists and twelve for a large prompt. Do not replace it with `aiAgentMessage` or `aiAgentSpawnTask`; those are explicit external-provider modes.

The lead never waits idly for delegates or login. It continues useful local work immediately. If the saved ChatGPT website session is authenticated, specialists launch with paced starts. If authentication is missing, one visible login window opens, the mission remains visibly `waiting_for_login`, and it resumes automatically after the user logs in.

Every specialist publishes its plan, scope, progress, findings, blocker, handoff, and verified outcome to the shared mission room. Use concise public work notes, not hidden chain-of-thought. Read peer messages on every safe continuation turn, teach useful findings, avoid overlapping claims, and wake unfinished agents through `websiteAgentMissionMessage`. A long-running job is not permission to idle: perform independent short work while it runs.

## The tunnel action crown

Every AI agent, sub-agent, chapter agent, Code Chat agent, Vibe agent, and provider delegate must treat the generated tunnel action catalog as the source of action names. Do not guess. Discover through `ALL_TUNNEL_ACTIONS`, `generatedTunnelActions.js`, `awtsmoos_tool_details`, or `awtsmoos_tool_call`.

Direct tools expose a safe convenience set. Full access is through the guarded generic call surface with the exact action name and arguments. The final router decides whether the call may reach a native tunnel, browser local bridge, OAuth/cloud vessel, or Virtual OS fallback.

## Native, browser, OAuth, and Virtual OS routing

Prefer a live native/local tunnel. Browser agents should try the local tunnel API at `http://127.0.0.1:3977`; users may override it with localStorage key `awtsmoos.localTunnelApiUrl`. Node-side local agents may use `LocalToolBridge` against the current repository root.

If no local tunnel exists, try the Awtsmoos-authenticated host route. Use the existing Awtsmoos OAuth/session credentials when the platform exposes them. Never ask for or store passwords in files. Never print tokens or copy OAuth cookies into reports. If exactly one connected device exists, select it automatically; ask only when multiple devices are connected.

If no live bridge or OAuth vessel exists, use Virtual OS fallback honestly. Virtual OS can read, write, list, search, bulk read/write, mkdir, stat, simulate simple runtime, and build context packs. It cannot run authenticated website missions and must return `website_mission_requires_live_browser` instead of pretending that agents were spawned.

## Command payload law

The canonical command field is `command`. The server accepts legacy aliases `commands` and `commands64`, but new prompts should teach `command` and `command64`. On Windows/PowerShell tunnels, do not use Unix heredocs or unsupported shell separators. Prefer temporary `.cjs` files created with PowerShell here-strings, run them, then delete them.

## Continuation and sub-agent law

When an agent is spawned to write a chapter, it must keep going through the configured `agentCycles` / `chapterCycles` count, defaulting to eight cycles. A parent may return immediately after spawning children, but it must keep polling them in the background and must not mark the mission complete until all descendants are complete or failed.

Every chapter uses `finishAndContinue` semantics: summarize what was written, list what remains, and continue the next bounded piece while budget allows. If a provider response is truncated, ambiguous, or tool-starved, continue with the available tool bridge. Search for TODOs, failing tests, missing files, stale assumptions, peer handoffs, and open room messages.

## File and secret discipline

Do not store provider keys, OAuth credentials, cookies, or tunnel secrets in git. Use environment variables, browser/session state, or secure provider-key actions. If a tool returns secret-like values, summarize their presence without revealing them.

Rewrite whole files rather than applying partial patches. Keep files small when possible. After writing, reread touched files, run syntax/tests, check `git diff --check`, and only then commit.

## Truthful final answers

A final answer must separate verified facts from untested assumptions. Say when a feature has catalog discovery but only guarded execution. Say when Virtual OS fallback is partial. Say when deployment has not picked up committed source. The Awtsmoos is revealed in truth, not in overclaiming.
