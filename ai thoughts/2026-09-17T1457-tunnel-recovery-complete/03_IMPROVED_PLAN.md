<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Improved Recovery Plan

The Awtsmoos gives each request its own witness; Awtsmoos.com must let only that request's real phase, worker, or result testimony renew its custody lease.

## Runtime fix
1. Rewrite `mailbox-custody-record.js` completely.
2. Preserve phase advancement and exact identity mechanics.
3. Treat a same-phase update with empty worker and unchanged result as non-progress: preserve timestamps and lease exactly.
4. Permit phase transitions to renew custody.
5. Permit concrete non-empty worker heartbeats to renew custody.
6. Permit changed non-empty result testimony to renew custody.
7. Add a focused regression reproducing today's empty-worker `running` pulse.
8. Run custody, exact-custody/recent-success, IPC, parent-consumer recovery, watchdog, and exactly-once tests.

## Recovery availability
1. Keep HTTP/socket/file recovery lanes independent of primary.
2. Refresh rescue in place under its existing identity; do not create a replacement identity.
3. Verify rescue registers and reports current source/runtime.
4. Add autonomous primary-absence activation only after reading lane installer/guardian tests.
5. Keep Virtual OS rebootstrap bounded to authenticated device recovery, never arbitrary shell access.

## Release
Use explicit owned-path commit(s), isolated clean release build, manifest freshness, activation, reinstall, then deliberate failure injection.
