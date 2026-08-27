// B"H
// Boruch Hashem
// Blessed is He

const { ROOT } = require("./config.js");
const Bundles = require("./self-update-bundles.js");
const Http = require("./self-update-http.js");
const Manifest = require("./self-update-manifest.js");
const Policy = require("./self-update-policy.js");
const State = require("./self-update-state.js");

let lastCheckAt = 0;
let activeCheck = null;

/**
 * @file Discovers releases without allowing advisory metadata to crash the agent.
 * @description
 * The Awtsmoos renews manifest, bundle descriptor, and living socket separately.
 * Awtsmoos.com trusts the manifest for notification, treats bundle metadata as
 * optional evidence, and reserves all mutation for the transactional installer.
 */
async function maybeSelfUpdate(options = {}) {
	if (Policy.disabled(options)) {
		return { ok: true, skipped: true, reason: "disabled" };
	}
	const now = Date.now();
	if (!options.force && now - lastCheckAt < Policy.intervalMs(options)) {
		return { ok: true, skipped: true, reason: "interval" };
	}
	if (activeCheck) return activeCheck;
	activeCheck = runUpdateCheck(options).finally(() => {
		activeCheck = null;
	});
	return activeCheck;
}

async function runUpdateCheck(options = {}) {
	lastCheckAt = Date.now();
	const root = options.root || ROOT;
	const origin = Policy.originFromConfig(options.config || {}, options.origin);
	const manifestText = await Http.fetchText(
		`${origin}/apps/tunnel/agent/manifest.txt`,
		options
	);
	const remote = Manifest.parseManifest(manifestText);
	const descriptorState = await Bundles.tryReadDescriptor(origin, options);
	const descriptorWarning = warningForDescriptor(remote, descriptorState);
	const local = State.readLocalState(State.createState(root));
	const complete = await Manifest.allManifestFilesExist(root, remote);
	const updateAvailable = local.version !== remote.version ||
		local.hash !== remote.hash ||
		!complete;
	const shared = {
		ok: true,
		updated: false,
		updateAvailable,
		version: remote.version,
		hash: remote.hash,
		complete,
		origin,
		descriptorAvailable: descriptorState.ok === true,
		descriptor: descriptorState.ok ? descriptorState : null,
		descriptorWarning,
		command: Bundles.installerCommand(origin)
	};
	if (!updateAvailable) return shared;
	return {
		...shared,
		wouldUpdate: true,
		activation: "transactional_installer_required",
		local
	};
}

function warningForDescriptor(remote, descriptorState = {}) {
	if (!descriptorState.ok) {
		return {
			code: descriptorState.error || "descriptor_unavailable",
			message: descriptorState.message || "Bundle metadata is temporarily unavailable."
		};
	}
	if (
		descriptorState.version !== remote.version ||
		descriptorState.manifestSha256 !== remote.hash
	) {
		return {
			code: "release_manifest_descriptor_mismatch",
			message: "Release manifest and bundle descriptor are not yet synchronized."
		};
	}
	return null;
}

function readLocalState(root = ROOT) {
	return State.readLocalState(State.createState(root));
}

function restartIntoUpdatedAgent() {
	return {
		ok: true,
		restarted: false,
		reason: "transactional_installer_required"
	};
}

module.exports = {
	hashLines: Manifest.hashLines,
	isSafePath: Manifest.isSafePath,
	maybeSelfUpdate,
	originFromConfig: Policy.originFromConfig,
	parseManifest: Manifest.parseManifest,
	readLocalState,
	restartIntoUpdatedAgent,
	runUpdateCheck,
	warningForDescriptor
};
