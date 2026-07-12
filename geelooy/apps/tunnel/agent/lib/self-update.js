// B"H
const fsp = require('node:fs/promises');
const { ROOT } = require('./config.js');
const Bundles = require('./self-update-bundles.js');
const Http = require('./self-update-http.js');
const Manifest = require('./self-update-manifest.js');
const Policy = require('./self-update-policy.js');
const Process = require('./self-update-process.js');
const State = require('./self-update-state.js');

let lastCheckAt = 0;
let activeCheck = null;

/**
 * B"H — One update check owns one lock, one manifest authority, and one install
 * root. Relay transport never silently becomes update authority.
 */
async function maybeSelfUpdate(options = {}) {
	if (Policy.disabled(options)) {
		return { ok: true, skipped: true, reason: 'disabled' };
	}
	const now = Date.now();
	if (!options.force && now - lastCheckAt < Policy.intervalMs(options)) {
		return { ok: true, skipped: true, reason: 'interval' };
	}
	if (activeCheck) return activeCheck;
	activeCheck = runUpdateCheck(options).finally(() => { activeCheck = null; });
	return activeCheck;
}

async function runUpdateCheck(options = {}) {
	lastCheckAt = Date.now();
	const root = options.root || ROOT;
	const state = State.createState(root);
	await fsp.mkdir(root, { recursive: true });
	const origin = Policy.originFromConfig(options.config || {}, options.origin);
	const manifestText = await Http.fetchText(
		`${origin}/apps/tunnel/agent/manifest.txt`,
		options
	);
	const remote = Manifest.parseManifest(manifestText);
	const local = State.readLocalState(state);
	const complete = await Manifest.allManifestFilesExist(root, remote);
	const needsUpdate = local.version !== remote.version ||
		local.hash !== remote.hash ||
		!complete;
	if (!needsUpdate) {
		return { ok: true, updated: false, version: remote.version, hash: remote.hash, complete };
	}
	if (options.dryRun) {
		return {
			ok: true,
			updated: false,
			wouldUpdate: true,
			version: remote.version,
			hash: remote.hash,
			local,
			complete,
			origin
		};
	}
	return installUpdate(root, state, remote, origin, options);
}

async function installUpdate(root, state, remote, origin, options) {
	if (!await State.acquireLock(state)) {
		return { ok: true, skipped: true, reason: 'another_update_running' };
	}
	try {
		const local = State.readLocalState(state);
		if (local.version === remote.version &&
			local.hash === remote.hash &&
			await Manifest.allManifestFilesExist(root, remote)) {
			return { ok: true, updated: false, version: remote.version, hash: remote.hash, complete: true };
		}
		await Bundles.installBundles(root, origin, options);
		if (!await Manifest.allManifestFilesExist(root, remote)) {
			throw new Error('self_update_verification_failed');
		}
		await State.writeLocalState(state, remote);
		return {
			ok: true,
			updated: true,
			version: remote.version,
			hash: remote.hash,
			entry: remote.entry,
			origin
		};
	} finally {
		await State.releaseLock(state);
	}
}

function readLocalState(root = ROOT) {
	return State.readLocalState(State.createState(root));
}

function restartIntoUpdatedAgent(extraArgs = process.argv.slice(2), root = ROOT) {
	return Process.restartIntoUpdatedAgent(root, extraArgs);
}

module.exports = {
	hashLines: Manifest.hashLines,
	isSafePath: Manifest.isSafePath,
	maybeSelfUpdate,
	originFromConfig: Policy.originFromConfig,
	parseManifest: Manifest.parseManifest,
	readLocalState,
	restartIntoUpdatedAgent,
	runUpdateCheck
};
