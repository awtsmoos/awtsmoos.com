# B"H — safeguards/

Server safeguards program (user order 2026-10-20: "do it all").
Born from the 2026-10-20 flap: one directory sitting where a file
was expected threw EISDIR, busted the grouped cache, forced a
197 MB rescan, and flapped the whole site every ~2 minutes.

Prime directive for everything in this directory:

> ONE BAD RECORD DEGRADES ONE READ. IT NEVER THROWS, NEVER
> RESCANS, NEVER TAKES THE SITE WITH IT.

## Modules

| File | Role |
| --- | --- |
| `safeguardState.js` | State-dir + append-only line-log primitives. No JSON state files (user law); writes never throw. |
| `poisonQuarantine.js` | Per-path error counts; a path with 2+ errors is quarantined and skipped without being read. Persists as line logs in the state dir. |
| `safeRecordRead.js` | The poison-proof read helper. Wrap any stored-record read: fallback on error, shape validation, quarantine-aware. |
| `fullscanWatch.js` | Full-scan incident counter. Every whole-shard scan logs `[FULLSCAN-INCIDENT]` + one line in `state/fullscan-incidents.log`; serves `fullScansLastHour()` to the pulse endpoint. |
| `shapeAudit.js` | Standalone audit (`nice -n 19 node shapeAudit.js`): finds entries whose file-vs-dir shape mismatches reader expectations before a reader trips on them. Report in `state/shape-audit.log`. |
| `yieldEvery.js` | Cooperative time-budget yield helper for long loops (Phase 3). First applied site: the backlink grouping pass. |
| `readShed.js` | Read-side shed verdict (Phase 3): circuit/heap/OS-RAM sensors only — never the import-busy check. Heavy reads fail fast with 503 before heavy work; see `routes/packed/README-safeguards.md`. |
| `pulseRoute.js` | Payload for `GET /api/social/health/pulse` (Phase 4, mounted by `_awtsmoos.health.js`): loop lag p95, heap MB, OS free MB, disk free GB, scans/hour, uptime. |
| `resourceAlarm.js` | 5-minute disk/RAM tripwire (Phase 4): disk <8 GB free or OS free <150 MB → line in `state/alarms.log` + journal `[ALARM]`. Started at boot beside the loop monitor; also lazily by the pulse route. |

## State dir

`/mnt/HC_Volume_102267213/dayuhChadash/socialPacked/state/`
(env override: `AWTSMOOS_SAFEGUARD_STATE`). Files:

- `poison-counts.log` — `<epochMs>\t<count>\t<errCode>\t<path>`
- `poison-quarantine.log` — `<epochMs>\t<path>`
- `fullscan-incidents.log` — `<epochMs>\t<kind>\t<caller>`
- `shape-audit.log` — audit report sections
- `alarms.log` — (Phase 4) disk/RAM alarm lines

## AI safeguard rules for this directory

1. Nothing here may throw into a request path. Catch, log, degrade.
2. No synchronous I/O in request-path modules (scripts excepted).
3. No JSON state files, ever. Append-only text lines only.
4. Every module stays ≤120 lines with the 3-line B"H header, tab
   indentation, and JSDoc — the tunnel guard enforces it on write.
5. A full scan of any shard is an incident by definition. If you
   add one, wire `fullscanWatch.noteFullScan()` at its entry.
