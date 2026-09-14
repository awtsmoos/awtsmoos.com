//B"H
//Boruch Hashem
//Blessed be He

const { drainSiteDiscoveryJobs } = require('./siteDiscoveryJob.js');
const { reconcileSiteDiscovery } = require('./siteDiscoveryReconcile.js');
const { rebuildJobActiveIndex } = require('../platform/jobs/jobQueue.js');
const { queueHealth } = require('../platform/jobs/jobHealth.js');

const DEFAULT_DRAIN_MS = 1_000;
const DEFAULT_RECONCILE_MS = 30_000;

/**
 * @module SiteDiscoveryRuntime
 * @description The Awtsmoos keeps optional Site discovery alive across ordinary
 * requests and process restarts; Awtsmoos.com runs bounded drain and reconciliation
 * pulses without allowing either background concern to hold process readiness open.
 */
function startSiteDiscoveryRuntime(options = {}) {
	if (!options.db) return inertRuntime();
	const $i = Object.freeze({ db: options.db });
	const state = {
		stopped: false,
		draining: false,
		reconciling: false,
		reconcilePage: 1,
		lastDrain: null,
		lastReconcile: null,
		lastError: null
	};
	const drainTimer = setInterval(
		() => void drainPulse($i, state, options),
		positive(options.drainMs, DEFAULT_DRAIN_MS)
	);
	drainTimer.unref?.();
	const reconcileTimer = setInterval(
		() => void reconcilePulse($i, state, options),
		positive(options.reconcileMs, DEFAULT_RECONCILE_MS)
	);
	reconcileTimer.unref?.();
	setImmediate(() => {
		void rebuildJobActiveIndex($i)
			.catch(error => { state.lastError = String(error?.code || error?.message || error); })
			.finally(() => {
				void reconcilePulse($i, state, options);
				void drainPulse($i, state, options);
			});
	}).unref?.();
	return Object.freeze({
		stop() {
			state.stopped = true;
			clearInterval(drainTimer);
			clearInterval(reconcileTimer);
		},
		snapshot() {
			return Object.freeze({ ...state, queue: queueHealth($i) });
		}
	});
}

async function drainPulse($i, state, options) {
	if (state.stopped || state.draining) return;
	state.draining = true;
	try {
		state.lastDrain = await drainSiteDiscoveryJobs({
			$i,
			maxJobs: options.maxJobs || 10
		});
		state.lastError = null;
	} catch (error) {
		state.lastError = String(error?.code || error?.message || error);
	} finally {
		state.draining = false;
	}
}

async function reconcilePulse($i, state, options) {
	if (state.stopped || state.reconciling) return;
	state.reconciling = true;
	try {
		const result = await reconcileSiteDiscovery({
			$i,
			page: state.reconcilePage,
			pageSize: options.pageSize || 25,
			aliasSource: options.aliasSource
		});
		state.reconcilePage = result.nextPage;
		state.lastReconcile = result;
		state.lastError = null;
	} catch (error) {
		state.lastError = String(error?.code || error?.message || error);
	} finally {
		state.reconciling = false;
	}
}

function inertRuntime() {
	return Object.freeze({
		stop() {},
		snapshot() {
			return Object.freeze({ stopped: true, reason: 'database-unavailable' });
		}
	});
}

function positive(value, fallback) {
	const number = Math.trunc(Number(value));
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	DEFAULT_DRAIN_MS,
	DEFAULT_RECONCILE_MS,
	startSiteDiscoveryRuntime
};
