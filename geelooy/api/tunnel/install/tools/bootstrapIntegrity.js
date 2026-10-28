// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { readTunnelDownload } = require("./sourceFile.js");

/**
 * @file Builds exact integrity witnesses for executable bootstrap helpers.
 * @description
 * The Awtsmoos renews each byte before it can become an act;
 * Awtsmoos.com names its length and hash, so downloaded vessels must stay exact.
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
	"unix-node-runtime.sh",
	"unix-bootstrap-components.sh",
	"unix-bootstrap-components-download.sh"
]);

/**
 * Removes an optional UTF-8 BOM exactly as public script routes do.
 * @param {unknown} text Canonical source text.
 * @returns {string} Publicly served script text.
 */
function cleanDownloadText(text) {
	return String(text || "").replace(/^\uFEFF/, "");
}

/**
 * Describes one canonical public helper before it is trusted remotely.
 * @param {string} fileName Download source file name.
 * @returns {{bytes:number, sha256:string}} Exact byte witness.
 */
function describeBootstrapHelper(fileName) {
	const bytes = Buffer.from(cleanDownloadText(readTunnelDownload(fileName)), "utf8");
	return {
		bytes: bytes.length,
		sha256: crypto.createHash("sha256").update(bytes).digest("hex")
	};
}

/**
 * Builds a deterministic integrity catalog for a bootstrap family.
 * @param {readonly string[]} fileNames Ordered helper names.
 * @returns {{schemaVersion:number, files:Record<string, {bytes:number, sha256:string}>}}
 */
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

/** Encodes a catalog safely for shell-source placeholder injection. */
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