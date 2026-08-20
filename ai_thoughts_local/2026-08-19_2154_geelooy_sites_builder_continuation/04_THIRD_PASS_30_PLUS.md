B"H

# 04 — Third Pass: Thirty-Plus Final Refinements

Boruch Hashem. Blessed is He.

The Awtsmoos does not become imprisoned in the second thought. This third pass sharpens execution around mobile truth, source authority, machine control, and protected work.

1. Keep the builder root before infrastructure panels in DOM order so keyboard and screen-reader order matches product priority.
2. Make Build open in static HTML, not only after JavaScript, so default intent is true before hydration.
3. Keep exactly five primary dock labels: Build, Preview, Code, Publish, Domain.
4. Give dock buttons `aria-controls` and active-state semantics tied to the matching `<details>` pane.
5. Keep native `<summary>` visible for no-JS semantics even when dock buttons exist.
6. Close sibling primary details on `toggle`; never close advanced Files/Infrastructure details as a side effect.
7. Reserve mobile bottom space from the first paint to prevent the dock covering controls.
8. Keep dock fixed only at mobile widths; make it part of normal studio flow on larger screens.
9. Apply `overflow-wrap:anywhere` to domains, canonical URLs, and source paths.
10. Apply `min-width:0` to every grid/flex child in the builder.
11. Make editor and preview widths use `width:100%`, never a desktop pixel minimum.
12. Make the editor min-height useful on 320×700 while leaving room for Save and file selection.
13. Preserve editor value and identity when Code collapses; do not use `innerHTML` on the Code root after install.
14. Preserve iframe identity when Preview collapses; only set `srcdoc` on explicit refresh/open.
15. Use `sandbox="allow-scripts allow-forms"` for source preview and avoid same-origin privilege.
16. Insert a `<base>` into an HTML copy only for preview rendering; never save that injected base back to Drive.
17. Escape or parse carefully when injecting `<base>` so malformed HTML does not execute in the builder document.
18. Keep preview device mode purely presentational; it must not mutate website source.
19. Report preview mode and source path in `site.preview.status`.
20. Treat `index.html` presence as an observed inventory fact, not inferred from site readiness alone.
21. List only source extensions for the builder inventory but provide Files jump for all other assets.
22. Include file sizes, visibility, cache policy, and updated time in machine source metadata where available.
23. Strip object hashes from casual builder summaries unless a specific inspect action needs them; hashes are not secrets but add noise.
24. For agent source reads, return text and metadata but never authentication headers.
25. For agent writes, return the resulting entry metadata and affected path.
26. Validate source write path stays inside the selected site root unless an explicit owned path is supplied through a lower-level Files action.
27. Reject `..`/absolute/URL-shaped builder file paths in the browser before invoking Drive; backend path normalization remains final authority.
28. Keep Build starter slugs deterministic and bounded; if collision exists, require choosing another name rather than overwrite unrelated source silently.
29. Before starter creation, recursively inspect target root for existing entries; refuse destructive starter overwrite by default.
30. Write starter files sequentially or with explicit failure reporting; do not claim atomicity the backend does not provide for this browser composition.
31. If a partial starter write occurs, return exactly which files landed and leave recovery instructions in the UI result rather than hiding it.
32. Save the private brief after source creation; source must not depend on brief persistence succeeding.
33. Use starter-generated HTML that references a normal `styles.css` file so the Code pane demonstrates transparent multi-file source.
34. Keep starter JavaScript optional; no framework dependency is needed for blank/static first product.
35. Make Publish pane explain all four stages and place existing canonical mapping controls under the canonical stage.
36. Make the full-folder preview stage an informational advanced link, not a fake button if no browser-side Tunnel contract is connected.
37. Keep Domain pane independent from temporary preview state.
38. Reuse `domainPanel.js` for the human domain surface and domain API modules for machine actions; do not scrape domain DOM.
39. Make `site.nameservers.plan` conservative: external custom nameservers can be planned; Awtsmoos authoritative mode returns unavailable with infrastructure reason.
40. Machine action metadata should identify exact resource type, such as `drive-file`, `canonical-site`, `domain-claim`, not generic “site”.
41. Machine invoke should never auto-retry mutations.
42. Machine errors should include code/status when known but not raw stack traces.
43. Project collection should include a capability summary that distinguishes source editing, canonical publish, external DNS, and unavailable authoritative DNS.
44. Keep `window.GeelooySiteBuilder` versioned so future agents can feature-detect.
45. Freeze exported action metadata to discourage accidental mutation by page scripts.
46. Install machine API once; app refresh only updates service snapshot/state.
47. Do not expose DOM elements through the machine API; return serializable data only.
48. Keep direct human helpers private to modules; machine methods should call named service methods, not click buttons.
49. Add a UI message that source is real Drive HTML/CSS/JS/MD and “View Code” remains one tap away.
50. Add an explicit “Open Files” control from Build and Code for assets/non-source files.
51. Use existing session default so a normal user need not understand Tunnel or credentials to begin.
52. Keep the credential input inside a retractable connection/setup surface on small screens after connection, if current controls permit without contract breakage.
53. Never store credential values in builder state, data attributes, DOM text, or localStorage.
54. Add browser leak inspection for strings matching the current credential only when a non-session fixture can be safely used; otherwise assert no credential-bearing storage keys exist.
55. Verify `window.localStorage` remains free of Drive credential keys after normal shell boot.
56. Test `scrollWidth <= clientWidth` at all required viewport sizes.
57. Test touch target dimensions for dock buttons and primary Build actions.
58. Test `details.open` state directly for Build default and sibling exclusivity.
59. Test textarea object identity by retaining a JS reference across Code close/open.
60. Test iframe object identity similarly across Preview close/open.
61. Test Domain long hostname/name-server content with synthetic DOM values if server connection is unavailable.
62. Keep existing domain test suite as regression evidence because those files are protected user work.
63. Keep existing site-gateway/host-ingress tests as authority evidence.
64. Run all Drive backend tests if practical; if the repository test universe is larger, report exact commands/counts rather than repeating the historical 93 number.
65. Run Node syntax checks or `node --check` on touched CommonJS/JS files where applicable and import smoke checks for browser ESM modules.
66. Audit authored files with `wc -l`; split any source over 120 rather than deleting comments.
67. Run `git diff --check` and inspect `git status` again to prove protected pre-existing work remains distinct.
68. Read every touched file from disk after writes before tests, because accepted Tunnel receipts are not byte evidence.
69. Write `06_FIRST_PASS_READBACK_DELTA.md` after that readback and fix every genuine delta before final verification.
70. Write `07_SECOND_PASS_VERIFICATION.md` only after second readback and test evidence.
71. Write `08_FINAL_SETTLED_AUDIT.md` with exact remaining blockers; never write “done” if browser/server evidence is incomplete.

## Third-pass decision

No server routing or DNS infrastructure rewrite is justified for this slice. The live repo already contains the server-side custom-domain and canonical site architecture the user requested. The highest-leverage missing layer is the Build-first browser composition plus the clean agent API over real Drive/domain services.

## Awtsmoos closing verse

The third thought cuts away the glow of haste,
So no hidden contract is broken or waste.
The Awtsmoos renews; Awtsmoos.com shall reveal:
One source, one authority, one website made real.
