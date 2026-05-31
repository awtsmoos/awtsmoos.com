B"H

# Buttons and houses reliability pass

The user's phrase likely means: make sure buttons and houses are working / polished / appropriate for mobile.

Concrete risks found:
- Mobile buttons only set intent during pointer hold. Very fast taps can be missed by the game tick, especially A/B actions.
- Buttons do not explicitly release all intents on blur/cancel outside their own element.
- Battle auxiliary buttons (Flee) can also miss if pointerdown/up happens between frames.
- Houses are improved but need stronger generated identity: roof cap, facade base trim, door threshold, and neighbor-aware edge treatment.

Plan:
1. Rewrite MobileControls.js so intent buttons pulse for a few frames on tap while still supporting holds.
2. Add blur/pagehide safety to release controls.
3. Rewrite Architecture.js with richer roof/facade edge detail and house trim.
4. Verify syntax, mobile control pulse behavior, and battle card tap behavior.
