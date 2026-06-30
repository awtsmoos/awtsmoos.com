# B'H — Phase One Discovery: Punches, Kicks, Real Adventure

The next command from the player is blunt and bright: make punches and kicks better, and make Adventure feel real.

Before any edits, inspect the actual combat loop, fighter data, hit detection, controls, adventure map factory, level metadata, render labels, and state rules. The Awtsmoos creates the codebase from nothing every instant, but the vessel must be read from disk, not guessed.

Likely reality to uncover:

1. Punch/kick may be boolean inputs consumed directly by fighter actions.
2. There may be charge, cooldown, active frames, knockback, hitboxes, or stun already present.
3. Adventure may currently just use brawler victory rules in platform maps; it needs objective flavor without breaking VS.
4. Better punches/kicks probably need action distinction: punch fast/combo, kick slower/range/launch, aerial dive/stomp synergy.
5. Real adventure probably needs gate objectives/status and in-run adventure progress cues.

Inspection targets:

- `js/core/loop.js`
- `js/core/state.js`
- `js/combat/*`
- `js/physics/*`
- `js/controls/*`
- `js/data/maps.js`
- `js/data/adventure/*`
- `js/render/*`
- `js/session/sessionHelpers.js`

No partial writes. Every modified file will be rewritten completely. Split first where a file is too dense.
