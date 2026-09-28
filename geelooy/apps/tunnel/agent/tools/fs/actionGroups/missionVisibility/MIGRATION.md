B"H

# Mission Visibility Registry — tunnel-native three-pass planning

## The rule going forward

The tunnel mission registry is the coordination source of truth. Local `ai_thoughts` or `.ai-thoughts` folders may exist as archival mirrors, but agents must not rely on them for shared situational awareness.

At the beginning of substantial work:

1. Use `missionVisibilityRegister` with a detailed operational description. Include the canonical `missionId` whenever a real mission room exists.
2. After planning phase one, call `missionVisibilityPlanningPass` with `pass: 1` and a bounded operational plan artifact.
3. After planning phase two, call the same action with `pass: 2`.
4. After planning phase three, call it with `pass: 3`.
5. Keep `progress`, `status`, tasks, decisions, and open questions current with `missionVisibilityUpdate`.

A repeated pass number replaces that slot instead of creating an unbounded diary. The three passes are coordination artifacts, not hidden model reasoning.

## Instant onboarding

`missionVisibilityList` returns every active visibility record with its detailed description, canonical mission ID when known, and `planningProgress` showing how many of the three planning passes are present.

Tunnel Control merges these records into canonical mission rooms. Canonical rooms remain authoritative for agents, heartbeats, claims, inboxes, and human-to-agent messaging. Open a mission in Tunnel Control to message any live agent through the existing `missionAgentMessage` or website-agent equivalent.

Visibility records without a canonical `missionId` remain visible but are not falsely presented as live messageable rooms.

## Storage

Records live as Awtsmoosbinary objects using `ayzarim/DosDB/awtsmoosBinaryJSON`, one `<id>.awdb` per record under the tunnel private-state `mission-visibility/` directory. `MISSION_VISIBILITY_DIR` overrides the directory for tests.

Installed tunnel runtimes resolve the Awtsmoosbinary implementation through the active project root supplied by the action context; the runtime itself does not need to contain the repository's `ayzarim` tree.

Writes use temp-file plus rename. `sync()` emits a compact local-first manifest for optional remote mirroring. Local durable state remains authoritative unless a future explicit synchronization policy says otherwise.

## Legacy folders

Historical planning folders remain valuable evidence and must not be deleted. New agents may import or summarize them into the tunnel registry, but future coordination should be visible through the tunnel from the moment work begins.
