# 10 — Heichelos DISCOVERY page CSS strike (2026-11-26)

Scope: https://awtsmoos.com/heichelos/ ONLY (hero, search, cards grid, its load list).
Single-heichel pages, composer, /social/ untouched (other lanes).

## Tracer (scripts/css-gate/css-conflict-trace.mjs, served mode, local :8080)

| Metric | Before | After |
|---|---:|---:|
| Files loaded | 8 (2 HTTP requests: 1 CompactCSS bundle + universal-ui) | 8 |
| Total CSS bytes | 82,316 | 83,720 |
| Cross-file collisions | 2 | **0** |
| True conflicts (different values) | 1 | **0** |
| Same-value duplicates | 1 | **0** |
| Exact-duplicate rules | 0 | 0 |
| Shadowed declarations | 11 | 9 (see remainders) |

Byte delta is +1,404 and is entirely NEW defining rules for previously
unstyled elements (below) — the conflict fixes themselves removed bytes.
No safe byte/file cut existed beyond that: every non-aggregator file wins
declarations on this page (universal-ui 542, law8 422, inline vessels
49/159/15, discovery.css 3), and the page already loads in 2 requests.

## Conflicts fixed (one owner per property, zero visual change)

1. `.heichelos-discovery-page .spaces-section-heading h2` · `letter-spacing`
   — was: inline vessel `-.025em` (winner) vs law8 `-0.02em`.
   Fix: declaration deleted from `geelooy/heichelos/heichel-polish-law8.css`
   (discovery-scoped rule; its `color` stays). Sole owner: the inline vessel
   in `templates/heichelos/discovery-interaction-style.html`.
2. `.heichelos-discovery-page .space-card-link` · `transition` under
   `@media (prefers-reduced-motion: reduce)` — same value `none` in both files.
   Fix: in law8 the selector was split out of the grouped rule; it keeps
   `animation: none` there, and `transition: none` is now owned solely by the
   inline vessel. The grouped rule's other selectors (incl. `.heichel-os-page`
   ones belonging to the single-heichel lane) keep identical declarations.

## Unstyled elements found + fixed (classes-vs-rules audit, full loaded set
incl. the 55-file aggregator @import chains resolved from disk)

- `.spaces-more` (the "More community spaces" `<details>`) and
  `.spaces-compact-list` had NO rule anywhere — the summary rendered as raw
  browser chrome and the extra cards stacked outside the grid. Now styled in
  the inline vessel: details spans the grid (`grid-column: 1 / -1`), summary
  is an ivory/gold pill (gradient `#fffdf6→#f8f0db`, border `#d9c9a8`, ink
  `#2b2118`, gold count span, marker removed), and the compact list mirrors
  `.spaces-grid` exactly (1 col; ≥760px auto-fill minmax 21rem, gap 1.25rem).

## Named remainders (not defects on this page)

- Zero-win files `/style/geelooy-app/index.css` + `/style/social-system/index.css`
  are @import AGGREGATORS (19 + N shell files: header, shell, home, portals…).
  The tracer cannot expand @import chains in served mode, so they score 0
  wins; in the browser they carry the shell chrome. NOT extra — kept.
- 8 of the 9 remaining shadowed declarations are intra-file inside
  `/style/universal-ui.css` (shell foundation bundle, shared infra — shell
  lane's file, not this surface). 1 is a media-context artifact in the
  vessel (`.spaces-hero h1` font-size + `.spaces-command-row`
  justify-content are intentional breakpoint overrides, verified by hand).
- Classes with no rule of their own whose ELEMENTS are fully styled via
  companion classes: `empty-state` (with `social-empty-card spaces-state-row`),
  `torah-library-link` (with `space-card-link`). Modifier/state hooks only.
- `all awtsmoospage` on the outermost wrapper div is the shell's page hook
  (every page) — shell lane's class, block layout by default.

## Verification

- Tracer re-run after fixes: conflicts 0 · diffValue 0 · sameValue 0 ·
  exactDupRules 0 (report: css-conflict-report-heichelos.json/.md in this dir).
- Full social-css-check gate: EXIT 0, zero "not ok" (profile contracts,
  composer journey, tunnel + richSocial suites all passed).
- End-phase rendered screenshots (390 + 1280, both themes) read by the
  worker: see 07-deployment-evidence / run report — hero contrast, card
  grid, search legibility confirmed; "More community spaces" pill renders
  in the page's ivory/gold language when the grid overflows the featured
  limit (state-dependent).

Files changed: `geelooy/heichelos/heichel-polish-law8.css`,
`templates/heichelos/discovery-interaction-style.html`, this file + tracer
reports. NOTE for the single-heichel lane: the two law8 edits touch only
`.heichelos-discovery-page`-scoped selectors — inert on heichel pages.
