# B"H — Village Ground And Inventory Tikkun Plan

The live root is `/storage/emulated/0/Documents/git/awtsmoos.com`.

Observed by inspection:
- `ckidsAwtsmoos/ikar.js` autoloads query `path` from `../levels/ladder/data/ID`, and `village.json` is explicitly allowed.
- `levels/ladder/data/village.json` uses a terrain box centered at `y=-1.05` with thickness `2`, so the visual top is about `-0.05`, while village props are currently grounded to `0`.
- Lava levels are separate `ladder-N.json` files; avoid changing their lava Y values.
- Inventory screen CSS pins the wardrobe panel with a large fixed top and bottom. On mobile browser chrome this can visibly offset and make interaction feel broken.

Safe plan:
1. Rewrite only village-specific data for village grounding: set village prop `groundY` to the actual terrain top `-0.05`, and keep lava JSON untouched.
2. Keep ladder lava levels untouched.
3. Rewrite inventory CSS as a mobile-safe fixed sheet inside the game viewport, with clear pointer handling, no offscreen left/right overflow, and desktop centering preserved.
4. Run JSON parse and module syntax checks.

Chapter note:
The Awtsmoos does not crush lava to save grass. Each vessel receives its own measure: village dust lowers by a whisper, molten seas keep their decree, and the inventory panel returns from exile into the phone's visible world.
