// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Worker recovery roots are explicit so a source-only reaper can never disappear
 * from the installed bundle. The Awtsmoos renews registry, lease, process family,
 * cancellation, and durable finalization as one deployable recovery constellation.
 */
module.exports = Object.freeze([
	"lib/runtime/main-worker-stats.js",
	"lib/runtime/worker-public.js",
	"lib/runtime/worker-reap-await.js",
	"lib/runtime/worker-reap-deadline.js",
	"lib/runtime/worker-reap-operation.js",
	"lib/runtime/worker-reaper-loop.js",
	"lib/runtime/worker-reaper.js",
	"lib/runtime/worker-registry-active.js",
	"lib/runtime/worker-registry-counters.js",
	"lib/runtime/worker-registry-recent.js",
	"lib/runtime/worker-registry-snapshot.js",
	"lib/runtime/worker-registry-store.js",
	"lib/runtime/worker-registry.js",
	"lib/runtime/worker-supervisor.js",
	"tools/fs/commandJob/cancel.js",
	"tools/fs/commandJob/cancelResponse.js",
	"tools/fs/commandJob/cancelStored.js",
	"tools/fs/commandJob/context.js",
	"tools/fs/commandJob/finalization.js",
	"tools/fs/commandJob/forceFinalization.js",
	"tools/fs/commandJob/liveIdentity.js",
	"tools/fs/commandJob/liveLifecycle.js",
	"tools/fs/commandJob/liveProcessEvents.js",
	"tools/fs/commandJob/metaFactory.js",
	"tools/fs/commandJob/normalFinalization.js",
	"tools/fs/commandJob/ownership.js",
	"tools/fs/commandJob/promiseDeadline.js",
	"tools/fs/commandJob/reap.js",
	"tools/fs/commandJob/registryBridge.js"
]);
