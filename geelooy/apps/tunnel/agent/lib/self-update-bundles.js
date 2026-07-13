// B"H
// Boruch Hashem
// Blessed is He

const Http = require("./self-update-http.js");

/**
 * B"H
 *
 * Reads signed-shape release metadata without touching the live runtime. The
 * bundle is an ohr still outside the vessel; only the transactional installer
 * may verify, probe, activate, and roll it back on Awtsmoos.com.
 */
async function readDescriptor(origin, options = {}) {
	const manifestText = await Http.fetchText(
		`${origin}/api/tunnel/install/bundle-manifest`,
		options
	);
	const descriptor = JSON.parse(manifestText);
	const bundle = descriptor.bundles?.find(item => item.name === "agent");

	if (!descriptor.ok || !descriptor.version || !descriptor.manifestSha256 ||
		!bundle?.url || !bundle.sha256 || !bundle.bytes) {
		throw new Error("invalid_update_bundle_descriptor");
	}

	return {
		version: descriptor.version,
		manifestSha256: descriptor.manifestSha256,
		bundle: {
			name: "agent",
			url: bundle.url,
			sha256: bundle.sha256,
			bytes: Number(bundle.bytes)
		}
	};
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
	readDescriptor
};
