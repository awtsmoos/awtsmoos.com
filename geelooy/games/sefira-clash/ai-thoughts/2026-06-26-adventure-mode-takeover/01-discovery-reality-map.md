# B"H — Discovery Reality Map

The user asks for a full Adventure Mode takeover of `geelooy/games/sefira-clash`. The real tunnel root is `/storage/emulated/0/Documents/git/awtsmoos.com`, so the actual project is `geelooy/games/sefira-clash`.

Observed facts:

- `js/data/adventure/levels/level01.js` through `level50.js` already exist.
- `js/data/adventure/adventureLevels.js` imports exactly those fifty files and exports `ADVENTURE_MAPS`.
- `js/data/maps/index.js` imports `ADVENTURE_MAPS` while preserving VS `MAPS`.
- `js/main.js` already branches VS and Adventure.
- Current Adventure levels are very compact row maps. They pass shallow uniqueness but lack full campaign persistence and display details.

Risks:

- Fifty files existing is not the same as a Super Smash Bros Adventure-like campaign.
- `sessionHelpers.js` only stores cosmetic profile, no unlocked levels, best times, stars, or hidden collectible records.
- `menuViews.js` displays difficulty and bot count but not locked/completed/best-time/collectible stars.
- `main.js` can launch any Adventure map immediately; there is no unlock progression gate.

Immediate plan:

1. Add durable Adventure profile helpers.
2. Update `main.js` to track run start time, unlock next stages, and record completion.
3. Update `menuViews.js` to render completion, locks, best time, stars, and hidden Spark count.
4. Keep VS flow untouched except imports and shared menu rendering.
5. Verify registry, syntax, and behavior through Node import audits.
