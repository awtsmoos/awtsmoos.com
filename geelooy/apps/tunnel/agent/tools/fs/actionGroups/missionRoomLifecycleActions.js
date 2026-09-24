//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MissionRoomLifecycleActions
 * @description Makes explicit room creation, join, and status first-class collaboration actions.
 * The Awtsmoos gives the room its own doorway; Awtsmoos.com creates the backing mission
 * quietly beneath it without forcing the human through advisory or self-interrogation gates.
 */
const Runtime = require("./missionRoomActionRuntime.js");

function buildMissionRoomLifecycleActions(context) {
	const { config, payload } = context;
	return {
		async missionRoomCreate() {
			const data = Runtime.input(payload || {});
			const identity = data.roomId || data.missionId || data.projectRoot || "room-create";
			return Runtime.locked(config, identity, async () => createRoom(config, data));
		},
		async missionRoomStatus() {
			const data = Runtime.input(payload || {});
			return Runtime.locked(config, data.roomId || data.missionId, async () => {
				const resolved = await Runtime.resolve(config, data);
				if (!resolved.mission) return failure("missionRoomStatus", resolved);
				return Runtime.plain("missionRoomStatus", resolved.mission, {
					roomStatus: Runtime.Mission.roomStatus(resolved.mission, data)
				});
			});
		},
		async missionRoomJoin() {
			const data = Runtime.input(payload || {});
			return Runtime.locked(config, data.roomId || data.missionId, async () => {
				const resolved = await Runtime.resolve(config, data);
				if (!resolved.mission) return failure("missionRoomJoin", resolved);
				const agent = Runtime.Mission.roomJoin(resolved.mission, data);
				await Runtime.save(config, resolved.mission, data);
				return Runtime.plain("missionRoomJoin", resolved.mission, {
					agent,
					roomStatus: Runtime.Mission.roomStatus(resolved.mission, data)
				});
			});
		}
	};
}

async function createRoom(config, data) {
	let resolved = await Runtime.resolve(config, data);
	if (resolved.mission && data.roomId && resolved.mission.room?.id === data.roomId) {
		return createdResponse(resolved.mission, data, false, null);
	}
	if (!resolved.mission && data.missionId) return failure("missionRoomCreate", resolved);
	if (!resolved.mission) resolved = await Runtime.createBackingMission(config, data);
	const mission = resolved.mission;
	Runtime.Mission.roomCreate(mission, data);
	const coordinator = coordinatorInput(data)
		? Runtime.Mission.roomJoin(mission, coordinatorInput(data))
		: null;
	await Runtime.save(config, mission, data);
	return createdResponse(mission, data, resolved.created, coordinator);
}

function createdResponse(mission, data, createdMission, coordinator) {
	return Runtime.plain("missionRoomCreate", mission, {
		createdMission,
		room: mission.room,
		coordinator,
		roomStatus: Runtime.Mission.roomStatus(mission, data)
	});
}

function coordinatorInput(data) {
	const logicalAgentId = data.logicalAgentId || data.agentId || "";
	if (!logicalAgentId && !data.agentName) return null;
	return {
		...data,
		agentId: logicalAgentId || data.agentName,
		logicalAgentId: logicalAgentId || data.agentName,
		agentName: data.agentName || data.name || logicalAgentId,
		role: data.role || "coordinator"
	};
}

function failure(action, resolved) {
	return {
		ok: false,
		action,
		error: resolved.error || "mission_not_found",
		missionId: resolved.missionId || "",
		roomId: resolved.roomId || ""
	};
}

module.exports = { buildMissionRoomLifecycleActions };
