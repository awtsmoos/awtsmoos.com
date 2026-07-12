// B"H
const fsp = require('node:fs/promises');
const path = require('node:path');
const Http = require('./self-update-http.js');
const Process = require('./self-update-process.js');

/** B"H — Bundles install into one root and temporary files always disappear. */
async function installBundles(root, origin, options = {}) {
	const manifestText = await Http.fetchText(
		`${origin}/api/tunnel/install/bundle-manifest`,
		options
	);
	const response = JSON.parse(manifestText);
	if (!Array.isArray(response.bundles) || !response.bundles.length) {
		throw new Error('no_update_bundles');
	}
	const temporaryRoot = path.join(root, `.self-update-${process.pid}-${Date.now()}`);
	await fsp.rm(temporaryRoot, { recursive: true, force: true });
	await fsp.mkdir(temporaryRoot, { recursive: true });
	try {
		for (const bundle of response.bundles) {
			await installBundle(root, temporaryRoot, origin, bundle, options);
		}
	} finally {
		await fsp.rm(temporaryRoot, { recursive: true, force: true }).catch(() => {});
	}
	return { ok: true, bundles: response.bundles.length };
}

async function installBundle(root, temporaryRoot, origin, bundle, options) {
	const rawUrl = String(bundle.url || '');
	const url = rawUrl.startsWith('http') ? rawUrl : `${origin}${rawUrl}`;
	const zipPath = path.join(
		temporaryRoot,
		`${Process.safeName(bundle.name || 'agent')}.zip`
	);
	await Http.fetchFile(url, zipPath, options);
	Process.assertZip(zipPath);
	await Process.extractZip(zipPath, root);
}

module.exports = { installBundle, installBundles };
