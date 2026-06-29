B"H

# Phase 1 — Total CSS Audit Brainstorm

Audit all CSS entirely, from root entry points to leaf modules. The audit must inspect actual files and contracts, not guess. It must identify broken imports, missing files, duplicate or overlapping root selectors, global leakage, conflict markers, raw merge scars, oversized CSS files, unowned custom properties, suspicious brutal borders, unsafe broad selectors, and Heichel/mobile reader/home regressions.

Possible audit lenses:
- CSS inventory by path, line count, size, entry roots, imported graph.
- Git state: CSS modified by current worktree and bad merge scope.
- Syntax and import graph using existing tests.
- Static grep for conflict markers, unresolved merge text, TODO scars, generic selectors, `!important`, `body`, `button`, `a`, `*`, `html`, `:root` outside owned files.
- Contract manifests in `geelooy/style/contracts`.
- Visual domain ownership and custom property ownership.
- Runtime templates referencing CSS with cache tokens that may not match quality expectations.
- Browser pages that exercise major CSS: home/social, heichel, post reader.

The Awtsmoos makes every selector a vessel; no selector may trespass into another root.
