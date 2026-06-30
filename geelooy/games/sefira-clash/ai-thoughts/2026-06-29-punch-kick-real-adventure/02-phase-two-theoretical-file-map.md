# B'H — Phase Two Theoretical File Map

Possible files to touch after reading:

- Combat resolution module if it owns attack timing and hitboxes.
- Fighter state/action module if punch/kick flags are applied there.
- Input reader if tap/hold semantics are too crude.
- Adventure session/progress module if clear rules need more objective metadata.
- Renderer/HUD module if Adventure needs visible objective text.
- Adventure factory if levels need exit/objective metadata attached to maps.
- CSS/HTML only if controls need additional labels or action affordance.

Potential split vessels:

- `js/combat/attackProfiles.js` for punch/kick stats.
- `js/combat/attackWindows.js` for active/recovery frames.
- `js/combat/adventureObjectives.js` for adventure-specific status.
- `js/render/adventureHud.js` if HUD becomes too crowded.

Design aims:

1. Punch: fast jab, short recovery, can combo, lower knockback.
2. Kick: longer reach, stronger launch, more recovery.
3. Charged release: held attack becomes stronger and visibly meaningful.
4. Air/down synergy: dive/stomp should make adventure traversal and enemy defeat feel platformer-like.
5. Adventure: show objective and gate identity; clearing must feel like progressing through a campaign.
