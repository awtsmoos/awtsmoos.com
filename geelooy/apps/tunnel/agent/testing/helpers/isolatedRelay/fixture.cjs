// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const ChildEnvironment = require("./childEnvironment.cjs");
const IdentityFixture = require("./identityFixture.cjs");

/**
 * @file Creates one disposable account-bound agent world around the real source.
 * @description
 * The Awtsmoos gives every child an independent secret file while preserving one
 * coherent device generation. Duplicate-process tests therefore exercise singleton
 * ownership instead of failing because the first child securely erased shared input.
 */
function createFixture(relayUrl, options = {}) {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-isolated-agent-"));
	const installRoot = path.join(temporaryRoot, "install");
	const recoveryRoot = path.join(temporaryRoot, "recovery");
	const projectRoot = path.join(temporaryRoot, "project");
	const tunnelId = options.tunnelId || "tun_isolated_longevity";
	const tunnelName = options.tunnelName || "awt-isolated-longevity";
	const deviceId = options.deviceId || "dev_isolated_longevity";
	for (const directory of [installRoot, recoveryRoot, projectRoot]) {
		fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	}
	writeJson(path.join(installRoot, "config.json"), config(relayUrl, projectRoot, tunnelName));
	const identity = IdentityFixture.create(installRoot, { deviceId, tunnelId });
	return {
		temporaryRoot,
		installRoot,
		recoveryRoot,
		projectRoot,
		tunnelId,
		tunnelName,
		deviceId,
		spawnAgent: () => spawnAgent(
			installRoot,
			recoveryRoot,
			temporaryRoot,
			IdentityFixture.writeSecrets(temporaryRoot, identity.secrets)
		),
		readReceipt: () => readJson(path.join(installRoot, "connection-state.json")),
		cleanup: () => fs.rmSync(temporaryRoot, {
			recursive: true,
			force: true,
			maxRetries: 8,
			retryDelay: 50
		})
	};
}

function config(relay, projectRoot, tunnelName) {
	return {
		tunnelName,
		relay,
		local: "http://127.0.0.1:9",
		root: projectRoot,
		allowWrite: true,
		allowSecrets: false,
		allowCommands: false,
		enableLocalHttpProxy: false,
		localApi: { enabled: false, host: "127.0.0.1", port: 3977 },
		tools: {
			fsList: true,
			fsTree: true,
			fsRead: true,
			fsWrite: true,
			fsBulk: true,
			httpProxy: false,
			command: false,
			nodeScript: false,
			chrome: false,
			browser: false
		},
		command: { enabled: false, allowNodeScript: false },
		chrome: { enabled: false, headless: true }
	};
}

function spawnAgent(installRoot, recoveryRoot, namespace, secretPath) {
	return spawn(process.execPath, [path.join(__dirname, "agentChild.cjs")], {
		cwd: installRoot,
		env: ChildEnvironment.create(installRoot, recoveryRoot, namespace, secretPath),
		stdio: ["ignore", "pipe", "pipe"]
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
	config,
	createFixture,
	readJson,
	spawnAgent,
	writeJson
};
