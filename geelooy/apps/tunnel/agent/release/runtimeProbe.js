// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const ImportProbe = require("./runtimeProbeImport.js");
const Inventory = require("./runtimeProbeInventory.js");
const Policy = require("./runtimeProbePolicy.js");

/**
 * @file Coordinates runtime inventory and startup-import proof.
 * @description
 * The Awtsmoos joins manifest evidence to child-process testimony without
 * crowding either vessel. Awtsmoos.com receives one stable API while inventory,
 * timeout policy, and execution remain small enough to inspect independently.
 */
function probeRuntime(root, options = {}) {
	const runtimeRoot = path.resolve(root);
	const manifestPath = options.manifestPath ||
		Inventory.preferredManifest(runtimeRoot);
	let descriptor;

	try {
		descriptor = Inventory.readManifest(manifestPath);
	} catch (error) {
		return failure(error.message, {});
	}

	const roots = Inventory.resolveRoots(options);
	const missing = Inventory.missingFiles(
		descriptor.runtimeFiles,
		runtimeRoot,
		roots,
		options
	);

	if (missing.length) {
		return failure("runtime_manifest_missing", { missing });
	}

	try {
		Inventory.assertCoverage(descriptor.files, roots, options);
		return importResult(runtimeRoot, descriptor, options);
	} catch (error) {
		return failure(error.message, {});
	}
}

function importResult(runtimeRoot, descriptor, options = {}) {
	const imports = options.imports || [
		"lib/local-api.js",
		"lib/runtime/main-dependencies.js"
	];
	const probe = ImportProbe.run(runtimeRoot, imports, options);
	const run = probe.result;

	if (run.status !== 0) {
		return failure("runtime_import_probe_failed", {
			status: run.status,
			signal: run.signal,
			stderr: run.stderr,
			stdout: run.stdout,
			timeoutMs: probe.timeoutMs,
			elapsedMs: probe.elapsedMs
		});
	}

	return {
		ok: true,
		version: descriptor.version,
		files: descriptor.runtimeFiles.length,
		stdout: run.stdout.trim(),
		timeoutMs: probe.timeoutMs,
		elapsedMs: probe.elapsedMs
	};
}

function failure(error, details) {
	return {
		ok: false,
		error,
		...details
	};
}

module.exports = {
	...Inventory,
	...Policy,
	failure,
	importResult,
	probeRuntime
};
