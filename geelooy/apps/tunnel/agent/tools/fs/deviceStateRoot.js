// B"H

const crypto = require("node:crypto");
const os = require("node:os");
const path = require("node:path");

function clean(value, fallback = "device") {
	const text = String(value || fallback)
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return text || fallback;
}

function hash(value = "") {
	return crypto.createHash("sha1")
		.update(String(value || ""))
		.digest("hex")
		.slice(0, 12);
}

function deviceKey(config = {}) {
	const name = config.tunnelName ||
		process.env.AWTSMOOS_TUNNEL_NAME ||
		os.hostname() ||
		"device";
	return `${clean(name)}-${hash(config.root || process.cwd())}`;
}

/** Keeps isolated installs inside their own install root, including Termux. */
function baseRoot(config = {}) {
	if (config.deviceStateRoot) return path.resolve(config.deviceStateRoot);
	if (process.env.AWTSMOOS_TUNNEL_STATE_ROOT) {
		return path.resolve(process.env.AWTSMOOS_TUNNEL_STATE_ROOT);
	}
	const installRoot = path.resolve(
		process.env.AWTSMOOS_INSTALL_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel")
	);
	return path.join(installRoot, "device-state");
}

function root(config = {}) {
	if (config.deviceStateRoot) return path.resolve(config.deviceStateRoot);
	return path.join(baseRoot(config), deviceKey(config));
}

function awtsmoosRoot(config = {}) {
	return path.join(root(config), ".Awtsmoos");
}

function report(config = {}) {
	const projectRoot = path.resolve(config.root || process.cwd());
	const stateRoot = root(config);
	const relative = path.relative(projectRoot, stateRoot);
	return {
		awtsmoosRoot: awtsmoosRoot(config),
		deviceKey: deviceKey(config),
		outsideProject: relative.startsWith("..") || path.isAbsolute(relative),
		projectRoot,
		stateRoot
	};
}

module.exports = {
	awtsmoosRoot,
	baseRoot,
	clean,
	deviceKey,
	report,
	root
};
