// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos sends measured light through named paths. These paths describe
 * where Awtsmoos.com may observe collections without guessing their absence.
 */

export const TELEMETRY_COUNT_PATHS = Object.freeze({
	tunnels: [
		["devices"],
		["tunnels"],
		["connectedDevices"],
		["connectedTunnels"],
		["result", "devices"]
	],
	childSessions: [
		["childSessions"],
		["tunnelChildSessions"],
		["result", "childSessions"]
	],
	shellSessions: [
		["shellSessions"],
		["shells"],
		["result", "shellSessions"]
	],
	browserTargets: [
		["pages"],
		["browserTargets"],
		["chromeTargets"],
		["result", "pages"]
	],
	agents: [
		["agents"],
		["missionAgents"],
		["result", "agents"]
	],
	rooms: [
		["rooms"],
		["missionRooms"],
		["result", "rooms"]
	],
	missions: [
		["missions"],
		["result", "missions"]
	],
	previews: [
		["previews"],
		["remotePreviews"],
		["result", "previews"]
	],
	processes: [
		["processes"],
		["result", "processes"]
	]
});

export const TELEMETRY_EXTRA_COUNT_KEYS = Object.freeze([
	"activeWorkers",
	"queuedActions",
	"supervisors",
	"failedWorkers",
	"leasedBrowsers"
]);
