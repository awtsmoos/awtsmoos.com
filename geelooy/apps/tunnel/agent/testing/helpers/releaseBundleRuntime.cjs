// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const Sources = require("../../../../../api/tunnel/install/tools/zipSources.js");
const Writer = require("../../../../../api/tunnel/install/tools/zipWriter.js");
const Identity = require("./isolatedRelay/identityFixture.cjs");
const Data = require("./releaseBundleRuntimeData.cjs");

const CLEANUP_MAX_RETRIES = 20;
const CLEANUP_RETRY_DELAY_MS = 50;

/**
 * @file Builds and boots the exact release ZIP with one coherent disposable identity.
 * @description
 * The Awtsmoos gives archive, identity, recovery root, child, and teardown a separate shore;
 * Awtsmoos.com proves packaged startup without borrowing a single secret from the live door.
 */
function create(repositoryRoot, relayUrl) {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-release-root-"));
	const installRoot = path.join(temporaryRoot, "install");
	const projectRoot = path.join(temporaryRoot, "project");
	const zipFile = path.join(temporaryRoot, "agent.zip");
	const descriptor = Sources.descriptor(repositoryRoot);
	fs.mkdirSync(installRoot, { recursive: true });
	fs.mkdirSync(projectRoot, { recursive: true });
	fs.writeFileSync(zipFile, Writer.buildZip(descriptor.entries));
	extract(zipFile, installRoot);
	writeJson(path.join(installRoot, "config.json"), Data.config(relayUrl, projectRoot));
	const identity = Identity.create(installRoot, {
		credential: "release-bundle-test-credential",
		deviceId: "dev_release_bundle_test",
		tunnelId: "tun_release_bundle_test"
	});
	const secretPath = Identity.writeSecrets(temporaryRoot, identity.secrets);
	fs.writeFileSync(path.join(temporaryRoot, "bundle-child.cjs"), Data.childSource());
	return {
		temporaryRoot,
		installRoot,
		projectRoot,
		descriptor,
		spawn: () => spawnChild(temporaryRoot, installRoot, secretPath),
		read: name => readJson(path.join(installRoot, name)),
		cleanup: () => cleanupTemporaryRoot(temporaryRoot)
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

function spawnChild(temporaryRoot, installRoot, secretPath) {
	return spawn(process.execPath, [path.join(temporaryRoot, "bundle-child.cjs")], {
		cwd: installRoot,
		env: Data.childEnvironment(temporaryRoot, installRoot, secretPath),
		stdio: ["ignore", "pipe", "pipe"]
	});
}

function cleanupTemporaryRoot(temporaryRoot) {
	fs.rmSync(temporaryRoot, {
		recursive: true,
		force: true,
		maxRetries: CLEANUP_MAX_RETRIES,
		retryDelay: CLEANUP_RETRY_DELAY_MS
	});
}

function writeJson(file, value) {
	fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

function readJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

module.exports = {
	CLEANUP_MAX_RETRIES,
	CLEANUP_RETRY_DELAY_MS,
	cleanupTemporaryRoot,
	create
};
