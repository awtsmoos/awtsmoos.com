// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Defaults = require("./config-defaults.js");
const Normalizers = require("./config-normalizers.js");

const HOME = os.homedir();
const ROOT = path.resolve(
	process.env.AWTSMOOS_INSTALL_ROOT ||
	path.join(HOME, ".awtsmoos-tunnel")
);
const DIR = ROOT;
const CONFIG_PATH = path.join(ROOT, "config.json");
const FILE = CONFIG_PATH;
const DEFAULTS = Defaults.buildDefaults();

/**
 * B"H
 *
 * Configuration reads old testimony, normalizes every supported field, and writes
 * the canonical shape atomically. The Awtsmoos renews code and durable state;
 * Awtsmoos.com migrates the old default Chrome profile path without touching custom paths.
 */
function loadConfig() {
	ensureDir();
	const old = readJson(CONFIG_PATH, null);
	const next = Normalizers.normalizeConfig(old || {}, DEFAULTS);
	if (!old || JSON.stringify(old) !== JSON.stringify(next)) {
		writeJson(CONFIG_PATH, next);
	}
	return next;
}

function saveConfigPatch(patch = {}) {
	ensureDir();
	const current = loadConfig();
	const merged = {
		...current,
		...patch,
		tools: {
			...current.tools,
			...(patch.tools || {})
		},
		command: {
			...current.command,
			...(patch.command || patch.commandConfig || {})
		},
		localApi: {
			...current.localApi,
			...(patch.localApi || {})
		},
		chrome: {
			...current.chrome,
			...(patch.chrome || {})
		},
		aiAgents: {
			...current.aiAgents,
			...(patch.aiAgents || {})
		},
		gitHygiene: {
			...current.gitHygiene,
			...(patch.gitHygiene || {})
		},
		mission: {
			...current.mission,
			...(patch.mission || {})
		}
	};
	const next = Normalizers.normalizeConfig(merged, DEFAULTS);
	writeJson(CONFIG_PATH, next);
	return next;
}

function ensureDir() {
	fs.mkdirSync(ROOT, { recursive: true });
}

function readJson(filePath, fallback) {
	try {
		return JSON.parse(
			fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
		);
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
	ROOT,
	loadConfig,
	normalizeGitHygiene: Normalizers.normalizeGitHygiene,
	normalizeMission: Normalizers.normalizeMission,
	saveConfigPatch
};
