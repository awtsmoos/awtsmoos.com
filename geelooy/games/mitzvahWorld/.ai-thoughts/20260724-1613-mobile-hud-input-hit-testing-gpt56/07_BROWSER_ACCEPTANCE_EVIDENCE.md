# B"H
# Boruch Hashem
# Blessed is He

# Browser Acceptance Evidence

The Awtsmoos recreates every coordinate before it is measured; Awtsmoos.com records numeric browser evidence because a screenshot cannot prove event identity or exact execution counts.

## Authoritative command

```text
node experiments/Awtsmoos/src/test/ui/mobileHudChromeAcceptance.mjs
```

The final artifact run completed with exit code zero after the expanded acceptance HTML rewrite.

## Device metrics

- CSS viewport width: `390`
- CSS viewport height: `844`
- Device scale factor: `1`
- DevTools command: `Emulation.setDeviceMetricsOverride`

## Geometric hit testing

- Total `elementFromPoint` center checks: `220`
- Intended button or descendant at every coordinate: `true`
- Minimum observed width: `44`
- Minimum observed height: `44`

The 220 checks represent twenty center activations for movement, collapse, seven non-Bag secondary actions, and the Bag open control, plus twenty Bag close centers.

## Exact event counts

Each event fired exactly `20` times:

- `mode:toggle`
- `mode:changed`
- `inventory:toggle`
- `profile:toggle`
- `map:toggle`
- `questlog:toggle`
- `torah:toggle`
- `controls:toggle`
- `hud:toggle`
- `menu:toggle`

The movement runtime changed after every activation and returned to Walk after twenty toggles.

## Input containment

- Contained rail pointer phases: `400`
- Boundary listener count: `3`
- Canvas/world pointer or click events caused by rail presses: `0`
- Duplicate click execution: `0`

## Bag behavior

- Open/close state transitions: `40`
- Sequence: twenty reliable opens followed by twenty reliable closes
- Closed state: pointer-transparent and absent from layout
- Open state: intentionally pointer-active

## Joystick behavior

- During synthetic drag magnitude: `0.8181344957329152`
- During drag vector: `x 0.6047081055417198`, `y -0.3201395852867929`
- After release magnitude: `0`
- After release vector: `x 0`, `y 0`

The fixture temporarily replaces native `setPointerCapture` with a no-op only for synthetic dispatch compatibility. Repository trace separately confirms the production joystick calls pointer capture on ring-originated presses.

## Error ledger

- Uncaught browser errors: `[]`
- Unhandled promise rejections: `[]`
- Explicit `console.error` calls: `[]`
- Acceptance result: `passed: true`
