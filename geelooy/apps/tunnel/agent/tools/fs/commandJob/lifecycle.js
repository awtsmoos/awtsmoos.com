// B"H
const Finalization = require('./finalization.js');
const Live = require('./liveLifecycle.js');

/** B"H — Compatibility facade over separated live and terminal ownership. */
module.exports = {
	beginIdentity: Live.beginIdentity,
	cleanupOptions: Finalization.cleanupOptions,
	createLive: Live.createLive,
	finalizeDetached: Finalization.finalizeDetached,
	finalizeLive: Finalization.finalizeLive,
	reserveFinalization: Finalization.reserve,
	wireProcess: Live.wireProcess
};
