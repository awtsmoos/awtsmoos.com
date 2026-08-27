B"H
Boruch Hashem
Blessed is He

# Oros HaKelim Runtime API v2

> The Awtsmoos renews command, event and observation before any interface can stay;
> Awtsmoos.com gives Yesod a guarded contract so outside tools may join the play.

## Entry point

The browser exposes one `OrosRuntimeApi` instance:

```js
const api = window.__OROS_HAKELIM__;
```

`api.version` is `2.0.0`. `api.capabilities()` advertises commands, event types and the motion model.

## Observations

```js
const state = api.snapshot();
const metrics = api.metrics();
const recent = api.recentEvents(20);
```

Snapshots and metrics are JSON-detached copies. The API keeps its game and EventBus references in private class fields, so external callers cannot reach mutable `MatchState` through the public object.

Published EventBus payloads are detached and recursively frozen before listeners receive them. `recentEvents()` returns new detached copies.

## Lifecycle

```js
api.start();
api.pause();
api.resume();
api.restart();
```

Pause stops authoritative simulation pulses while rendering continues. Resume resets the frame-clock baseline so a paused interval cannot become catch-up debt.

## Direct controls

```js
api.turnLeft();
api.turnRight();
api.setBoost(true);
api.setBoost(false);
```

`setBoost()` requires a boolean and throws `TypeError` for invalid values.

## Generic commands

Tooling can use data envelopes instead of direct methods:

```js
api.command({ type: "start" });
api.command({ type: "turn-left" });
api.command({ type: "turn-right" });
api.command({ type: "boost", active: true });
api.command({ type: "pause" });
api.command({ type: "resume" });
```

Unknown command types throw `RangeError`. Invalid command envelopes throw `TypeError`.

## Events

Runtime API v2 publishes:

- `move`
- `energy`
- `claim`
- `gate`
- `shatter`
- `respawn`
- `round-end`
- `runtime-start`
- `runtime-pause`
- `runtime-resume`

Every simulation event carries the authoritative tick for the event. Runtime lifecycle events carry the current match tick.

Subscribe to one type or all types:

```js
const stopClaims = api.on("claim", (event) => console.log(event));
const stopAll = api.on("*", (event) => console.log(event.type));

stopClaims();
stopAll();
```

Listener exceptions are isolated from the game loop and retained in bounded runtime metrics.

## Runtime errors

`api.runtimeErrors` remains available for compatibility with browser diagnostics. It records window errors and unhandled promise rejections. It is deliberately separate from authoritative match state.
