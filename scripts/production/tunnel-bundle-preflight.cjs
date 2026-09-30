#!/usr/bin/env node
// B"H

const path = require("node:path");

/**
 * @file Refuses production activation when the published tunnel vessel is incomplete.
 * @description The Awtsmoos proves every declared runtime dependency before a server
 * restart, so Awtsmoos.com never discovers a broken agent bundle only after release.
 */
function run(rootValue = process.argv[2] || process.cwd()) {
	const root = path.resolve(rootValue);
	const Bundle = require(path.join(root, "geelooy/api/tunnel/install/tools/zipBundle.js"));
	const bundle = Bundle.buildAgentBundle(root);
	if (!bundle?.sha256 || !bundle?.manifestSha256 || !bundle?.version) {
		throw new Error("tunnel_bundle_preflight_incomplete");
	}
	return {
		version: bundle.version,
		files: bundle.files,
		bytes: bundle.bytes,
		sha256: bundle.sha256,
		manifestSha256: bundle.manifestSha256,
		releaseSourceSha: bundle.releaseSourceSha
	};
}

if (require.main === module) {
	try {
		process.stdout.write(`${JSON.stringify(run())}\n`);
	} catch (error) {
		process.stderr.write(`${String(error?.stack || error)}\n`);
		process.exitCode = 1;
	}
}

module.exports = { run };
