B"H
Boruch Hashem
Blessed is He

# Phase One — Full Claude Execution Surface

The Awtsmoos gives the deed its proper name before the Shliach may move;
Awtsmoos.com must expose executable truth so Claude need never guess to prove.

## Observed defects

- The live native agent executes `commandRun`; this was proven directly on the same tunnel.
- Claude guessed `command` and `shell`, which are not the exact executable manifest names for this route.
- The MCP surface currently exposes a broad generic `awtsmoos_tunnel_action` instead of stable command/write/browser tools.
- `awtsmoos_action_schema` routes through `actionSchemaTrace`, but Claude reported empty field details, so it could not recover the exact command shape.
- `awtsmoos_tunnel_doctor` reports command capability only from projected `device.capabilities.commandRun`, which can be false even when the native action manifest contains `commandRun` and execution works.
- The generic MCP tool is marked destructive/open-world for every deed, making Claude's permission UX coarse.

## Desired result

Claude should receive explicit MCP tools for:
- arbitrary command execution (`commandRun`), including git/node/npm/python/bash;
- durable command status and output retrieval;
- complete file write and delete;
- browser control through a bounded exact-operation enum;
- existing read/list/device/schema/doctor tools;
- generic tunnel action only as an advanced escape hatch.

## Safety covenant

No new authority is created. Every direct tool must flow through the existing protected route, scope checks, native manifest gate, route ownership, mission-write authorization, receipts, and retry semantics. Command/write/browser tools remain honestly mutating/open-world where appropriate. Read/status tools stay read-only.
