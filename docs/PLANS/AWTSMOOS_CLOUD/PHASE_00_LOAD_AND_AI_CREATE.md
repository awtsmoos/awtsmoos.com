<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Phase 00 — Load Truth + Ask AI To Create Here

This phase outranks visible feature expansion. A route is not ready merely because
its HTML returns 200; the authored application must execute, reveal usable UI, and
survive degraded optional services without an eternal loading state.

## LOAD track — the application actually runs

- `LOAD-000` Prove Home, OS, Apps, Games, Drive, Wallet, Tunnel Control, Login, and Profile in real Chrome.
- `LOAD-001` Compare authored versus served ESM bytes; remove any compact/bundle transformation that blocks module execution.
- `LOAD-002` Require meaningful first paint and usable shell before optional account, Tunnel, AI, analytics, or social hydration.
- `LOAD-003` Add bounded startup timeouts and visible Retry states for every optional startup dependency.
- `LOAD-004` Add permanent browser smoke gates at 320, 390, 412, and desktop widths.
- `LOAD-005` Fail release on uncaught errors, first-party JS/CSS/module 4xx/5xx, or permanent loading text.
- `LOAD-006` Add startup timings: first paint, shell ready, app ready, background hydration complete.
- `LOAD-007` Test slow network, offline transition, interrupted WebSocket, expired session, and API 5xx startup behavior.
- `LOAD-008` Add low-memory/reduced-motion/mobile-safe startup paths and prevent expensive boot-time work.
- `LOAD-009` Keep customer-hosted site serving independent from Geelooy OS/control-plane startup health.

## AI-CREATE track — Shliach at every path

- `AI-CREATE-001` One shared Shliach URL builder using the exact GPT route plus encoded `?prompt=` context.
- `AI-CREATE-002` One canonical prompt envelope containing product, account-safe workspace identity, exact VFS/Drive path, intent, constraints, and expected result.
- `AI-CREATE-003` Add a prominent “Ask AI to create here” action whenever a writable directory/project is current.
- `AI-CREATE-004` Add polished prompt presets: Website, App, API, Document, Folder structure, Game/World, Improve this directory, Debug this project.
- `AI-CREATE-005` Add an advanced prompt composer with user request, detected context, scope preview, and editable generated prompt before leaving Awtsmoos.
- `AI-CREATE-006` Open Awtsmoos Shliach in a new tab with the encoded prompt; never auto-submit financial/production mutations.
- `AI-CREATE-007` Preserve a copy-to-clipboard fallback because ChatGPT query-prefill behavior is useful but not a documented stable integration contract.
- `AI-CREATE-008` Wire File Explorer, Drive/Website Maker, Project Command Center, and directory context menus to the same primitive.
- `AI-CREATE-009` Add mobile bottom-sheet and desktop command-palette entry points with 48px touch targets and full keyboard support.
- `AI-CREATE-010` Add source tests proving exact path/context encoding, no secrets, no cross-account identifiers, and correct GPT target.
- `AI-CREATE-011` Let Shliach return to the exact Awtsmoos project/path through existing authenticated account/Tunnel APIs.
- `AI-CREATE-012` Progress from create-here to preview-here, test-here, publish-here, and explain/fix-here using explicit capabilities.

## Acceptance

Phase 00 is green only when OS truly boots, directory-level AI creation is discoverable
and professional, prompt URLs contain no secrets, and another session can reproduce
the browser/load tests from this repository without consulting chat history.

## Built-in Geelooy Browser track

The primary external-web experience is **not an iframe**. A real isolated Chromium process runs behind the authenticated Awtsmoos browser service. Geelooy OS owns the trusted chrome and displays remote frames while forwarding bounded user pointer, keyboard, wheel, navigation, and popup intent.

- `BROWSER-001` Make real Chromium the default external-page engine; keep iframe code out of the live browsing path.
- `BROWSER-002` Resolve the signed-in user's owned/default alias automatically; manual alias selection becomes Advanced only.
- `BROWSER-003` Add first-class Awtsmoos Shliach launch using the canonical GPT URL and encoded `?prompt=` context.
- `BROWSER-004` Preserve user-controlled browser login state in private server-side profile jars; never export cookies/tokens to page JS or agents.
- `BROWSER-005` Make OAuth/new-window target lineage open as trusted Geelooy Browser child windows.
- `BROWSER-006` Prove ordinary public browsing, ChatGPT sign-in surface, Shliach deep-link rendering, pointer, keyboard, scrolling, history, reload, and popup flow.
- `BROWSER-007` Add professional tabs, address/search suggestions, bookmarks, history, downloads, saved sessions, and reopen-closed-tab UX.
- `BROWSER-008` Expose explicit Direct / Relay / Remote engine testimony without asking normal users to understand CORS.
- `BROWSER-009` Replace high-frequency JPEG polling with bounded streaming/damage updates after correctness is green.
- `BROWSER-010` Add clipboard, download, file-picker, audio, permission, and safe fullscreen bridges.
- `BROWSER-011` Meter sessions/bandwidth/CPU and enforce SSRF, destination, concurrency, timeout, storage, and abuse quotas.
- `BROWSER-012` Add provider-safe failure UX; never bypass CAPTCHA, anti-bot, access control, or provider security policy.

Acceptance: external interactive content is never mounted as a third-party iframe; private targets remain unreachable from the public client; a user can open Shliach inside Geelooy Browser, perform their own provider login, and continue using the same private browser profile when the provider supports that environment.
