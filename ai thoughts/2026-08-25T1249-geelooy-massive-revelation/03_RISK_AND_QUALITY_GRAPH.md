B"H

# Risk and Quality Graph

- broad selectors -> leakage -> regressions
- fixed widths -> mobile overflow -> blocked interaction
- arbitrary z-index -> modal collisions -> inaccessible flows
- always-visible advanced UI -> clutter -> slower comprehension
- hover without focus-visible -> keyboard ambiguity
- layout-heavy animation -> jank -> reduced perceived quality
- giant JS files -> hidden coupling -> unsafe evolution
- transport mixed with views -> difficult tests -> API drift

## Gates

1. Scoped selectors.
2. No horizontal overflow in target viewports.
3. Deterministic local stacking layers.
4. Complete interaction states.
5. Readable non-minified source.
6. Documented data contracts.
7. Test and browser evidence.
