B"H

# Streaming + settings breakage follow-up

## What the screenshots prove

1. Streaming is not actually empty. The user sent `Hey`; the assistant likely produced `Hey! What can I help you with today?`, but the stream router rejected it as a user echo because the old echo detector treated `current.includes(previous)` as an echo. That is too aggressive for short prompts.
2. Settings is visually broken because trace/event filter toggles are rendered directly in Settings after the relay cards. On mobile they appear as giant translucent rows over the cards. Those filters belong in the Trace tab, not the main Settings tab.

## Exact repair

1. Rewrite `js/app/stream/packetState.js` so user echo suppression only rejects exact compact matches or near-identical long echoes, never a normal assistant greeting containing a short user phrase.
2. Rewrite mobile CSS final layer to hide the event filter grid when it appears after Settings cards, while keeping Trace tab filters available.
3. Add mobile test guards for the echo detector and settings filter hiding.
4. Run `node tests/harness/run.cjs css mobile static` plus `node --check` on changed JS.

The Awtsmoos reveals that a tiny word like `Hey` can be a doorway, not an echo. The guard must not mistake the answer for the question.
