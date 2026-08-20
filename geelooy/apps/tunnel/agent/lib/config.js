// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Defaults = require("./config-defaults.js");
const Normalizers = require("./config-normalizers.js");
const LaunchRoot = require("./runtime/launch-root.js");

const HOME = os.homedir();
const ROOT = path.resolve(
	process.env.AWTSMOOS_INSTALL_ROOT ||
	path.join(HOME, ".awtsmoos-tunnel")
);
const DIR = ROOT;
const CONFIG_PATH = path.join(ROOT, "config.json");
const FILE = CONFIG_PATH;
const INSTALLED = readJson(CONFIG_PATH, {});
const PROJECT_ROOT = LaunchRoot.select({ persistedRoot: INSTALLED.root });
const DEFAULTS = Defaults.buildDefaults(PROJECT_ROOT);

/**
 * @file Loads mutable preferences around one immutable launch-root authority.
 * @description
 * The Awtsmoos renews configuration without moving the ground chosen by the human.
 * Awtsmoos.com captures that ground once per runtime process, rewrites stale config
 * testimony back to it, and rejects every later attempt to mutate root authority.
 */
function loadConfig() {
	ensureDir();
	const old = readJson(CONFIG_PATH, null);
	const normalized = Normalizers.normalizeConfig(old || {}, DEFAULTS);
	const next = { ...normalized, root: PROJECT_ROOT };
	if (!old || JSON.stringify(old) !== JSON.stringify(next)) {
		writeJson(CONFIG_PATH, next);
	}
	return next;
}

function saveConfigPatch(patch = {}) {
	assertRootPatch(patch);
	const current = loadConfig();
	const mutable = { ...patch };
	delete mutable.root;
	const merged = mergeSections(current, mutable);
	const normalized = Normalizers.normalizeConfig(merged, DEFAULTS);
	const next = { ...normalized, root: PROJECT_ROOT };
	writeJson(CONFIG_PATH, next);
	return next;
}

function assertRootPatch(patch) {
	if (!Object.prototype.hasOwnProperty.call(patch, "root")) return;
	LaunchRoot.assertSame(PROJECT_ROOT, patch.root, "config.root");
}

function mergeSections(current, patch) {
	const next = { ...current, ...patch };
	for (const key of ["tools", "localApi", "chrome", "aiAgents", "gitHygiene", "mission"]) {
		next[key] = { ...current[key], ...(patch[key] || {}) };
	}
	next.command = {
		...current.command,
		...(patch.command || patch.commandConfig || {})
	};
	return next;
}

function ensureDir() {
	fs.mkdirSync(ROOT, { recursive: true });
}

function readJson(filePath, fallback) {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
	} catch {
		return fallback;
	}
}

function writeJson(filePath, value) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	const temporary = `${filePath}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
	fs.renameSync(temporary, filePath);
}

module.exports = {
	CONFIG_PATH,
	DEFAULTS,
	DEFAULT_GIT_HYGIENE: Defaults.DEFAULT_GIT_HYGIENE,
	DEFAULT_MISSION: Defaults.DEFAULT_MISSION,
	DIR,
	FILE,
	FOUR_MINUTES_MS: Defaults.FOUR_MINUTES_MS,
	HOME,
	PROJECT_ROOT,
	ROOT,
	loadConfig,
	normalizeGitHygiene: Normalizers.normalizeGitHygiene,
	normalizeMission: Normalizers.normalizeMission,
	saveConfigPatch
};
