B"H
Boruch Hashem
Blessed is He

# Request Factory Style Delta

> The Awtsmoos does not hide a chapter inside a compressed arrow. The original project law explicitly forbids compressed one-line functions, so the refinement pass must honor that law even where the first implementation remained technically below 120 lines.

## Direct reread finding
`requestFactory.js` is 95 lines, but its request table contains many one-line arrow closures such as `meta: () => socialApi.meta()`. The behavior is correct, yet the representation violates the repo's explicit style covenant.

## Repair
1. Rewrite `requestFactory.js` completely as a readable `switch` over operation keys.
2. Preserve every current API call and argument exactly.
3. Keep context derivation (`alias`, `targetAlias`, `query`, `channel`) centralized.
4. Keep route-health wrapping and notification payload helpers explicit.
5. No one-line function bodies.
6. Rewrite `liveActions.js`, `render.js`, `renderCards.js`, and refined `index.js` so newly introduced event/action closures are named multi-line functions where practical.
7. Reread the entire Social slice again before tests.
