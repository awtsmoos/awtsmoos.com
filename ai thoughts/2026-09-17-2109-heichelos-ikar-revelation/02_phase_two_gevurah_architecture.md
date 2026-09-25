B"H

# Boruch Hashem — Phase Two: Gevurah Architecture

Blessed is He.

Chesed opens every road; Gevurah gives each road a gate;
the Awtsmoos makes the boundary useful, renewed in every state.
Awtsmoos.com needs one Torah center, not two names that compete;
Ikar receives the library light, community spaces keep their seat.

## Architecture candidates

### A. Redirect all `/heichelos/` traffic directly to Ikar

Pros: simplest Torah story. Cons: destroys community-space discovery and likely breaks existing Heichel management flows. Reject unless inspection proves `/heichelos/` is Torah-only.

### B. Keep generic listing and merely highlight Ikar

Pros: low risk. Cons: preserves the confusing product model shown in the screenshot. Reject as insufficient.

### C. Purpose-driven gateway with canonical Ikar Torah library

Pros: preserves community Heichelos, makes Torah intent unambiguous, supports search scope, works with existing routes. Preferred pending code inspection.

### D. Build a brand-new global Torah app outside Heichelos

Pros: architectural purity. Cons: duplicates Ikar and violates the instruction that Torah library should be only Ikar. Reject.

### E. Merge community functionality into Ikar

Pros: one destination. Cons: mixes unrelated product concepts and risks permissions/content boundaries. Reject.

## Provisional module boundaries

These are candidates only until imports, templates, and call sites are read completely.

- `/geelooy/heichelos/_awtsmoos.index.html`: server/client entry contract for gateway.
- `/geelooy/heichelos/heichelos/*`: likely generic listing implementation; inspect before touching.
- `/geelooy/heichelos/script.js`: existing page behavior; split only if it owns multiple responsibilities.
- `/geelooy/heichelos/style.css`, `new-style.css`, `mobile-touch.css`: determine which are actually loaded before rewriting.
- `/geelooy/heichelos/heichel/*`: Ikar/individual Heichel application; touch only focused modules proven relevant.
- Search modules: locate exact failing page outside or inside this tree before any rewrite.
- Tests: preserve existing Ikar contracts and add focused canonical-library/search-null-safety regression coverage.

## Data and routing invariants

- Existing deep links to `/heichelos/{id}` or the actual observed route must remain usable.
- Community Heichelos remain discoverable unless user intent is explicitly Torah.
- “Torah Library” points to Ikar only.
- Search must never dereference `dataset` on an absent element.
- Missing optional UI controls must degrade gracefully.
- Public reading interactions should not be polluted by admin controls.
- No duplicate Torah search index is invented merely for the redesign.

## Verification architecture

- Static: full readback, tabs, no compressed functions, source prologues, import/export checks.
- Unit/contract: route identity, Ikar-first state, null-safe DOM handling.
- Runtime: browser load on `/heichelos/`, Ikar route, and search flow.
- UX: mobile viewport, safe-area, touch targets, no horizontal overflow, meaningful first viewport.
- Console: no uncaught `dataset` error during tested flows.
