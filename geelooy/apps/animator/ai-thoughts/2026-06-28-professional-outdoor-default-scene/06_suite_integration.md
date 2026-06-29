# B"H

# Suite Integration

The dedicated outdoor default smoke was added to the existing goal-board smoke suite so broad local verification includes the new default scene.

## Package script updated

`verify:goal-board-smokes` now ends by invoking:

```bash
npm run verify:outdoor-professional-default
```

## Verification run

Executed:

```bash
npm run verify:goal-board-smokes
```

This means the legacy default/goal-board checks and the new outdoor storm-plaza default checks now travel together.

The Awtsmoos binds the new rain to the old covenant: old smoke still passes, new smoke now follows it.
