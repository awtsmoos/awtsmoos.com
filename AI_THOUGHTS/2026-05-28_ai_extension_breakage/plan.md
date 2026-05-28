B"H

# Extension-backed ChatGPT loading regression plan

## Visible root
The repository root contains `.awtsmoos`, `AI_THOUGHTS`, `geelooy`, `scripts`, tests, package files, and related project folders. The relevant app appears under `geelooy/ai` and the extension server appears under `geelooy/scripts/tricks/extensions/server`.

## Rule for this session
No feature work. Restore basic extension-backed ChatGPT loading at `/ai/?awtsmoosChatGPTMode=regular&awtsmoosAi=chatgpt` before touching automation.

## Grounded workflow
1. Inspect the listed files and nearest imports with real reads.
2. Reproduce the local browser failure at the exact URL.
3. Read console errors and background/extension errors where available.
4. Verify the extension-injected bridge exposes `window.awtsmoosFetch` and/or `window.mFetch`.
5. Verify whether `/backend-api/conversations` leaves through the extension path and what response shape returns.
6. Trace sidebar render from service to controller to pager.
7. Patch only after the failure chain is proven.
8. Rewrite complete files only; no partial patching.
9. Add/adjust focused tests for bridge boot, list mock rendering, failure surfacing, relay opt-in, automation non-blocking, audio safety, and fetch error containment.
10. Run `node geelooy/ai/tests/harness/run.cjs extension liveUi reload static` and `npm run test:ai`, plus browser probe if available.

## First suspicion map
- Browser module loading may fail if a browser-facing module imports Node-only relay code.
- Async/sync bridge detection mismatch may block or mis-route conversation loading.
- Boot may synchronously check Node relay or automation bridge even when extension path should own transport.
- `AwtsmoosGPTify` may throw during conversation node resolution and crash boot.
- Audio/options patches may throw inside conversation load.
- Stream failure code may throw in list/detail fetch flows.

## Verification needed before edit
Every claim must be backed by an actual file read, command output, or browser result.
