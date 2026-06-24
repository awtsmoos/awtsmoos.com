# B"H — Tunnel action response cleanup plan

## Evidence
`geelooy/api/tunnel/control/core/actionGuidance.js` centralizes the noisy guidance. It attaches top-level `multipleChoiceSelfInterrogation`, `mustContinue`, `mustCallNext`, and also duplicates those fields inside `aiGuidance`. The prompt string is extremely long on every response.

## Target
- Keep one main visible instruction per tunnel response.
- Keep machine-readable `mustContinue`, `mustCallNext`, and top-level `multipleChoiceSelfInterrogation` for agents/tools.
- Stop duplicating the full multi-choice object inside `aiGuidance` unless debug is requested.
- Add a compact `awtsmoosNext` / `responseFocus` object that says exactly what to do next.
- If an agent calls a mission/multi-agent action without mission/room selection, remind it to run `missionProjectDiscover` and `missionProjectJoin` first.
- If safe work remains, remind every response to answer the multiple-choice gate before final answer.

## Files to touch
- Rewrite whole `geelooy/api/tunnel/control/core/actionGuidance.js`.
- Add or run a focused test for concise response shape.
