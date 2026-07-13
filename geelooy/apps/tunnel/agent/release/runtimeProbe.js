// B"H
const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("./runtimeCatalog.js");
const SourcePaths = require("./sourcePaths.js");

/**
 * B"H — Bytes are not called alive until their startup imports breathe. New
 * candidates obey the newest release contract; older known-good versions may
 * carry fewer modules and are judged by their own manifest plus their imports.
 */
function probeRuntime(root, options = {}) {
	const runtimeRoot = path.resolve(root);
	const manifestPath = options.manifestPath || preferredManifest(runtimeRoot);
	let descriptor;
	try {
		descriptor = readManifest(manifestPath);
	} catch (error) {
		return failure(error.message, {});
	}
	const roots = options.roots || SourcePaths.resolveRoots();
	const missing = descriptor.runtimeFiles.filter(relative => {
		const target = options.sourceLayout
			? SourcePaths.sourcePathFor(relative, roots)
			: path.join(runtimeRoot, relative);
		return !target || !fs.existsSync(target) || !fs.statSync(target).isFile();
	});
	if (missing.length) return failure("runtime_manifest_missing", { missing });
	try {
		if (options.sourceLayout) Catalog.assertManifestCoverage(descriptor.files, roots);
		else if (options.strictCoverage !== false) Catalog.assertRuntimeCoverage(descriptor.files);
	} catch (error) {
		return failure(error.message, {});
	}
	const imports = options.imports || ["lib/local-api.js", "lib/runtime/main-dependencies.js"];
	const script = [
		"const path=require('node:path');",
		"const root=process.argv[1];",
		"const files=JSON.parse(process.argv[2]);",
		"for(const file of files)require(path.join(root,file));",
		"process.stdout.write('startup_imports_ok\\n');"
	].join("");
	const run = childProcess.spawnSync(process.execPath, ["-e", script, runtimeRoot, JSON.stringify(imports)], {
		encoding: "utf8",
		timeout: Number(options.timeoutMs || 20000),
		env: { ...process.env, AWTSMOOS_SELF_UPDATE_DISABLED: "1" }
	});
	if (run.status !== 0) return failure("runtime_import_probe_failed", {
		status: run.status,
		signal: run.signal,
		stdout: run.stdout,
		stderr: run.stderr
	});
	return {
		ok: true,
		version: descriptor.version,
		files: descriptor.runtimeFiles.length,
		stdout: run.stdout.trim()
	};
}

function readManifest(filePath) {
	const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
		.map(line => line.trim()).filter(line => line && line !== 'B"H' && line !== '# B"H');
	if (lines.length < 3 || lines[1] !== "main.js") throw new Error("runtime_manifest_invalid");
	return { version: lines[0], entry: lines[1], files: lines.slice(2), runtimeFiles: lines.slice(1) };
}

function preferredManifest(root) {
	const installed = path.join(root, "installed-manifest.txt");
	return fs.existsSync(installed) ? installed : path.join(root, "manifest.txt");
}

function failure(error, details) {
	return { ok: false, error, ...details };
}

module.exports = { probeRuntime, readManifest };
