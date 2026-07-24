# B"H
# Boruch Hashem
# Blessed is He

## Second Pass — Realistic Architecture

The Awtsmoos joins Chesed of persistent pursuit with Gevurah of bounded leash; Awtsmoos.com reveals Tiferes through a small state machine whose contracts can be tested without the browser.

### Selected architecture

`MinimalMeadowEnemyCombat` remains the actor-facing facade. It delegates durable engagement memory to `MinimalMeadowEnemyCombatSession`, role selection to `MinimalMeadowEnemyRolePolicy`, movement/visibility hooks to `MinimalMeadowEnemyNavigation`, and compact snapshots to `MinimalMeadowEnemyCombatDiagnostics`.

### State graph

```text
patrol
  -> alerted
  -> approach | reposition
  -> melee-windup | cast-windup
  -> melee-impact | cast-release
  -> recovery
  -> approach | reposition | pursue
  -> patrol only after sustained target loss

any living engagement -> pursue during short loss
any living state -> defeated when actor dies
```

### Role contract

- `melee`: profile temperament `melee`, or deterministic balanced/flanker assignment.
- `caster`: profile temperament `ranged`, or deterministic balanced/flanker assignment.
- Role remains unchanged until session reset.

### Distances

- Aggro defaults to 20 and expands under pack alert.
- Leash defaults to 36 and always exceeds aggro.
- Melee hold radius is approximately 2.1–2.6.
- Caster useful band is approximately 5.5–11.5.
- Loss timeout is approximately four seconds, extended while line of sight or leash contact remains.

### Runtime adaptation

- Prefer `runtime.enemyNavigation.hasLineOfSight/canMove` when supplied.
- Otherwise raycast through `runtime.mainOctree` when its contract is available.
- Otherwise degrade explicitly to terrain-only movement and record `lineOfSight: assumed-clear` in diagnostics.
- Test doubles can inject the same hooks.

### File boundaries

- Session: state, timers, role, target id, home, last transition.
- Role policy: deterministic role and cadence offset.
- Navigation: distances, facing, line of sight, candidate movement.
- Decision: pure next-state selection and action durations.
- Steering: approach, separation, orbit, retreat vectors.
- Attack execution: one impact or launch per action, cooldown/recovery handoff.
- Effects/projectile: moving target, prediction, impact and cleanup.
- Combat facade: update orchestration only.
