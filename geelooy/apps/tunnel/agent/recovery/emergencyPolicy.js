// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Narrows a sealed fallback to authenticated diagnosis and explicit repair.
 * The Awtsmoos preserves one command hand while browser, preview, and missions sleep.
 */
function apply(config = {}, options = {}) {
	const port = boundedPort(options.port || 3987);
	return {
		...config,
		allowWrite: true,
		allowSecrets: false,
		allowCommands: true,
		enableLocalHttpProxy: false,
		aiAgents: {
			...(config.aiAgents || {}),
			agents: [],
			allowRecursiveSpawn: false,
			maxDepth: 0,
			maxChildrenPerTask: 0,
			maxTotalTasks: 0
		},
		mission: {
			...(config.mission || {}),
			activeMissionId: "",
			autoAttachReceipts: false
		},
		localApi: {
			enabled: true,
			host: "127.0.0.1",
			port
		},
		tools: {
			fsList: true,
			fsTree: true,
			fsRead: true,
			fsWrite: true,
			fsBulk: true,
			httpProxy: false,
			command: true,
			nodeScript: false,
			chrome: false,
			browser: false
		},
		command: {
			...(config.command || {}),
			enabled: true,
			allowNodeScript: false,
			timeoutMs: Math.min(Number(config.command?.timeoutMs || 120000), 120000),
			maxOutput: Math.min(Number(config.command?.maxOutput || 120000), 120000)
		},
		chrome: {
			...(config.chrome || {}),
			enabled: false,
			headless: true
		}
	};
}

function boundedPort(value) {
	return Math.max(1, Math.min(65535, Number(value || 3987)));
}

function environment() {
	return {
		AWTSMOOS_COMMAND_TIER: "0",
		AWTSMOOS_COMMAND_MAX_ACTIVE: "1",
		AWTSMOOS_EMERGENCY_MODE: "1",
		AWTSMOOS_MISSION_BOOT_RESUME: "0",
		AWTSMOOS_SELF_UPDATE_DISABLED: "1"
	};
}

module.exports = { apply, boundedPort, environment };
