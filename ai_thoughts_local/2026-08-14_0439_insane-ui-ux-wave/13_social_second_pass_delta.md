B"H
Boruch Hashem
Blessed is He

# Social Second-Pass Delta → Final Pre-Test Refinement

> The Awtsmoos does not ask whether a vessel barely fits the law; it asks whether the vessel can breathe. A file at exactly 120 lines is a warning, not a victory.

## Second reread evidence
- `operationPolicy.js`: 103 lines.
- `operationGroups.js`: 51 lines.
- `requestContext.js`: 60 lines.
- `requestFactory.js`: 103 lines after payload split.
- `requestPlan.js`: 19 lines.
- `liveActions.js`: 93 lines.
- `resultPreview.js`: 93 lines.
- `resultDigest.js`: 52 lines.
- `renderConfig.js`: 99 lines.
- `renderCards.js`: 113 lines.
- `renderMarkup.js`: 68 lines.
- `render.js`: 93 lines.
- `index.js`: exactly 120 lines.
- `results.css`: 64 lines.
- `preboot.css`: 76 lines.

## Contract evidence preserved
- Bulk read groups contain no mutation keys.
- The five HTTP mutations remain isolated in policy/mutation groups.
- WebSocket connect consequence now names login, subscription, presence, and ping.
- Publishing orchestration now waits for actual socket readiness.
- Raw JSON remains under Advanced disclosure.
- Preboot shell remains useful before JavaScript.

## Final pre-test refinement
1. CREATE `operationRunner.js` to own execute/status/read-group/mutation guards; `index.js` becomes a tiny assembly root.
2. CREATE `htmlEscape.js` so escaping is a shared utility rather than card-renderer responsibility.
3. CREATE `renderLiveCard.js` for WebSocket side-effect markup and live-message evidence.
4. REWRITE `renderCards.js` to own only read cards, mutation cards, and section composition.
5. REWRITE `renderMarkup.js` to import escaping from `htmlEscape.js`.
6. REWRITE `index.js` to compose `operationRunner`, `liveActions`, renderer, and presence only.
7. Reread every refined file and confirm comfortable headroom below 120.
8. Then and only then add the mutation-leak sentinel test and begin verification.
