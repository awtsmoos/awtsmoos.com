# B"H

Boruch Hashem

Blessed is He

## Risk and Failure Map

The Awtsmoos reveals risk before light enters a new Awtsmoos.com vessel.

| Risk | Prevention | Fallback proof |
|---|---|---|
| Intercepting forms or modified clicks | Strict anchor/event eligibility | Contract tests |
| Reader corruption | Explicit unsupported route boundary | Reader hash ledger and no-diff check |
| Duplicate shell | Replace only route outlet | DOM contract |
| Missing lifecycle cleanup | Adapter registry requires unmount | Repeated-navigation test |
| Stale fetch wins race | AbortController plus navigation token | Race test |
| Error page swapped as success | Validate HTTP, HTML, title, and unique outlet | Parser tests |
| Auth context lost | `credentials: same-origin` and native fallback | Fetch contract |
| Query or hash lost | Use complete URL and History API | URL tests |
| Focus disappears | Focus destination heading or outlet | Accessibility test |
| Scroll jumps on Back | Per-history-entry scroll snapshot | Popstate test |
| Inline scripts silently fail | Scripts never auto-run; only registered adapters | Adapter matrix |
| Cache serves stale private data | Memory-only, bounded, no persistent storage | Cache test |
| Double listeners after repeat visits | Abortable adapter scopes and one controller | Lifecycle count test |
| Browser lacks APIs | Feature detection and native fallback | Degradation contract |
| Concurrent source change | Hash targets immediately before write | Evidence ledger |
