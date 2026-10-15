# B"H — Platform Jobs (geelooy/api/social/helper/platform/jobs/)

Background job system for the social platform: admission, queueing, leasing, workers, ownership, health, and settlement.

## Files
- `jobQueue.js`, `jobAdmission.js`, `jobDrain.js` — queue, admission, draining.
- `jobWorker.js`, `jobWorkerPolicy.js` — workers and their policy.
- `jobLease.js`, `jobLock.js`, `jobOwnership.js`, `jobOwnerService.js` — leasing, locking, ownership.
- `jobStore.js`, `jobActiveIndex.js` — storage and active-job index.
- `jobHealth.js`, `jobPolicy.js`, `jobSettlement.js` — health, policy, settlement.
- `*.test.js` — jobActiveIndex, jobHealth, jobOwnerService, jobQueue, jobWorker tests.
