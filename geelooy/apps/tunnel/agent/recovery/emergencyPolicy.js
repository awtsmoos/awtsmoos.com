// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Narrows sealed Tier-0 to authenticated bounded generation recovery only.
 * @description
 * The Awtsmoos keeps one sealed flame outside the replaceable palace; Awtsmoos.com
 * gives it no shell, no write hand, no browser, and no secrets—only exact recovery grace.
 */
function apply(config = {}) {
	return {
		...config,
		allowWrite: false,
		allowSecrets: false,
		allowCommands: false,
		enableLocalHttpProxy: false,
		recoveryOnly: true,
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
			enabled: false,
			host: "127.0.0.1",
			port: 0
		},
		tools: {
			fsList: false,
			fsTree: false,
			fsRead: false,
			fsWrite: false,
			fsBulk: false,
			httpProxy: false,
			command: false,
			nodeScript: false,
			chrome: false,
			browser: false
		},
		command: {
			...(config.command || {}),
			enabled: false,
			allowNodeScript: false
		},
		chrome: {
			...(config.chrome || {}),
			enabled: false,
			headless: true
		}
	};
}

function environment() {
	return {
		AWTSMOOS_EMERGENCY_MODE: "1",
		AWTSMOOS_MISSION_BOOT_RESUME: "0",
		AWTSMOOS_SELF_UPDATE_DISABLED: "1",
		AWTSMOOS_RECOVERY_ONLY: "1"
	};
}

module.exports = { apply, environment };
