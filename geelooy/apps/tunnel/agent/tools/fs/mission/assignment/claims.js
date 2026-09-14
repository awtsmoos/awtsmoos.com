//B"H
//Boruch Hashem
//Blessed be He

const Mission = require("../index.js");
const Work = require("../workRegistry.js");

/**
 * @file Gives each open work node one durable disposable-session borrower.
 * @description
 * Missions own work forever; chats only hold exclusive claims while alive.
 * Replacements may inherit their predecessor's claim without reopening selection.
 */
function available(mission, session = {}) {
	return Work.open(mission).filter(item => claimable(item, session));
}

function claimable(item = {}, session = {}) {
	const owner = item.claim?.sessionId || "";
	return !owner || owner === session.id || owner === session.replacementOf;
}

function acquire(mission, workId, session = {}) {
	const item = Work.open(mission).find(entry => entry.id === workId);
	if (!item) return { ok: false, reason: "work_not_found" };
	if (!claimable(item, session)) {
		return { ok: false, reason: "work_already_claimed", item };
	}
	const previousOwner = item.claim?.sessionId || "";
	item.claim = {
		sessionId: session.id,
		logicalAgentId: session.logicalAgentId || "agent",
		claimedAt: previousOwner === session.id
			? item.claim?.claimedAt || new Date().toISOString()
			: new Date().toISOString(),
		inheritedFrom: previousOwner && previousOwner !== session.id
			? previousOwner
			: item.claim?.inheritedFrom || ""
	};
	item.owner = session.logicalAgentId || item.owner || "agent";
	if (item.state === "discovered") item.state = "claimed";
	item.updatedAt = new Date().toISOString();
	return {
		ok: true,
		item,
		inherited: Boolean(previousOwner && previousOwner !== session.id)
	};
}

function releaseInMission(mission, sessionId) {
	let released = 0;
	for (const item of Work.open(mission)) {
		if (item.claim?.sessionId !== sessionId) continue;
		item.claim = null;
		item.owner = "";
		if (item.state === "claimed") item.state = "discovered";
		item.updatedAt = new Date().toISOString();
		released += 1;
	}
	return released;
}

async function releaseSession(config, session = {}) {
	if (!session.activeMissionId || !session.id) return { ok: true, released: 0 };
	const mission = await Mission.load(config, session.activeMissionId);
	if (!mission) return { ok: true, released: 0 };
	const released = releaseInMission(mission, session.id);
	if (released) await Mission.save(config, mission);
	return { ok: true, released };
}

module.exports = {
	acquire,
	available,
	claimable,
	releaseInMission,
	releaseSession
};
