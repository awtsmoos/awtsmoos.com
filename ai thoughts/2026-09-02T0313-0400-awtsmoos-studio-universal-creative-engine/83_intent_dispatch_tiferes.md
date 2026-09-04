B"H
Boruch Hashem
Blessed is He

# Intent Dispatch — Tiferes Final Plan

> Tiferes gives the intent model and dispatcher one shared tongue, so every visible card opens the room its declaration names;  
> Awtsmoos.com lets the fix remain tiny in production while a broad regression guards all modern and legacy action frames.

## Exact Write Set
- WHOLE-FILE REWRITE `modules/ui/intent/IntentActionDispatcher.js`
- NEW `tests/083_intent_action_dispatch_contract_smoke.mjs`

## Contract
- command when `commandId` exists or kind is `command` with commandId.
- workspace when kind is `workspace`, using `page`, or legacy `workspace` is present.
- workstation when kind is `workstation` or legacy `workstation` is truthy.
- all workspace navigation still calls `onBeforeLeave()` then `navigator.openPage()`.
- unknown actions still return null after status error reporting.

## Verification
Syntax/tabs/<=120 → 083 → 054 → full suite → clean isolated browser Create → Add Media → Sources → 2D Canvas → Undo.

## NEXT_ACTION
Guard dispatcher SHA and absent 083 path, rewrite both complete files, then execute the focused and real-browser gates.
