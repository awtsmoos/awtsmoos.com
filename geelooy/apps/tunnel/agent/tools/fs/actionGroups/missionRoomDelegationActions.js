//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MissionRoomDelegationActions
 * @description Makes public agent delegation reserve one durable room member before spawn.
 * The Awtsmoos sends many messengers without dividing their names; Awtsmoos.com records
 * the logical Shliach first, then lets a disposable browser session carry that same identity.
 */
const Runtime = require("./missionRoomActionRuntime.js");
const SessionSpawner = require("./missionSessionSpawner.js");

function buildMissionRoomDelegationActions(context, buildActions) {
	const { config, payload, ws } = context;
	return {
		async missionAgentDelegate() {
			const data = Runtime.input(payload || {});
			const identity = data.roomId || data.missionId;
			return Runtime.locked(config, identity, async () => delegate({
				buildActions,
				config,
				data,
				ws
			}));
		}
	};
}

async function delegate({ buildActions, config, data, ws }) {
	const resolved = await Runtime.resolve(config, data);
	if (!resolved.mission) return failure(resolved);
	const mission = resolved.mission;
	const memberInput = logicalMemberInput(data, mission);
	if (!memberInput.logicalAgentId) {
		return { ok: false, action: "missionAgentDelegate", error: "missing_logical_agent_id", missionId: mission.id, roomId: mission.room?.id || "" };
	}
	const reserved = Runtime.Mission.roomJoin(mission, memberInput);
	reserved.status = shouldSpawn(data) ? "launching" : "reserved";
	reserved.lifecycle = reserved.status;
	await Runtime.save(config, mission, data);
	if (!shouldSpawn(data)) return response(mission, data, reserved, { ok: true, skipped: true });
	const launch = await SessionSpawner.spawn(buildActions, config, ws, null, {
		...data,
		missionId: mission.id,
		roomId: mission.room.id,
		logicalAgentId: memberInput.logicalAgentId,
		agentName: memberInput.agentName,
		role: memberInput.role,
		projectRoot: mission.room.projectRoot || data.projectRoot || config.root
	});
	const agent = launch.ok
		? activateMember(mission, memberInput, launch)
		: failMember(mission, reserved, launch);
	await Runtime.save(config, mission, data);
	return response(mission, data, agent, launch);
}

function logicalMemberInput(data, mission) {
	const logicalAgentId = String(data.logicalAgentId || data.agentId || data.agentName || "").trim();
	return {
		...data,
		agentId: logicalAgentId,
		logicalAgentId,
		agentName: data.agentName || data.name || logicalAgentId,
		role: data.role || "collaborator",
		roomId: mission.room?.id || data.roomId
	};
}

function activateMember(mission, memberInput, launch) {
	return Runtime.Mission.roomJoin(mission, {
		...memberInput,
		agentSessionId: launch.sessionId,
		status: "active"
	});
}

function failMember(mission, reserved, launch) {
	const stored = mission.room?.agents?.[reserved.agentId] || reserved;
	stored.status = "launch_failed";
	stored.lifecycle = "launch_failed";
	stored.launchError = String(launch.error || "launch_failed").slice(0, 2000);
	stored.lastSeenAt = new Date().toISOString();
	return stored;
}

function response(mission, data, agent, launch) {
	return Runtime.plain("missionAgentDelegate", mission, {
		agent,
		launch,
		roomStatus: Runtime.Mission.roomStatus(mission, data)
	});
}

function failure(resolved) {
	return { ok: false, action: "missionAgentDelegate", error: resolved.error || "mission_not_found", missionId: resolved.missionId || "", roomId: resolved.roomId || "" };
}

function shouldSpawn(data) {
	return data.spawn !== false && data.launch !== false && data.spawn !== "false" && data.launch !== "false";
}

module.exports = { buildMissionRoomDelegationActions };
