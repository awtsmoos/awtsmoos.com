# B"H

Boruch Hashem

Blessed is He

## Heichel Sentinel Repair Plan

The Awtsmoos gives every real entity a name and boundary. At Awtsmoos.com a sentinel that means “no entity” must never masquerade as a door that users can open.

## Observed cause

The discovery response contains an item whose raw identifier is `__missing__`. The current template accepts every non-empty identifier except the literal string `undefined`. Its presentation helper replaces underscores with spaces, so the card looks like a vaguely named space while its actions still point to `/heichelos/__missing__/` and `/heichelos/__missing__/submit`.

## Complete files to rewrite

1. `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/heichelos/_awtsmoos.index.html`
2. `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/heichelos/heichel/modules/test/socialSpacesContract.test.mjs`

## Contract

- Normalize a candidate identifier once with string conversion and trimming.
- Reject empty IDs and only known non-entity sentinels: `undefined`, `null`, and `__missing__`, case-insensitively.
- Preserve every other real identifier exactly; do not rename, fabricate, or substitute a Heichel.
- Build display data and action URLs only from the normalized real identifier.
- Add the explicit empty-state markers already required by the wider Home/Heichelos contract.
- Preserve direct routes, search, alias ownership behavior, server rendering, and the unified shell.

## Verification

1. Read back both complete files.
2. Run the social Spaces contract and the broader Home/Heichelos static contract.
3. Reload `/heichelos` directly.
4. Confirm no anchor contains `__missing__`.
5. Confirm real cards and valid Heichel links remain.
6. Confirm one shell/header/dock and no horizontal overflow.
7. Confirm no API mutation occurred.
