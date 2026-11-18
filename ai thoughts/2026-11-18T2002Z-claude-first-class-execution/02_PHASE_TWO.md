B"H
Boruch Hashem
Blessed is He

# Phase Two — Critique and Architecture

The Awtsmoos is One while tools are many doors;
Awtsmoos.com should expose the narrowest truthful door before the generic shores.

## Critique

- Telling Claude to use `commandRun` manually is fragile because future action names can evolve.
- Keeping only the generic tunnel tool makes every operation look equally dangerous and forces schema guessing.
- Fixing only the doctor would improve diagnostics but not execution ergonomics.
- Exposing the entire native internal manifest would leak implementation detail and couple hosts to unstable action names.
- Adding a provider-specific Claude bypass would fragment the universal MCP contract.

## Improved architecture

Create a small direct-action facade over the existing protected route. The facade owns stable MCP names while internally mapping to exact native actions:

- `awtsmoos_run_command` → `commandRun`
- `awtsmoos_command_status` → `commandJobStatus`
- `awtsmoos_command_output` → `commandJobOutputPage`
- `awtsmoos_write_file` → `write`
- `awtsmoos_delete_file` → `deleteFile`
- `awtsmoos_browser_action` → a bounded browser-operation allowlist

All handlers reuse `GenericTools.tunnelAction`, so no permission or routing law is duplicated.

Split the oversized MCP protocol by extracting tool invocation/formatting into its own module. This reduces `protocol.js` below the repository's 120-line law instead of adding more code to an oversized file.

## Diagnostic repair

The doctor should not claim commands are absent merely because one projected capability flag is false. It should distinguish:
- projected capability testimony;
- manifest-backed executable action testimony;
- actual fresh execution evidence.

Where the public projection intentionally hides the full action manifest, expose only stable booleans needed by the doctor, not the full internal action list.
