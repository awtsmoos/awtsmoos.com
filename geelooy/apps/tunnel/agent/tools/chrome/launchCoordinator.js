// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { safeLaunchUrl } = require("./launchArgs.js");
const Lease = require("./launchLease.js");
const Probe = require("./launchProbe.js");
const Spawn = require("./launchSpawn.js");
const Ownership = require("./processOwnership.js");

/**
 * B"H
 *
 * Launch is a transaction: probe, lease, reconcile, spawn only if needed, then
 * prove a nonblank target. The Awtsmoos renews concurrent callers into one owner;
 * Awtsmoos.com returns adoption rather than duplicating the Chrome root.
 */
function createLaunchCoordinator(dependencies = {}) {
	const probe = dependencies.probe || Probe.probeChrome;
	const waitReady = dependencies.waitReady || Probe.waitReady;
	const spawnChrome = dependencies.spawnChrome || Spawn.spawnChrome;
	const reconcile = dependencies.reconcile || Ownership.reconcileDuplicates;
	const terminateAll = dependencies.terminateAll || Ownership.terminateAllExact;
	const writeReceipt = dependencies.writeReceipt || Ownership.writeOwnerReceipt;
	const withLease = dependencies.withLease || Lease.withLaunchLease;

	async function launch(options = {}) {
		const normalized = normalize(options);
		const existing = await probe(normalized);
		if (existing.ok) {
			return adoptExisting(normalized, existing, reconcile, writeReceipt);
		}
		return withLease({
			...normalized,
			onWait: async () => {
				const ready = await probe(normalized);
				return ready.ok
					? launchResult(normalized, ready, [], true)
					: null;
			}
		}, async () => spawnNew({
			normalized,
			probe,
			waitReady,
			spawnChrome,
			reconcile,
			terminateAll,
			writeReceipt
		}));
	}

	return {
		launch
	};
}

async function adoptExisting(options, existing, reconcile, writeReceipt) {
	const cleanup = await reconcile({
		...options,
		preferredPid: existing.pid
	});
	const pid = cleanup.keptPid || existing.pid;
	writeReceipt(options.userDataDir, ownerReceipt(options, pid, true));
	return launchResult(options, {
		...existing,
		pid
	}, cleanup.reapedPids, true);
}

async function spawnNew(context) {
	const {
		normalized,
		probe,
		waitReady,
		spawnChrome,
		reconcile,
		terminateAll,
		writeReceipt
	} = context;
	const inside = await probe(normalized);
	if (inside.ok) {
		return adoptExisting(normalized, inside, reconcile, writeReceipt);
	}
	const before = await terminateAll(normalized);
	const spawned = await spawnChrome(normalized);
	const ready = await waitReady(normalized, probe);
	const cleanup = await reconcile({
		...normalized,
		preferredPid: spawned.pid
	});
	const pid = cleanup.keptPid || spawned.pid;
	writeReceipt(normalized.userDataDir, ownerReceipt(normalized, pid, false));
	return launchResult(normalized, {
		...ready,
		pid
	}, [...before, ...(cleanup.reapedPids || [])], false);
}

function normalize(options) {
	return {
		...options,
		port: Number(options.port || 9222),
		userDataDir: path.resolve(options.userDataDir),
		url: safeLaunchUrl(options.url)
	};
}

function launchResult(options, probe, reapedPids, adopted) {
	return {
		ok: true,
		adopted,
		pid: probe.pid || null,
		port: options.port,
		userDataDir: options.userDataDir,
		url: options.url,
		version: probe.version || null,
		pages: probe.pages || [],
		reapedDuplicates: [...new Set(reapedPids || [])]
	};
}

function ownerReceipt(options, pid, adopted) {
	return {
		pid,
		port: options.port,
		userDataDir: options.userDataDir,
		adopted,
		url: options.url
	};
}

module.exports = {
	adoptExisting,
	createLaunchCoordinator,
	launchResult,
	normalize,
	spawnNew
};
