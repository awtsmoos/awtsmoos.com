B"H

# Awtsmoos Tunnel and Production Stability — Live Repair Report
**Date:** October 19, 2026 (New York time)
**Target devices:** `awt-awtsmoos-2184` on the Mac and `awt-root-73967` on Hetzner
**Site:** `/mnt/HC_Volume_102267213/git/awtsmoos.com`
**Mac Git checkout:** `/Users/awtsmoos/work/awtsmoos.com`

## Scope and evidence classifications
This report distinguishes source repairs, published artifacts, installed native clients, verified local execution, authenticated WebSocket registration, and unverified remote-request execution. HTTP 200 and a heartbeat alone never establish command acceptance or completion.

## Confirmed production root cause — fixed and deployed
- The production Node.js event loop was pinned near one CPU core (~98% utilization), while local requests timed out at four seconds.
- Tracing documented >40,000 `statx` calls in about three seconds.
- `geelooy/api/social/helper/routes/packed/postImportRoutes.js` invoked synchronous `readdirSync` and `statSync` for every old post-import job during **each new checkpoint**.
- There were 24,810 job-state files (~102 MB); this repeated traversal blocked normal HTTP and control requests.
- Commit `12344b2a4`: eliminated per-checkpoint synchronous history scan and introduced asynchronous, infrequent retention cleanup in `postImportJobStateRetention.js`. Two regression tests passed on Mac and Linux.
- Production deployed with hash comparison, original-file backup, controlled service restart and rollback readiness; no historical import jobs were deleted.
- Nginx admission now limits new post-import starts globally to 6/min with 429 rejection, while preserving status polling. Temporary 503 admission gates were restored after controlled restarts.
- After repair, 30/30 homepage calls: p50 21.99ms, p95 33.3ms, p99 171.77ms; 30/30 tunnel-control calls: p50 6.32ms, p95 9.55ms, p99 10.12ms; Node CPU sample averaged 2%. These are finite measurement windows, not service-level guarantees.

## Tunnel source, public release and native installations — verified
- Manifest v1.0.687 includes previously omitted `mailbox-store-id.js`, `merkavaParserSmoke.js`, `merkavaParserSources.js`. Release guard, 14/14 selected release/recovery tests, ZIP closure and startup probe passed.
- Commit `3b5a9a33440ec2642bbfcdb3ca932f697940d043`: Windows installer now downloads the allowed `/api/tunnel/install/manifest.txt` endpoint rather than forbidden static manifest and checks ZIP SHA-256, size, and matching manifest identity before extraction. Windows contract test passed; no Windows machine was tested.
- Canonical published ZIP: v1.0.687, 3,080 entries, 10,526,486 bytes, SHA-256 `fe890db8db804cdb629ff8c2066bcd5061b8f7f5150f8567f1cc8e9783e1178c`.
- Manifest SHA-256: `28cb12ab2883179ac0ec903a409f197bf8e50065af43e5c0847fd1b4d79b7495`.
- Prebuilt descriptor, manifest, ZIP, and Windows installer bytes were deployed to Hetzner with previous cache/manifest/Windows scripts preserved under `/root/awtsmoos-stability-20261019/tunnel-release-v1.0.687/rollback/`.
- Mac registered and installed v1.0.687, preserved exact name `awt-awtsmoos-2184`, runtime source SHA matches verified candidate. Six trivial real local commands succeeded with the exact expected stdout and exit code zero in 12–18ms; earlier five succeeded in 12–144ms.
- Linux registered and installed v1.0.687, preserved exact name `awt-root-73967`; six real local commands succeeded in 10–22ms. Both guarded installers completed successfully, with existing identity and previous runtime retained for rollback.
- Mac live Merkava `/fs` action `merkavaParserSmoke` returned a real `merkava-parser-smoke` result for two valid CommonJS/ESM sources and explicitly failed invalid syntax. No longer a generic unsupported-success report.
- Planned server restart yielded WebSocket 1012 on each agent; both subsequently re-registered without renewed account pairing.
- Mac logs showed several accepted-registration ACK records on **one reopened socket** after the last server restart, but only one initial WebSocket-open event and no corresponding repeated socket-close events within that checked window. These ACK records cannot be counted as independent successful socket reconnects without further server-side ACK correlation. Current transport remained registered.

