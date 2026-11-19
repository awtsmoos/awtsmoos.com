// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { readTunnelDownload } = require("./sourceFile.js");

/**
 * @file Builds exact integrity witnesses for executable bootstrap helpers.
 * @description
 * The Awtsmoos renews each byte before it can become an act;
 * Awtsmoos.com names each module's length and hash by exact fact.
 */

const WINDOWS_BOOTSTRAP_HELPERS = Object.freeze([
	"windows-progress.ps1",
	"windows-package.ps1",
	"windows-bundle.ps1",
	"windows-health.ps1",
	"windows-config.ps1",
	"windows-transaction.ps1",
	"windows-success.ps1",
	"windows-core.ps1"
]);

const UNIX_BOOTSTRAP_HELPERS = Object.freeze([
	"unix-bootstrap-fetch.sh",
	"unix-bootstrap-run.sh",
	"unix-bootstrap-presentation.sh",
	"unix-node-runtime.sh",
	"unix-bootstrap-components.sh",
	"unix-bootstrap-components-download.sh"
]);

/** Exact public bytes are verified against this signed-catalog witness. */
function cleanDownloadText(text) {
	return String(text || "").replace(/^\uFEFF/, "");
}

/** Describe one canonical public helper by length and SHA-256. */
function describeBootstrapHelper(fileName) {
	const bytes = Buffer.from(cleanDownloadText(readTunnelDownload(fileName)), "utf8");
	return {
		bytes: bytes.length,
		sha256: crypto.createHash("sha256").update(bytes).digest("hex")
	};
}

/** Form one deterministic, exact family of bootstrap integrity entries. */
function buildBootstrapIntegrityCatalog(fileNames) {
	const files = {};
	for (const fileName of fileNames) {
		files[fileName] = describeBootstrapHelper(fileName);
	}
	return {
		schemaVersion: 1,
		files
	};
}

/** Encode a witness as safe Base64 for the public shell entrypoint. */
function encodeBootstrapIntegrityCatalog(fileNames) {
	const json = JSON.stringify(buildBootstrapIntegrityCatalog(fileNames));
	return Buffer.from(json, "utf8").toString("base64");
}

module.exports = {
	WINDOWS_BOOTSTRAP_HELPERS,
	UNIX_BOOTSTRAP_HELPERS,
	buildBootstrapIntegrityCatalog,
	cleanDownloadText,
	encodeBootstrapIntegrityCatalog
};
