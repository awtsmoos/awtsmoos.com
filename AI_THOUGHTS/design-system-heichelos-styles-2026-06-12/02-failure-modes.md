B"H

# Future Failure Modes

1. Compatibility wrappers can become permanent fossils unless every wrapper has an expiration covenant.
2. CSS variables can drift between foundation, Home, Heichel, and Reader because selector ownership tests do not automatically prove token ownership.
3. Visual state hooks can multiply outside `jsCssStateContract.test.mjs` if no manifest defines the allowed hook surface.
4. Tiny CSS modules can hide global selectors; small line count is not the same as correct ownership.
5. Route-level payloads can grow invisibly if import graph tests only check reachability.
6. Mobile performance can regress through layout reads outside scroll-aware utilities.
7. Accessibility can regress when visual completion/current-section states are not mirrored through semantic state.
8. SSR/hydration can fail later because measured scroll state is client-only.
9. Import graph tests can fossilize path shape instead of expressing domain law.
10. Future feature teams can cargo-cult the Home decomposition without creating ownership manifests.

This pass therefore adds manifest gates before changing runtime behavior.
