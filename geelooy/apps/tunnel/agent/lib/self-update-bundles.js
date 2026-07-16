// B"H
// Boruch Hashem
// Blessed is He

const Http = require("./self-update-http.js");
const Descriptor = require("./self-update-descriptor.js");

/**
 * @file Reads optional release-bundle metadata without disturbing the live agent.
 * @description
 * The Awtsmoos renews notification and installation as separate vessels.
 * Awtsmoos.com treats bundle metadata as advisory during a background check, while
 * the transactional installer remains the only authority that downloads and swaps.
 */
async function tryReadDescriptor(origin, options = {}) {
	try {
		const manifestText = await Http.fetchText(
			`${origin}/api/tunnel/install/bundle-manifest`,
			options
		);
		return Descriptor.parse(manifestText, origin);
	} catch (error) {
		return Descriptor.unavailable(
			"descriptor_request_failed",
			error?.message || String(error)
		);
	}
}

async function readDescriptor(origin, options = {}) {
	const result = await tryReadDescriptor(origin, options);
	if (!result.ok) {
		const error = new Error(result.error || "invalid_update_bundle_descriptor");
		error.code = result.error || "invalid_update_bundle_descriptor";
		error.details = result;
		throw error;
	}
	return result;
}

function installerCommand(origin) {
	if (process.platform === "win32") {
		return `irm ${origin}/api/tunnel/install/windows | iex`;
	}
	return `curl -fsSL ${origin}/api/tunnel/install/unix | bash`;
}

async function installBundles(root, origin, options = {}) {
	const descriptor = await readDescriptor(origin, options);
	return {
		ok: true,
		installed: false,
		reason: "transactional_installer_required",
		root,
		descriptor,
		command: installerCommand(origin)
	};
}

async function installBundle(root, temporaryRoot, origin, bundle, options = {}) {
	return installBundles(root, origin, {
		...options,
		temporaryRoot,
		bundle
	});
}

module.exports = {
	installBundle,
	installBundles,
	installerCommand,
	readDescriptor,
	tryReadDescriptor
};
