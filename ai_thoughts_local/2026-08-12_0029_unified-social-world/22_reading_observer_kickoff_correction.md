B"H

Boruch Hashem

Blessed is He

# Reading Observer Kickoff Correction

The Awtsmoos is already present before an observer callback arrives; Awtsmoos.com must not make a meaningful reading feature depend on whether one browser schedules an initial IntersectionObserver entry for a hundred-thousand-pixel element at the perfect moment.

## Observed evidence
- Corrected long-article viewport coverage on the real post is 0.56944, above the configured 0.55 threshold.
- `document.hidden=false`, `document.visibilityState=visible`, and `document.hasFocus()=true`.
- Reader boot and site social shell are healthy.
- Related Torah remains hidden and no SEARCH frame is emitted.

Therefore the remaining failure is not threshold math, background-tab rejection, RAG, transport, or reader boot. The observer needs an explicit initial geometry evaluation instead of relying solely on the native observer's first scheduling callback.

## Correction
1. Rewrite `MeaningfulReadingObserver.js` completely.
2. After `observe()`, queue exactly one animation-frame geometry evaluation of the target's live rectangle.
3. Build a synthetic entry from target rect + viewport rect and pass it through the same `handle()` path; do not create a parallel dwell implementation.
4. On `visibilitychange` from hidden -> visible, reevaluate geometry so a tab that becomes active can start dwell without waiting for a native threshold crossing.
5. Keep IntersectionObserver responsible for later visibility exits/entries, so scrolling away cancels dwell.
6. Do not add intervals or per-comment polling.
7. Keep cleanup of timers, observer, animation frame, and visibility listener.

## Verification
- Extend the pure observer contract to prove synthetic live geometry uses the same meaningful-coverage calculation.
- Static checks remain green.
- Reload foreground real post with Network instrumentation: one social socket; reader boot; dwell; `universal-chat.search`; source cards; zero `publish` frames; no runtime errors.

## NEXT_ACTION
Rewrite the observer with one-shot geometry kickoff and cleanup, then rerun its focused contracts and the real-post CDP proof.
