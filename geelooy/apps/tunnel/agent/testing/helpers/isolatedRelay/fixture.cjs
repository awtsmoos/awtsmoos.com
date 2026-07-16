// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

/**
 * @file Creates a disposable account-bound agent world around the real source.
 * @description
 * The Awtsmoos renews root, identity, credential namespace, and child independently.
 * Awtsmoos.com keeps every test under temporary directories and test-only storage,
 * proving recovery without reading or changing the user's installed tunnel secrets.
 */
function createFixture(relayUrl, options = {}) {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-isolated-agent-"));
	const installRoot = path.join(temporaryRoot, "install");
	const projectRoot = path.join(temporaryRoot, "project");
	const tunnelId = options.tunnelId || "tun_isolated_longevity";
	const tunnelName = options.tunnelName || "awt-isolated-longevity";
	const deviceId = options.deviceId || "dev_isolated_longevity";
	fs.mkdirSync(installRoot, { recursive: true });
	fs.mkdirSync(projectRoot, { recursive: true });
	writeJson(path.join(installRoot, "config.json"), config(relayUrl, projectRoot, tunnelName));
	writeJson(path.join(installRoot, "device-binding.json"), {
		schemaVersion: 1,
		deviceId,
		tunnelId,
		publicKey: "isolated-test-public-key",
		publicKeyFingerprint: "isolated-test-fingerprint",
		credentialVersion: 1,
		pairedAt: new Date().toISOString(),
		createdAt: new Date().toISOString()
	});
	return {
		temporaryRoot,
		installRoot,
		projectRoot,
		tunnelId,
		tunnelName,
		deviceId,
		spawnAgent: () => spawnAgent(installRoot, temporaryRoot),
		readReceipt: () => readJson(path.join(installRoot, "connection-state.json")),
		cleanup: () => fs.rmSync(temporaryRoot, { recursive: true, force: true })
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

function spawnAgent(installRoot, namespace) {
	const childFile = path.join(__dirname, "agentChild.cjs");
	return spawn(process.execPath, [childFile], {
		cwd: installRoot,
		env: {
			...process.env,
			AWTSMOOS_INSTALL_ROOT: installRoot,
			AWTSMOOS_TEST_MODE: "1",
			AWTSMOOS_TEST_NAMESPACE: path.basename(namespace),
			AWTSMOOS_SKIP_PAIRING_BROWSER: "1",
			AWTSMOOS_SKIP_OPEN_CONTROL: "1",
			AWTSMOOS_MISSION_BOOT_RESUME: "0",
			AWTSMOOS_WS_LIVENESS_INTERVAL_MS: "1000",
			AWTSMOOS_WS_PING_IDLE_MS: "1000",
			AWTSMOOS_WS_DEAD_IDLE_MS: "3000",
			AWTSMOOS_RECONNECT_BASE_MS: "150",
			AWTSMOOS_RECONNECT_MAX_MS: "800",
			AWTSMOOS_RECONNECT_JITTER: "0",
			AWTSMOOS_REGISTRATION_RETRY_MS: "300",
			AWTSMOOS_REGISTRATION_MAX_ATTEMPTS: "8"
		},
		stdio: ["ignore", "pipe", "pipe"]
	});
}

function writeJson(file, value) {
	fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

function readJson(file) {
	try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

module.exports = {
	config,
	createFixture,
	readJson,
	spawnAgent,
	writeJson
};
