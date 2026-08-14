B"H

Boruch Hashem

Blessed is He

# RAG Correction Evidence

The Awtsmoos contains every source without delay, while Awtsmoos.com must reveal finite Torah search through vessels that actually return; this evidence records the measured before-and-after rather than replacing a failure with confidence.

## Correction implemented
- Universal realtime library search no longer invokes the unscoped all-lane library path.
- `sourceSearchPlan.js` searches `meluket` and `sefer-hasichos` first through named lanes.
- If those lanes produce at least eight hits, the two multipart mega-corpora are never opened.
- Sparse fast results may awaken `sichos-kodesh` and `likkutei-sichos`, but only through deterministic three-part samples with explicit row/time budgets.
- `textSearch.js` gained opt-in part/row/time budgeting; callers that supply no budget still search every published part exactly as before.
- `strategy.js` only forwards those optional text budgets.
- Public source-session validation, source selection, publication, transport, and protocol names were untouched.

## Static and direct contracts
PASS:
- correction files all at or below 120 lines;
- `node --check` on source and new tests;
- tab indentation;
- targeted `git diff --check`;
- staged source-search plan contract;
- deterministic opt-in multipart budget contract;
- pre-existing universal corpus timeout contract.

## Measured before/after
Before correction, the exact real-DB `searchTorahSources("Moshiach redemption")` call produced no result before a 45-second worker kill and left expensive cleanup work.

After correction, the exact same gateway call against `/Users/awtsmoos/Documents/awtsmoos/dayuhChadash` returned:
- success: true;
- elapsed: 7,859 ms;
- 20 server-issued library source cards;
- first result: `מאמר ואתה תצוה תשמ"א` / `Meluket English Translation Comments`;
- safe same-origin Heichel URL.

The benchmark process family was absent immediately afterward, proving the call did not leave lingering child work.

## Regression evidence
The full existing expanded 16-contract social suite passed again after the correction:
- browser import closure;
- public index concurrency;
- public history pagination;
- modern history admission;
- browser older-history feed;
- activity capture preferences;
- comment meaningful activity;
- shared realtime lifecycle;
- dedicated reconnect status;
- Torah corpus timeout;
- public Torah security;
- presence;
- persistence;
- private consent;
- private groups;
- request dedupe.

## Live server evidence
A single long-lived authoritative process was started with Mail disabled for isolation:
- PID: 93546;
- command: `node index.js`;
- PID 93546 owned `*:8080 (LISTEN)`;
- `/apps/universal-chat/` returned HTTP 200 with 545 bytes.

The hardened `realtime.integration.test.js` then completed with exit code 0 in about 23.6 seconds against that exact process. The test itself exercises:
- multiple real WebSocket clients;
- relative owned presence changes without assuming an empty server;
- real Torah search;
- server-issued source selection;
- source-only public publication;
- cross-client broadcast;
- site/channel history.

## Remaining gate
Browser/CDP proof remains: flagship DOM/runtime identity, responsive geometry at all requested widths, sign-in gating, one physical transport in the browser, reconnect state, MitzvahWorld inheritance, sitewide launcher, and real Heichel Related Torah behavior.

## NEXT_ACTION
Drive the already-running Chrome directly through CDP port 9222, because the tunnel Chrome wrapper is intermittently rejecting a valid registered tunnel while CDP itself remains available.
