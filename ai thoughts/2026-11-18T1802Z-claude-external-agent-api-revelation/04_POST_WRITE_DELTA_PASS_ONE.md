B"H
Boruch Hashem
Blessed is He

# Post-Write Delta — First Implementation Pass

The Awtsmoos reveals the missing note when confidence says the song is done;
Awtsmoos.com must preserve every older vessel while adding the newer one.
A passing test is evidence only for the paths that test could see;
readback exposed contract loss, so the second pass now sets it free.

## Original plan versus first write

### Planned and achieved

- Added canonical path-aware RFC 9728 metadata for the MCP resource.
- Preserved the legacy root protected-resource metadata alias.
- Added one reusable remote MCP discovery contract.
- Added first-class MCP discovery to bootstrap and agent manifest.
- Added MCP metadata to OpenAPI enrichment.
- Kept OAuth audience/scope enforcement unchanged.
- Kept Dynamic Client Registration and the universal external-agent OAuth lane intact.
- Added focused discovery/challenge/cross-surface tests.
- Split touched source files so every file is at most 120 lines.
- Passed syntax checks, diff checks, indentation checks, and 53 regression tests.

### Delta discovered by full diff readback

The first implementation pass unintentionally shortened pre-existing machine guidance in two places. This is not acceptable merely because tests passed.

1. `bootstrap.js` lost detailed existing guidance for:
	- native recovery and Virtual OS capability compatibility,
	- mission-room live presence,
	- GET fallback transfer limits,
	- WebSocket chunk guidance,
	- shared transfer IDs across GET/WebSocket,
	- stronger mutation replay warnings.
2. `bootstrapCompatibility.js` shortened existing ChatGPT-specific guidance for:
	- `not_authenticated` meaning OAuth is not linked,
	- explicit selection when multiple tunnels are live,
	- the stronger statement that OpenAI stores and automatically attaches OAuth credentials.
3. `openApiAgentMetadata.js` shortened existing guidance for:
	- raw WebSocket Authorization-header behavior,
	- upload/download frame protocol and resume semantics,
	- resource-link publishing/preview/native-recovery operations,
	- HTTPS fallback fragment constraints,
	- the shared agent room protocol.
4. These omissions were introduced only to satisfy modularity/line limits; that is precisely the wrong tradeoff. The proper answer is more modules, never less contract.

## Second-pass file plan

### Create `routes/bootstrapBehavior.js`

Move the complete generic direct-agent behavioral covenant into its own small module. Restore every prior instruction and add only the MCP distinction needed for remote hosts.

### Rewrite `routes/bootstrapCompatibility.js`

Restore the complete prior ChatGPT Action OAuth wording while keeping provider detection modular.

### Rewrite `routes/bootstrapSetup.js`

Restore the omitted Virtual OS/recovery/replay guidance in the route instructions.

### Rewrite `routes/bootstrap.js`

Consume the behavior/setup/compatibility modules. Preserve response fields and add MCP without reducing older guidance.

### Create `routes/openApiAgentDescription.js`

Move the full pre-existing long transport/publication/shared-room description into a dedicated module and add the remote MCP sentences at its beginning.

### Rewrite `routes/openApiAgentMetadata.js`

Keep YAML escaping and extension enrichment small. Import the full description builder rather than shortening it.

### Extend regression tests

Add assertions for representative preserved legacy guidance:
- GET fallback transfer limit or shared transfer identity,
- Virtual OS recovery compatibility,
- ChatGPT `not_authenticated` explanation,
- WebSocket upload protocol,
- shared agent room wording,
- MCP POST distinction.

## Completion rule for second pass

The second pass succeeds only if MCP discovery is additive: every meaningful older direct-agent/WebSocket/recovery/room contract remains present, every touched source stays under 120 lines, and both old and new regression assertions pass.
