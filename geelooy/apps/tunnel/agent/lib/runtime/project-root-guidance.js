// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts project-root failures into precise repair guidance.
 * @description
 * The Awtsmoos renews permission and platform separately. Awtsmoos.com therefore
 * names the blocked boundary honestly instead of pretending that a live process
 * inherited Terminal, launchd, service-manager, or filesystem authority.
 */
function guidanceFor(errorCode, root, options = {}) {
	const code = String(errorCode || "ROOT_CHECK_FAILED");
	const platform = options.platform || process.platform;
	const access = options.allowWrite ? "read and write" : "read";

	if (platform === "darwin" && ["EPERM", "EACCES"].includes(code)) {
		return [
			`macOS denied ${root}.`,
			"Grant the background tunnel launcher access,",
			"or choose a root outside Desktop, Documents, and Downloads."
		].join(" ");
	}
	if (code === "ENOENT") {
		return `Create the configured project root or update config.json: ${root}`;
	}
	if (code === "ENOTDIR") {
		return `Choose a directory for the configured project root: ${root}`;
	}
	return `Verify that the installed agent process can ${access} ${root}.`;
}

module.exports = {
	guidanceFor
};
