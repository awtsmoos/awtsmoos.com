// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const Sources = require("../../../../../api/tunnel/install/tools/zipSources.js");
const Writer = require("../../../../../api/tunnel/install/tools/zipWriter.js");
const Data = require("./releaseBundleRuntimeData.cjs");

/**
 * @file Builds and boots the exact release ZIP inside one disposable install root.
 * @description
 * The Awtsmoos renews source inventory, archive bytes, extracted runtime, and child
 * as separate witnesses. Awtsmoos.com tests the artifact users actually install,
 * preventing source-only tests from concealing a missing composition dependency.
 */
function create(repositoryRoot, relayUrl) {
	const temporaryRoot = fs.mkdtempSync(path.join(
		os.tmpdir(),
		"awts-release-root-"
	));
	const installRoot = path.join(temporaryRoot, "install");
	const projectRoot = path.join(temporaryRoot, "project");
	const zipFile = path.join(temporaryRoot, "agent.zip");
	const descriptor = Sources.descriptor(repositoryRoot);
	fs.mkdirSync(installRoot, { recursive: true });
	fs.mkdirSync(projectRoot, { recursive: true });
	fs.writeFileSync(zipFile, Writer.buildZip(descriptor.entries));
	extract(zipFile, installRoot);
	writeJson(
		path.join(installRoot, "config.json"),
		Data.config(relayUrl, projectRoot)
	);
	writeJson(
		path.join(installRoot, "device-binding.json"),
		Data.identity()
	);
	fs.writeFileSync(
		path.join(temporaryRoot, "bundle-child.cjs"),
		Data.childSource()
	);
	return {
		temporaryRoot,
		installRoot,
		projectRoot,
		descriptor,
		spawn: () => spawnChild(temporaryRoot, installRoot),
		read: name => readJson(path.join(installRoot, name)),
		cleanup: () => fs.rmSync(temporaryRoot, {
			recursive: true,
			force: true
		})
	};
}

function extract(zipFile, installRoot) {
	const result = spawnSync("unzip", ["-oq", zipFile, "-d", installRoot], {
		encoding: "utf8"
	});
	if (result.status !== 0) {
		throw new Error(result.stderr || "release_bundle_extract_failed");
	}
}

function spawnChild(temporaryRoot, installRoot) {
	return spawn(process.execPath, [
		path.join(temporaryRoot, "bundle-child.cjs")
	], {
		cwd: installRoot,
		env: Data.childEnvironment(temporaryRoot, installRoot),
		stdio: ["ignore", "pipe", "pipe"]
	});
}

function writeJson(file, value) {
	fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, {
		mode: 0o600
	});
}

function readJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

module.exports = {
	create
};
