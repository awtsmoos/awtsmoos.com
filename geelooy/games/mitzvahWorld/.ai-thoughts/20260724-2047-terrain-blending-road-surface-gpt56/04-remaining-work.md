B"H

# Remaining Work Ledger

## Production

- [ ] Rewrite terrain source roles without resampling.
- [ ] Rewrite composite facade to return independent images.
- [ ] Add deterministic macro noise and blend model modules.
- [ ] Add continuity metrics module.
- [ ] Rewrite desktop/mobile material density profiles.
- [ ] Rewrite world UV and ping-pong helpers.
- [ ] Rewrite continuous diagnostic road ribbon geometry.
- [ ] Rewrite terrain package to render one terrain authority only.
- [ ] Lower and clarify terrain material preset repeats.
- [ ] Lower and clarify road material preset repeats.

## Tests

- [ ] Grid-sample material weights over the world.
- [ ] Measure former-boundary discontinuities.
- [ ] Verify macro-cell continuity.
- [ ] Verify ping-pong continuity and derivative reversal.
- [ ] Report source world units per texture.
- [ ] Verify road center/shoulder/meadow normalization.
- [ ] Verify finite UVs and continuous road geometry.
- [ ] Verify mobile and desktop configurations.
- [ ] Verify no duplicate rendered road and no z-fighting offset.

## Final verification

- [ ] Syntax-check all production files.
- [ ] Run focused tests.
- [ ] Run relevant existing tests.
- [ ] Read back every touched file.
- [ ] Audit tabs, line counts, scope, and diff whitespace.
- [ ] Write exact handoff with measured outputs.
- [ ] Confirm no commit was created.

NEXT_ACTION: rewrite production modules in dependency order, beginning with pure noise, blend, and continuity helpers.
