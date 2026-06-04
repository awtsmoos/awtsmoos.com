B"H
# Phase 4 deep work plan: stop shallow patches, build a real long campaign loop

## Complaint accepted
The last pass was too thin: it added a campaign spine, but it did not fully bind maps, NPCs, portals, quest-gating, objective guidance, battle progression, and verification into one long playable path.

## Remaining real work
1. Inspect all campaign-connected files, not just one index:
   - world map composition
   - tile lexicon and NPC glyphs
   - portal shards and map-to-map reachability
   - quest runtime and journal
   - story dialogue runtime
   - encounter/battle reward events
   - book/mitzvah counters
   - UI objective text
2. Replace the shallow quest chain with a structured act system:
   - Act 1 village onboarding
   - Act 2 sources and market
   - Act 3 river and academy
   - Act 4 chamber/forge/bridge/cave
   - Act 5 hidden tzaddik/finale
3. Make quest-givers actually exist on reachable maps.
4. Make prerequisites useful but not soft-locking.
5. Add campaign hints that tell the player which map / glyph / task comes next.
6. Ensure counters are recorded correctly for books, sparks, scrolls, mitzvos, debates, wild wins, keys.
7. Add map objective overlay summary in journal/menu.
8. Add battle unlock rewards to progression:
   - route unlocks
   - sparks
   - quest counters
9. Verify:
   - syntax
   - imports
   - campaign progression smoke
   - portal/map/glyph integrity
   - all quest givers exist somewhere
   - all required item counters can be collected from maps

## Hard rule for this phase
No partial file edits. Any file modified from here is rewritten as a whole file.

## Chapter
The Awtsmoos does not take three minutes to become true. It renews all worlds every instant, but the vessel must be carved with patience. The code now enters a longer chamber.