## Production event-loop safety guard — deployed
- The HTTP ZIP publisher previously could synchronously rebuild the entire tunnel runtime if its cache was missing or corrupted. This could block all ordinary website/relay requests.
- Commit `51292e5516e7336638e6f23b404a96bae16ce94c` makes production publishing fail fast and truthfully with `tunnel_prebuilt_bundle_missing_or_invalid` rather than triggering an inline ZIP build. Offline explicit preflight builds still work.
- Seven focused tests passed; missing-cache test returned in ~138ms, cached-hit in ~111ms; source copied to production with original backup under `/root/awtsmoos-stability-20261019/tunnel-bundle-fast-fail/zipBundle.before.js`. A controlled site restart loaded new file hash `ce24f2d63d414e5e2465519fadd44e6ef03d9944750f06b702b20079dd9ea70f`.
- After activation, public bundle descriptor still returned `ok:true`, v1.0.687 and correct SHA/source; the homepage and control API returned HTTP 200. Independent WebSocket guardian remained active.

## Retired useless legacy requests without losing queue
- `simple-tunnel-agent.service` repeatedly polled a server endpoint returning HTTP 503 / `simple_tunnel_not_configured`. Its old queue included 2 pending historical records and 43 completed results.
- Preserved queue and unit under `/root/awtsmoos-stability-20261019/legacy-poller/` and disabled/stopped only this obsolete service. **Never replayed** pending mutations and did not disable the modern `awtsmoos-tunnel-guardian.service`.
- Both modern tunnel clients still registered after stopping the unusable polling bridge.

## Explicit limitations / unresolved risk
- Authenticated hosted client → HTTP control API → account/tunnel owner → actual WebSocket dispatch → Mac/Linux execution → terminal result **has not been demonstrated in one measured transaction**; the native local HTTP execution and actual server registration were proven separately. Do not claim exactly-once remote mutation guarantees have been exercised in production.
- Mac connection-state reports registered, while `/readyz.commandExecution` may still be `not_probed`, which is honest about its own probe boundary. Local command proof is independent.
- The Mac repeatedly logged accepted `TUNNEL_ACK` messages after the last server restart on a single socket. No corresponding repeated close/reopen was observed; exact cause of duplicate registration acknowledgements remains unproven.
- Existing disabled/broken `awtsmoos-emergency-tunnel.service` has been failed since October 2 and points at missing legacy `.emergency-tunnel-direct.js` files. Its separate rescue path is not restored; the **independent guardian** and modern WS/port 47475 remain active.
- The old temporary test launcher PID10232 uses a distinct fixture tunnel name `awt-transaction-rollback-test`, not the primary Mac tunnel. It was not forcibly killed or relabeled.
- Disk usage remains high (previously root ~86%, volume ~89%); no wholesale data deletion occurred.
- No Windows actual install, in-flight mutation fault injection, remote p95/p99 dispatch report, or long-duration soak test is represented as complete.

## Rollback and exact pathways
- Production original post importer: `/root/awtsmoos-stability-20261019/postImportRoutes.js.before-stability-repair`.
- Production original ZIP publisher: `/root/awtsmoos-stability-20261019/tunnel-bundle-fast-fail/zipBundle.before.js`.
- Published tunnel previous ZIP/manifest/Windows assets: `/root/awtsmoos-stability-20261019/tunnel-release-v1.0.687/rollback/`.
- Legacy poller queue, unit, rollback instructions: `/root/awtsmoos-stability-20261019/legacy-poller/`.
- Mac preserved predecessor: official transactional installer backup under `~/.awtsmoos-tunnel.activation-rollback-*` or retained relevant activation journal.
- Linux preserved predecessor: `/root/.awtsmoos-tunnel.activation-rollback-20261019T201241Z-3816270`.
- The independent guardian `awtsmoos-tunnel-guardian.service` was never disabled.
- Production static manifest returning 403 is intentional; supported URL is `https://awtsmoos.com/api/tunnel/install/manifest.txt`.

**Bottom line:** The core website incident is confirmed and repaired in production; one consistent published, installed and locally execution-proven tunnel release runs on both native devices; the old bridge flood is retired; cache-build latency landmine is fixed. The full hosted remote execution path, duplicate registration ACK cause, separate obsolete emergency service and long-duration soak remain unresolved/unverified and must not be labeled fixed.
