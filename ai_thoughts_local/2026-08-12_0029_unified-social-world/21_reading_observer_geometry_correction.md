B"H

Boruch Hashem

Blessed is He

# Reading Observer Geometry Correction

The Awtsmoos fills an entire Torah river at once, while a browser viewport can reveal only one finite stretch; meaningful reading must therefore measure the visible vessel, not demand that most of a hundred-thousand-pixel article fit into one screen.

## Real browser evidence
After the Heichel shell correction:
- reader boot completed;
- `/register.js` loaded;
- universal + private social clients shared one OPEN site transport;
- exactly one social WebSocket was created;
- launcher rendered `3 online`;
- Related Torah region existed but stayed hidden;
- no SEARCH or PUBLISH frame was sent;
- no runtime errors or overflow occurred.

The exact reading target selected by `PostReadingIntelligence` was:
- tag: `DIV`;
- classes: `awtsmoos-normal-scroll awtsmoos-mobile-scroll`;
- text length: 16,293 characters;
- height: 100,288.5px;
- visible intersection ratio: about 0.00997.

The current `MeaningfulReadingObserver` asks IntersectionObserver for a 0.55 element-intersection threshold. A long article cannot satisfy that threshold even while the viewport is completely filled with its text. The feature therefore never reaches private Torah SEARCH.

## Correction
1. Rewrite `MeaningfulReadingObserver.js` as a whole file.
2. Keep the public API (`dwellMs`, `threshold`, `onMeaningful`) unchanged.
3. Observe with low trigger thresholds so long elements produce callbacks.
4. Compute meaningful visibility as:
   `intersection visible area / min(target area, viewport/root area)`.
   For a short comment, this remains effectively the fraction of the comment visible.
   For a long article, it becomes the fraction of the viewport occupied by the article.
5. Keep tab-visibility cancellation, one-shot completion, timer cancellation, observer disconnect, and listener cleanup.
6. Export the pure coverage helper for a direct geometry contract.

## Verification
- Unit test: a 100,000px article filling a 1,000px viewport qualifies at roughly 1.0 coverage even though native element intersection ratio is ~0.01.
- Unit test: a short 400px comment with only 100px visible reports 0.25 and does not qualify for a 0.65 threshold.
- Existing bounded-context / SEARCH-only tests remain green.
- Real Heichel browser proof must show dwell -> `universal-chat.search` frame -> source cards, zero `publish` frames, one social socket, and safe links.

## NEXT_ACTION
Rewrite the observer and add its pure geometry contract, then rerun static tests and the exact real-post CDP proof.
