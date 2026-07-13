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
 * B"H
 *
 * Discovers releases without mutating the living runtime. The update may shine
 * as information, but activation remains inside the transactional installer,
 * whose preflight, archive, atomic swap, and rollback form the proper keli.
 */
async function maybeSelfUpdate(options = {}) {
	if (Policy.disabled(options)) {
		return { ok: true, skipped: true, reason: "disabled" };
	}

	const now = Date.now();

	if (!options.force && now - lastCheckAt < Policy.intervalMs(options)) {
		return { ok: true, skipped: true, reason: "interval" };
	}

	if (activeCheck) {
		return activeCheck;
	}

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
	const descriptor = await Bundles.readDescriptor(origin, options);

	if (descriptor.version !== remote.version || descriptor.manifestSha256 !== remote.hash) {
		throw new Error("release_manifest_descriptor_mismatch");
	}

	const local = State.readLocalState(State.createState(root));
	const complete = await Manifest.allManifestFilesExist(root, remote);
	const updateAvailable = local.version !== remote.version ||
		local.hash !== remote.hash ||
		!complete;

	if (!updateAvailable) {
		return {
			ok: true,
			updated: false,
			updateAvailable: false,
			version: remote.version,
			hash: remote.hash,
			complete
		};
	}

	return {
		ok: true,
		updated: false,
		updateAvailable: true,
		wouldUpdate: true,
		activation: "transactional_installer_required",
		version: remote.version,
		hash: remote.hash,
		local,
		complete,
		origin,
		descriptor,
		command: Bundles.installerCommand(origin)
	};
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
	runUpdateCheck
};
