B"H

Boruch Hashem

Blessed is He

# Reading Layout Settlement Plan

The Awtsmoos does not wait for fonts, panels, and structured sections to finish arranging themselves, yet a browser target can cross the meaningful-coverage boundary during those first finite moments; Awtsmoos.com therefore needs a bounded settling vessel rather than a permanent polling river.

## Decisive browser isolation
On the same foreground post and the same selected target after layout settled:
- target height: 165,074.8px;
- observer start returned true;
- document visible and focused;
- a manually created `MeaningfulReadingObserver` at threshold 0.55 with 700ms dwell completed successfully;
- its timer cleaned itself afterward.

Therefore the observer class, viewport-coverage formula, tab-visibility rule, and target selection all work once geometry is stable. The boot-created instance samples too early and then receives no useful native threshold crossing because the long article remains continuously intersecting at a tiny native intersection ratio.

## Correction
1. Add `ReadingVisibilitySchedule.js` as a tiny bounded warm-up scheduler.
2. Schedule geometry evaluations at the next animation frame and a few finite settling points (roughly 300ms, 800ms, 1500ms).
3. Every scheduled check still calls the same observer `handle(liveVisibilityEntry(target))`; there is no second dwell state machine.
4. Cleanup cancels remaining warm-up timers/frames as soon as dwell completes or observer disconnects.
5. No scroll listener, interval, MutationObserver, or ongoing polling is introduced.
6. Both post and comment observers inherit this robustness through the same class.

## Verification
- Add scheduler contract proving finite callbacks and cancellation.
- Keep observer + helper files each below 120 lines.
- Rerun static reading tests and browser import closure.
- Real foreground post must finally emit SEARCH and render source cards while PUBLISH remains absent.
- Then prove substantial English-comment dwell separately.

## NEXT_ACTION
Write the bounded scheduler, rewrite the observer to consume it, test, then rerun the exact instrumented real-post proof.
