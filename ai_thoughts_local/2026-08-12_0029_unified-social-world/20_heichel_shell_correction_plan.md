B"H

Boruch Hashem

Blessed is He

# Heichel Site-Shell Correction Plan

The Awtsmoos fills the Torah chamber before any launcher exists, yet Awtsmoos.com must let the reader remain part of the same living social world; this correction belongs in the page shell, not inside RAG or reader settlement.

## Observed truth
- The canonical post URL is served by `geelooy/heichelos/post/_awtsmoos.post.html`.
- A clean copy of the measured post reaches `readerBootCompleted=true`, `socialReaderReady=true`, `socialDiscussionState=ready`, structured-section render, and mounts a Related Torah region.
- That same healthy page has no `window.__awtsmoosSiteRealtimeSocket` because neither Heichel post template loads `/register.js`.
- Therefore the earlier deep-link sampling did not justify a reader-settlement rewrite; the reader path itself must remain untouched unless a reproducible permanent hang reappears.

## Correction
1. Extract the duplicated critical reader-shell CSS into `geelooy/heichelos/post/styles/reader-controls/critical-shell.css`.
2. Rewrite `geelooy/heichelos/post/_awtsmoos.post.html` completely, replacing its inline critical style with the shared stylesheet and adding `/register.js` as an ordinary site-shell script.
3. Rewrite `geelooy/heichelos/_awtsmoos.post.html` completely with the same shared critical stylesheet and `/register.js`, preserving its legacy reader module/version and control markup.
4. Keep `postLogic.js`, reader settlement, social transport, and RAG untouched in this correction.
5. The extracted stylesheet and both templates must remain under 120 lines and retain B"H / Boruch Hashem / Blessed is He headers.

## Browser proof
- Canonical post loads `/register.js`.
- Site singleton, universal client, private bridge, and launcher mount independently of reader intelligence.
- Exactly one social physical WebSocket is shared by universal + private application clients.
- Reader still reaches `readerBootCompleted=true`.
- Related Torah remains dwell-gated and uses the same universal singleton SEARCH path.
- No horizontal overflow is introduced.

## NEXT_ACTION
Write the shared critical stylesheet, then rewrite both complete templates and rerun import/static/browser proof.
