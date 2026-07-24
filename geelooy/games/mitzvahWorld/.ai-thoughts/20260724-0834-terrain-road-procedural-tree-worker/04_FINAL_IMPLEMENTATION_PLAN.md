# B"H
# Final implementation plan

1. Reread and hash every claimed file immediately before rewriting.
2. Implement general texture-density math and diagnostics.
3. Implement terrain blend and road-surface contracts around the canonical Bézier path.
4. Inspect and adapt the real `geelooy/lib` procedural tree API.
5. Delete fake tree generation only after proving no reachable import requires it.
6. Keep first-frame terrain bright and nonblocking; hydrate rich surfaces and trees asynchronously.
7. Run syntax, import, focused unit, module-identity, tab, line-count, and diff checks.
8. Run one desktop and one 390×844 full-game test after the complete coding pass.
9. Perform one coherent refinement pass from all observed failures.
10. Write final hashes and integration handoff.
