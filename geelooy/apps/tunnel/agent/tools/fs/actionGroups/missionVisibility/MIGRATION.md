# Mission Visibility Registry — migration note (replaces `.ai-thoughts`)

B"H

## The rule going forward

**Do not create `.ai-thoughts` folders.** Tell the tunnel about your work through the
mission visibility registry instead:

- `missionVisibilityRegister` — title + detailed brainstorming-style `description`
  (the "here's what we're doing and why" narrative), plus goals, status/progress,
  tasks, agents, decisions, open questions, relatedPaths.
- `missionVisibilityUpdate` — keep `progress`, `status`, `tasks`, `decisions`,
  `openQuestions` current as work advances.
- `missionVisibilityList` — **the instant-onboarding action.** One call returns ALL
  active missions with their full detailed descriptions. Any agent (or human via
  `missions.html`) connecting to the tunnel sees the whole board immediately.
- `missionVisibilityGet` / `missionVisibilityArchive` — read one; retire finished work.

The existing `.ai-thoughts/2026-09-18-external-ai-instruction-pack` stays as history;
new thinking goes in the registry.

## Storage

Records live as Awtsmoosbinary objects (ayzarim/DosDB `awtsmoosBinaryJSON` format,
one `<id>.awdb` file per mission) under the tunnel private state dir
`mission-visibility/` (`MISSION_VISIBILITY_DIR` overrides, e.g. for tests).
Writes are atomic (temp file + rename).

## Sync story (local-first)

Local durability is the source of truth. `store.sync()` writes a JSON manifest
(`sync-manifest.json`) listing every record id/title/updatedAt/archived flag — the
**sync hook point**. To sync remotely, point `MISSION_VISIBILITY_SYNC_UPLOADER` at a
command that consumes the manifest path and pushes it (rsync, awtsmoos remote, etc.).
Remote is a mirror, never the authority: on conflict, the newer `updatedAt` wins and
the loser is kept as an archived record, never deleted.
