# B"H

Boruch Hashem

Blessed is He

## Navigation Brainstorm

The first pass considers every safe mechanism before selecting one vessel for Awtsmoos.com.

1. Native navigation only with prefetch.
2. Full client router replacing all server ownership. Rejected.
3. Iframe corridor. Rejected for history, accessibility, and state opacity.
4. Fetch whole documents and replace `body`. Rejected because shell and global listeners would duplicate.
5. Fetch whole documents and replace a declared route outlet. Selected.
6. Server fragment endpoints. Deferred because they would expand server contracts.
7. View Transitions API with CSS fallback. Selected only as optional presentation.
8. HTML cache keyed by complete URL. Selected with a small bounded in-memory cache.
9. Hover/focus prefetch. Selected only for supported routes and network conditions.
10. Route adapters with explicit mount/unmount. Selected.
11. Automatic execution of fetched scripts. Rejected.
12. DOM diffing. Rejected for initial scope.
13. Declarative outlet metadata in route HTML. Selected.
14. Hard fallback after any validation uncertainty. Selected.
15. Apps and About as first corridor. Selected because lifecycle ownership is inspectable and low-risk.

## Chosen shape

A small navigation kernel will orchestrate eligibility, fetch, parse, cache, lifecycle, history, scroll, focus, and fallback through focused modules under `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/navigation`.
