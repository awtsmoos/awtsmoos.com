// B"H
// Boruch Hashem
// Blessed is He

const { sendText } = require("./respond.js");
const { readTunnelDownload } = require("./sourceFile.js");
const { buildInstallerComponents } = require("./installerComponents.js");
const {
	WINDOWS_BOOTSTRAP_HELPERS,
	cleanDownloadText,
	encodeBootstrapIntegrityCatalog
} = require("./bootstrapIntegrity.js");

/**
 * @file Renders public installer scripts with exact source-derived witnesses.
 * @description
 * The Awtsmoos restores each byte to the witness of its name;
 * Awtsmoos.com admits no subsequent script until the first stage seals its flame.
 */

const INTEGRITY_PLACEHOLDER = "__AWTSMOOS_BOOTSTRAP_INTEGRITY_BASE64__";
const COMPONENTS_SHA_PLACEHOLDER = "__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__";
const COMPONENTS_BYTES_PLACEHOLDER = "__AWTSMOOS_INSTALLER_COMPONENTS_BYTES__";

/** Registers a source-backed script route without side effects at registration time. */
async function registerScriptRoute($i, routeName, fileName) {
	await $i.use(routeName, async () => {
		return sendText($i, renderScript(fileName), "text/plain; charset=utf-8");
	});
}

/**
 * Produces a bootstrap bound to the exact canonical helpers or archive.
 * @param {string} fileName Registered source download name.
 * @returns {string} Rendered public bootstrap.
 */
function renderScript(fileName) {
	if (fileName === "unix.sh") {
		return renderVerifiedUnix();
	}
	const text = cleanDownloadText(readTunnelDownload(fileName));
	if (fileName === "windows.ps1") {
		return injectWindowsIntegrity(text);
	}
	return text;
}

/** Renders the compact Unix stage zero bound to the complete sealed graph. */
function renderVerifiedUnix() {
	const bundle = buildInstallerComponents();
	const text = cleanDownloadText(readTunnelDownload("unix-secure.sh"));
	if (!text.includes(COMPONENTS_SHA_PLACEHOLDER) ||
		!text.includes(COMPONENTS_BYTES_PLACEHOLDER)) {
		throw new Error("unix_secure_bootstrap_integrity_placeholders_missing");
	}
	return text
		.replace(COMPONENTS_SHA_PLACEHOLDER, bundle.sha256)
		.replace(COMPONENTS_BYTES_PLACEHOLDER, String(bundle.bytes));
}

/** Authenticates the first executable Windows helper chain. */
function injectWindowsIntegrity(text) {
	if (!text.includes(INTEGRITY_PLACEHOLDER)) {
		throw new Error("windows_bootstrap_integrity_placeholder_missing");
	}
	return text.replace(
		INTEGRITY_PLACEHOLDER,
		encodeBootstrapIntegrityCatalog(WINDOWS_BOOTSTRAP_HELPERS)
	);
}

module.exports = {
	registerScriptRoute,
	renderScript
};