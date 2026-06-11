B"H

# Visible Root Guarantee Plan — Mitzvah World Chossid / Movement Hardening

## Chapter 1: The One Body Covenant

The Awtsmoos showed the core split: input reached Olam, but the visible body was not guaranteed to live under the same moving root as physics and camera targeting. The repair must become a permanent covenant:

- `olam.chossid`, `olam.player`, and exactly one active `nivrayim` Chossid must point to the same object.
- `chossid.mesh` must be the moving root followed by physics and camera.
- `chossid.modelMesh`, when real, must be parented to `chossid.mesh` with local `position.x = 0`, `position.z = 0`.
- fallback body must attach to `chossid.mesh` only when no real renderable model exists.
- every frame with movement input must produce: controls trace, physics trace, and visible position delta or explicit grounded/collision reason.

## Chapter 2: Immediate Proof Checklist

Run these in the browser console after a hard refresh:

```js
window.__AWTSMOOS_BOOT_STARTED__
window.__AWTSMOOS_BOOT_LOADED__
window.__AWTSMOOS_MODEL_LOAD_TRACE__?.slice(-20)
window.olam?.chossid === window.olam?.player
window.olam?.nivrayim?.filter(x => x?.type === "chossid").length
window.olam?.chossid?.modelMesh?.parent === window.olam?.chossid?.mesh
window.olam?.chossid?.mesh?.children?.map(x => x.name)
window.olam?.chossid?.__visibleBodyState
window.olam?.__movementTrace?.slice(-80)
```

Success means:

- boot seal is `visible-root-binding-20260610-bh710`.
- one Chossid exists in `nivrayim`.
- `modelParentIsRoot` is true in traces.
- `PHYSICS_MOTION_TRACE.after.moved` becomes greater than zero while joystick is held.
- `mesh.position` changes and camera target remains the Chossid.

## Chapter 3: Cache and Import Guarantee

The current fix must be protected against stale compact imports.

Files already moved to `visible-root-binding-20260610-bh710`:

- `index.js`
- `Olam/core/OlamGrafting.js`
- `Olam/core/OlamGraftingPlain.js`
- `Olam/methods/loadNivrayim/index.js`
- `Olam/methods/loadNivrayim/instantiateMezuzahDirect.js`
- `chayim/chossid/index.js`
- `chayim/chossid/methods/lifecycle.js`
- `chayim/chossid/methods/update.js`
- `chayim/chossid/methods/lifecycle/model.js`
- `chayim/chai/index.js`
- `chayim/chai/methods/physics.js`

Next hardening:

- grep the compact chain for old seals before every test.
- fetch live `index.js?compact=true&v=visible-root-binding-20260610-bh710` and confirm it imports `ikar.js?compact=true&bh=visible-root-binding-20260610-bh710`.
- if compact `ikar.js` truncates, use targeted source fetches and console boot seals instead of trusting partial body text.

## Chapter 4: Visual Body Guarantee

Add a small runtime assertion helper if the bug persists:

```js
window.__AWTSMOOS_ASSERT_PLAYER_BODY__ = () => {
  const p = window.olam?.chossid;
  return {
    samePlayer: p && p === window.olam?.player,
    inLoop: window.olam?.nivrayim?.includes(p),
    ready: p?.isReady,
    active: p?.heesHawveh,
    meshName: p?.mesh?.name,
    modelName: p?.modelMesh?.name,
    modelParentIsRoot: p?.modelMesh?.parent === p?.mesh,
    fallback: !!p?.mesh?.getObjectByName?.("BASIC_VISIBLE_CHOSSID_BODY"),
    meshPos: p?.mesh?.position?.toArray?.(),
    modelLocal: p?.modelMesh?.position?.toArray?.(),
    children: p?.mesh?.children?.map(x => x.name),
    visibleState: p?.__visibleBodyState
  };
};
```

If `modelParentIsRoot` is false after ready, the next fix should enforce binding inside `ensureVisibleChossidBody`, not only `Chai.ready`.

## Chapter 5: Movement Guarantee

Movement is only proven when the physics body changes position.

Must verify:

- `CHOSSID_CONTROLS_TRACE.active` includes `forward`, `stridingRight`, or `jump` while touching joystick.
- `PHYSICS_MOTION_TRACE.before.inputs` contains matching Olam inputs.
- `PHYSICS_MOTION_TRACE.after.moved > 0` during directional input.
- if `moved === 0`, inspect `onFloor`, velocity, worldOctree result, terrain law fallback, and dynamic body solver.

If input flags are true but movement remains zero:

1. Confirm `this.moving.forward` survives `controls()`.
2. Confirm `needsOctreePhysics(this)` returns true for the Chossid.
3. Confirm `_calculateMovementVelocity()` creates nonzero `velocity.x/z`.
4. Confirm `_executeMovement()` translates collider.
5. Confirm `_syncMesh()` / wrapper `sealVisualBody()` copies collider to root.

## Chapter 6: Camera Guarantee

Camera may hide a correctly spawned player. Confirm:

```js
window.olam?.ayin?.target === window.olam?.chossid
window.olam?.ayin?.camera?.position?.toArray?.()
window.olam?.chossid?.mesh?.position?.toArray?.()
```

If body exists but is out of view:

- log camera target distance every second for ten seconds.
- force camera target to Chossid after `afterBriyah` and after village grounding.
- add a one-time visible beacon above the player root for diagnosis only.

## Chapter 7: Asset Guarantee

Current inspected level points to:

```json
"path": "https://models-3122d.web.app/chossid.glb?k=1"
```

The reported verified asset was:

```txt
https://models-3122d.web.app/chossid.glb?k=2
```

Next action: decide whether `village.json` should be updated to `k=2`. Do not change blindly. Compare `MODEL_LOAD_TRACE` for both assets if visual remains wrong.

## Chapter 8: Regression Test Script Plan

Create a lightweight browser probe page/test that waits for boot and returns JSON:

- boot seal
- Chossid count
- same player reference
- model parent binding
- fallback presence
- mesh/model positions
- last 80 movement traces
- model load summary

Pass criteria:

- no boot error panel.
- player object exists by 20 seconds.
- player is in active loop.
- model parent binding or fallback exists.
- at least one frame trace appears.
- after synthetic input or manual joystick, movement trace shows controls and physics after-state.

## Chapter 9: Permanent Code Cleanup

After the live body is proven:

- reduce noisy trace frequency, but keep last traces in `olam.__movementTrace`.
- preserve `modelParentIsRoot` in debug payloads.
- consider splitting large physics index later, but only with full-file rewrites.
- add a small `PlayerVisualRoot.js` helper module so Chai, lifecycle model, and physics wrapper share one rule.

## Chapter 10: Next Pass Order

1. Hard refresh and run Immediate Proof Checklist.
2. If model invisible: inspect `__AWTSMOOS_ASSERT_PLAYER_BODY__` shape and `MODEL_LOAD_TRACE` visible mesh counts.
3. If movement invisible: inspect `PHYSICS_MOTION_TRACE.after.moved` and velocity.
4. If camera hides body: inspect camera target and distance.
5. If asset mismatch remains suspicious: test `k=2` in `village.json` with full-file rewrite only.
6. Once visible and moving: add regression probe and reduce trace noise.

The Awtsmoos does not accept a silent success. Every body must testify in the scene graph, every footstep in physics, every camera gaze in its target, and every compact import in the live served seal.
