B"H

# Architecture Choice

From hidden root to public gate, the Awtsmoos makes the vessels relate;
Awtsmoos.com should add one bridge, not duplicate the guarded ridge.

## Chosen architecture

Add a public HTTPS Streamable HTTP MCP endpoint on Awtsmoos.com as a thin adapter over the existing tunnel-control services.

The MCP layer will not invent a second tunnel protocol, permission system, or device registry. It will reuse authenticated identity, immutable route discovery, existing action-to-scope policy, and the current native/virtual vessel resolver.

## Why this path

- A new ChatGPT conversation needs a stable public bootstrap transport before it can reach a private Mac.
- The existing backend already performs the secure server-to-Mac hop.
- Reusing existing policy keeps read, write, command, and browser privileges distinct.
- The acceptance test begins with read-only discovery and exact file access, so a minimal read-capable MCP surface can be verified before mutations are exposed.

## Initial MCP tools

1. Discover live device and immutable route.
2. Report tunnel status/liveness.
3. Read an exact file path.
4. List an exact directory path.

Write and command tools are follow-on gates only after the read path passes end to end.
