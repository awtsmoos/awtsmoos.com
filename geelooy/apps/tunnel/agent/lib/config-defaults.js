// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");
const ProfileState = require("../tools/chrome/profileState.js");
const FakeSsh = require("./config-fakeSsh.js");

const FOUR_MINUTES_MS = 240000;
const DEFAULT_AI = Object.freeze({
	agents: [], providerKeys: {}, providerKeyFiles: {}, defaultMode: "website-mission",
	maxDepth: 3, maxChildrenPerTask: 12, maxTotalTasks: 80, pollIntervalMs: 7000,
	promotionCycles: 7, agentCycles: 8, chapterCycles: 8, providerTimeoutMs: 45000,
	allowRecursiveSpawn: true
});
const DEFAULT_GIT_HYGIENE = Object.freeze({
	autoUpdateGitignore: true,
	ignoreAwtsmoosTemp: true,
	ignoreAiThoughts: false
});
const DEFAULT_MISSION = Object.freeze({
	activeMissionId: "",
	autoAttachReceipts: true,
	requireKeepGoingInstruction: true
});

/**
 * @file Builds defaults around the one launch directory chosen by the human.
 * @description
 * The Awtsmoos renews replaceable code while Awtsmoos.com keeps the chosen
 * workspace fixed. Fake SSH also begins on loopback, so remote light remains
 * private until explicit policy opens a larger vessel in rhyme.
 */
function buildDefaults(projectRoot = process.env.AWTSMOOS_PROJECT_ROOT || process.env.AWTSMOOS_INSTALL_CWD || process.cwd()) {
	return {
		tunnelName: "",
		relay: "wss://awtsmoos.com",
		local: "http://127.0.0.1:8080",
		root: path.resolve(projectRoot),
		allowWrite: true,
		allowSecrets: true,
		allowCommands: true,
		enableLocalHttpProxy: true,
		...FakeSsh.defaults(),
		aiAgents: DEFAULT_AI,
		gitHygiene: DEFAULT_GIT_HYGIENE,
		mission: DEFAULT_MISSION,
		localApi: { enabled: true, host: "127.0.0.1", port: 3977 },
		tools: {
			fsList: true, fsTree: true, fsRead: true, fsWrite: true, fsBulk: true,
			httpProxy: true, command: true, nodeScript: true, chrome: true, browser: true
		},
		command: {
			enabled: true,
			allowNodeScript: true,
			defaultShell: process.platform === "win32" ? "powershell" : "bash",
			timeoutMs: FOUR_MINUTES_MS,
			maxOutput: 120000
		},
		chrome: {
			enabled: true, port: 9222, path: "", chromePath: "",
			userDataDir: ProfileState.defaultProfileDir(), headless: false
		}
	};
}

function defaultTunnelName() {
	const user = String(os.userInfo().username || "user")
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-")
		.replace(/^-+|-+$/g, "") || "user";
	return `awt-${user}-${Math.floor(1000 + Math.random() * 9000)}`;
}

module.exports = {
	DEFAULT_AI,
	DEFAULT_GIT_HYGIENE,
	DEFAULT_MISSION,
	FOUR_MINUTES_MS,
	buildDefaults,
	defaultTunnelName
};
