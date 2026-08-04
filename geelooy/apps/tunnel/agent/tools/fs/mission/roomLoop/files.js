// B"H
// Boruch Hashem
// Blessed is He

function claimFile(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	room.fileClaims ||= [];
	const claim = {
		id: input.claimId || env.RoomState.id("file_claim"),
		at: env.RoomState.now(),
		agentId: env.RoomState.agentId(input),
		file: env.RoomState.text(input.file || input.path),
		purpose: env.RoomState.text(input.purpose || input.reason || "work"),
		status: "active"
	};
	room.fileClaims.push(claim);
	return { ok: true, claim, conflicts: fileConflicts(mission) };
}

function releaseFile(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const target = (room.fileClaims || []).find(claim =>
		claim.id === input.claimId ||
		(claim.file === input.file && claim.agentId === agentId && claim.status === "active")
	);
	if (!target) return { ok: false, error: "file_claim_not_found" };
	target.status = "released";
	target.releasedAt = env.RoomState.now();
	target.releaseNote = env.RoomState.text(input.note || "released");
	return { ok: true, claim: target, conflicts: fileConflicts(mission) };
}

function fileConflicts(mission) {
	const active = (mission.room?.fileClaims || []).filter(claim => claim.status === "active");
	const groups = new Map();
	for (const claim of active) {
		groups.set(claim.file, [...(groups.get(claim.file) || []), claim]);
	}
	return [...groups.entries()]
		.filter(([, list]) => new Set(list.map(claim => claim.agentId)).size > 1)
		.map(([file, list]) => ({
			file,
			agents: list.map(claim => claim.agentId),
			claimIds: list.map(claim => claim.id)
		}));
}

module.exports = { claimFile, fileConflicts, releaseFile };
