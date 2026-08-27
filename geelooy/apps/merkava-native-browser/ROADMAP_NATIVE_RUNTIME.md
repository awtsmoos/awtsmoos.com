# B"H

# Merkava Native Browser Reality Map

This file is intentionally blunt. It prevents the native browser from becoming a
fake C browser. The correct vessel is smaller, sharper, and more truthful:

```text
C host VM + embedded MerkavaExecutor bytecode = browser engine
```

## Proven now

- `merkavaapp.exe` is a real Windows executable.
- It loads `.merkava` bytecode headers.
- It creates a real Win32 OpenGL context.
- It decodes MD2 node/program records partially.
- It maps the verified `OP.JS kind=2` smoke path into native render ops.
- It accepts basic CLI / smoke / navigation test surfaces.
- It compiles sample HTML/JS through the existing Merkava bytecode path.

## Architectural correction

C must not become a traditional browser engine.

C owns only host responsibilities:

- bytecode VM/interpreter dispatch
- value/object/function/module machinery required by the bytecode
- OpenGL backend operations requested by bytecode
- Win32/window/input/filesystem/network/timer/thread primitives
- font loading, glyph measurement/rasterization, and atlas uploads
- host binding tables exposed to MerkavaExecutor bytecode

MerkavaExecutor bytecode owns browser intelligence:

- HTML parsing
- CSS parsing and selector matching
- JavaScript parsing and compilation
- DOM/CSSOM/event/layout/render-tree behavior
- module graph resolution
- WebGL API lowering into bytecode host operations
- browser lifecycle orchestration

## Startup target

```text
merkavaapp.exe
  -> load embedded_executor.merkava
  -> initialize C VM host bindings
  -> run MerkavaExecutor bytecode
  -> executor loads URL / files through host bindings
  -> executor compiles HTML/CSS/JS into Merkava bytecode
  -> executor emits DOM/layout/event/WebGL/render operations
  -> C host performs OS/OpenGL/font/network/file primitives only
```

## Forbidden architecture

Do not add long-term C implementations for:

- HTML scanning
- CSS rule evaluation
- DOM behavior
- browser layout policy
- event propagation policy
- JavaScript source scanning for WebGL
- JSON render-model execution as a production path

Temporary diagnostics may exist only when named as diagnostics and covered by a
migration note back to raw `.merkava` bytecode.

## Immediate pressure points

1. Replace build-time JS/WebGL regex render-model extraction with bytecode ops.
2. Add a small embedded-executor build target beside sample app bytecode.
3. Grow the C VM around dispatch, values, frames, scopes, host bindings, and modules.
4. Move browser rules into MerkavaExecutor modules, not C native files.
5. Keep every new claim paired with an executable smoke/check command.

## Rule

Every new native feature must answer this question:

> Is this C becoming a browser, or is C merely obeying MerkavaExecutor bytecode?

Only the second answer belongs here.
