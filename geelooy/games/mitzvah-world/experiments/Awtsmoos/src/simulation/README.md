# B"H
# Headless Gameplay Simulation

This directory runs actual Mitzvah World gameplay authorities in Node.js without a DOM, canvas, screenshot, or WebGL context.

## Real modules reused

- `BootstrapMovementController`
- jump and movement runtime
- `AwtsmoosOctree`
- `AwtsmoosCollisionMover`
- `TriangleCollider`
- `InventoryStore`
- `MinimalMeadowEquipmentRuntime`
- `MinimalMeadowCombat`
- the registered custom player-action system

The canonical `chossid.glb` is read as a real GLB v2 binary. Its JSON chunk supplies actual scene nodes, skin joints, meshes, and imported animation names. Renderer-free scene nodes replace only WebGL transforms.

## CLI

```bash
node experiments/Awtsmoos/src/simulation/runGameplaySimulation.mjs \
	--seconds=120 \
	--speed=600 \
	--step=0.0166666667
```

The job does not sleep. It can advance far faster than real time and prints one JSON snapshot containing clock ratio, model source, imported clips, custom action state, equipment, inventory, collision contacts, combat, enemy health, friendly actors, and bounded event history.

## Programmatic use

```js
const simulation = await GameplaySimulation.create({ modelPath });
simulation.move({ forward: 1 });
simulation.runFor(30);
const evidence = simulation.snapshot();
```

`runFor()` means simulated seconds. `runScaled()` multiplies its input by the configured speed. `runUntil()` advances deterministically until an inspected condition becomes true or a simulated deadline is reached.
