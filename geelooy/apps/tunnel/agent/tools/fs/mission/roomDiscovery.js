// B"H

function around(missions = [], input = {}, environment, registry = null) {
	const query = normalize(input.projectRoot || input.root || input.directory || input.path || input.q || "");
	const fromMissions = missions
		.filter(mission => mission.room || mission.collaboration)
		.map(mission => scoreMission(mission, query));
	const fromRegistry = (registry?.rooms || []).map(room => scoreRoom(room, query));
	const rooms = dedupe([...fromMissions, ...fromRegistry])
		.filter(room => room.score > 0 || !query)
		.sort((left, right) => right.score - left.score || String(right.updatedAt).localeCompare(String(left.updatedAt)));
	const nextSuggestedToolCall = rooms[0]
		? {
			action: "missionRoomJoin",
			missionId: rooms[0].missionId,
			agentId: input.agentId || "agent",
			role: input.role || "joining existing room"
		}
		: null;
	return {
		query,
		count: rooms.length,
		rooms,
		registryCount: fromRegistry.length,
		nextSuggestedToolCall,
		mustCallNext: nextSuggestedToolCall
	};
}

function scoreMission(mission, query) {
	const room = mission.room || {};
	const values = [
		room.projectRoot,
		mission.metadata?.projectRoot,
		mission.metadata?.root,
		mission.goal,
		mission.id
	].map(normalize).filter(Boolean);
	return pack({
		missionId: mission.id,
		roomId: room.id || "",
		name: room.name || mission.goal,
		projectRoot: room.projectRoot || mission.metadata?.projectRoot || "",
		updatedAt: mission.updatedAt,
		agents: Object.keys(room.agents || {}).length,
		messages: (room.messages || []).length,
		subMissions: (room.subMissions || []).length
	}, values, query);
}

function scoreRoom(room, query) {
	const values = [room.projectRoot, room.name, room.roomId, room.missionId]
		.map(normalize)
		.filter(Boolean);
	return pack({
		missionId: room.missionId,
		roomId: room.roomId,
		name: room.name,
		projectRoot: room.projectRoot,
		updatedAt: room.updatedAt,
		agents: (room.agents || []).length,
		messages: room.messages || 0,
		subMissions: room.subMissions || 0,
		source: "central_registry"
	}, values, query);
}

function pack(base, values, query) {
	const exact = values.some(value => value === query) ? 100 : 0;
	const contains = values.some(value => query && (value.includes(query) || query.includes(value))) ? 50 : 0;
	const depth = Math.max(0, ...values.map(value => commonPrefix(value, query).length));
	return { ...base, score: exact + contains + depth };
}

function dedupe(items) {
	const rooms = new Map();
	for (const item of items) {
		const key = item.roomId || item.missionId;
		if (!rooms.has(key) || rooms.get(key).score < item.score) rooms.set(key, item);
	}
	return [...rooms.values()];
}

function normalize(value) {
	return String(value || "").trim().toLowerCase().replace(/\/+$/, "");
}

function commonPrefix(left, right) {
	let index = 0;
	while (index < left.length && index < right.length && left[index] === right[index]) index += 1;
	return left.slice(0, index);
}

module.exports = { around };
