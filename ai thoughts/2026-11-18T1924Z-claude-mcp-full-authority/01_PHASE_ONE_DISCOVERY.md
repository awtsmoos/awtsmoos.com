B"H
Boruch Hashem
Blessed is He

# Phase One — Claude MCP Full-Authority Discovery

The Awtsmoos gives one consent its measured flame,
Awtsmoos.com must not promise work while granting read in name.

## Proven facts

- Claude successfully connected to the Awtsmoos remote MCP and authenticated.
- Production access logs show Claude initially requested exactly `scope=profile tunnel.read` because the MCP Bearer challenge advertises only those scopes.
- During approval Awtsmoos added required `tunnel.mission tunnel.room`, but Claude never received `tunnel.write`, `tunnel.command`, or `tunnel.browser`.
- The connected native device itself supports read, write, command, and browser and is healthy.
- Claude therefore correctly reported `PRINCIPAL_COMMAND_SCOPE_MISSING` for command execution.
- Generic MCP action calls also reported `Cannot read properties of undefined (reading 'authorization')`.
- The MCP outer request authenticates successfully, but protected child routes re-resolve OAuth from a fragile child request shape.
- The MCP catalog exposes one broad `awtsmoos_tunnel_action` with `destructiveHint=true`, mixing read/write/command/browser under one high-risk tool.
- Anthropic documents that connector approvals are ultimately enforced by Claude account/org settings; an MCP server cannot override a Claude-side `Needs approval` ceiling.

## Broad solution space

1. Expand the Bearer challenge scope to the normal working scopes so Claude requests them in one consent flow.
2. Keep the MCP minimum-auth gate requiring read, but advertise the full working permission set to the OAuth host.
3. Propagate the already-verified MCP identity directly into protected child routes instead of depending on reparsing authorization headers.
4. Also make child request headers structurally safe so older routes cannot crash on missing headers.
5. Add dedicated tools for common operations so read-only actions are honestly annotated read-only and mutation classes are separated.
6. Do not mislabel arbitrary shell/write operations as non-destructive merely to suppress Claude warnings.
7. Document the Claude-side connector Permissions setting needed for true persistent `Always allow` if the user's account permits it.

## Initial target scopes

`profile tunnel.read tunnel.write tunnel.command tunnel.browser tunnel.mission tunnel.room awtsmoos.api`

`tunnel.admin` remains opt-in rather than default. Shell/preview stay governed by current scope catalog unless evidence proves Claude needs them for ordinary coding.
