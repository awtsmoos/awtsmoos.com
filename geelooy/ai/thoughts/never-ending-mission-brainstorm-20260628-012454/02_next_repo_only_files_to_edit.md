B"H

# Next repo-only files to edit

## New lock store package
- geelooy/apps/tunnel/agent/tools/fs/mission/lock/config.js
- geelooy/apps/tunnel/agent/tools/fs/mission/lock/store.js
- geelooy/apps/tunnel/agent/tools/fs/mission/lock/lifecycle.js
- geelooy/apps/tunnel/agent/tools/fs/mission/lock/release.js
- geelooy/apps/tunnel/agent/tools/fs/mission/lock/index.js

## Guard changes
- geelooy/apps/tunnel/agent/tools/fs/mission/activeGuard/discover.js
- geelooy/apps/tunnel/agent/tools/fs/mission/activeGuard/block.js
- geelooy/apps/tunnel/agent/tools/fs/mission/activeGuard/policy.js
- geelooy/apps/tunnel/agent/tools/fs/mission/activeGuard/index.js

## Response compacting
- geelooy/apps/tunnel/agent/tools/fs/mission/response/keys.js
- geelooy/apps/tunnel/agent/tools/fs/mission/response/compact.js
- geelooy/apps/tunnel/agent/tools/fs/mission/response/size.js
- geelooy/apps/tunnel/agent/tools/fs/mission/response/summary.js

## Daemon continuation
- geelooy/apps/tunnel/agent/tools/fs/mission/daemon/config.js
- geelooy/apps/tunnel/agent/tools/fs/mission/daemon/tick.js
- geelooy/apps/tunnel/agent/tools/fs/mission/daemon/status.js
- geelooy/apps/tunnel/agent/tools/fs/mission/daemon/recover.js
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionDaemonActions.js

## Mission-aware tool receipt wrappers
- geelooy/apps/tunnel/agent/tools/fs/mission/toolReceipts/config.js
- geelooy/apps/tunnel/agent/tools/fs/mission/toolReceipts/attach.js
- geelooy/apps/tunnel/agent/tools/fs/mission/toolReceipts/classify.js
- geelooy/apps/tunnel/agent/tools/fs/mission/toolReceipts/index.js

## Dispatch wiring
- geelooy/apps/tunnel/agent/tools/fs/actions.js

## Mission lifecycle wiring
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionActions.js
- maybe only wrappers around `missionStart`, `missionFinalize`, `missionGet`, not huge rewrites.

## Tests
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionLockStore.test.mjs
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionGuardUsesLock.test.mjs
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionDaemonTick.test.mjs
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionFocusedResponseSmall.test.mjs
- geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionToolReceiptAbsorb.test.mjs

## Release artifacts later only
- geelooy/apps/tunnel/agent/manifest.txt
- OpenAPI generated files only if new public daemon actions are added.

No installed-agent edits in this phase.
