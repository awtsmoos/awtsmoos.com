//B"H
//Boruch Hashem
//Blessed be He

const Mission = require("../index.js");
const Sessions = require("../agentSessionRegistry.js");
const Work = require("../workRegistry.js");
const Briefing = require("./briefing.js");
const Candidates = require("./candidates.js");
const Claims = require("./claims.js");
const Discovery = require("./discovery.js");
const Lock = require("./lock.js");
const Paths = require("./paths.js");

/**
 * @file Atomically assigns durable mission work to disposable agent sessions.
 * @description
 * Selection and claim creation share one short lock. Agents work concurrently only
 * after exclusive ownership is durable; replacements may inherit predecessor claims.
 */
async function next(config, session, input = {}) {
	return Lock.run(config, () => nextLocked(config, session, input));
}

async function nextLocked(config, session, input) {
	const selected = await select(config, session, input);
	const mission = selected.mission;
	if (!Work.open(mission).length && input.discover !== false) {
		Discovery.seed(mission, config, input);
	}
	const candidates = Claims.available(mission, session);
	const chosen = candidates[0] || null;
	if (chosen) {
		const claim = Claims.acquire(mission, chosen.id, session);
		if (!claim.ok) throw new Error(claim.reason || "work_claim_failed");
	}
	const anchors = Paths.ensure(config, mission, input);
	await Mission.save(config, mission);
	const briefing = Briefing.build(config, mission, {
		...input,
		workId: chosen?.id || ""
	});
	await Sessions.assign(config, session, {
		missionId: mission.id,
		workId: briefing.workId,
		projectRoot: anchors.projectRoot,
		reason: selected.reason
	});
	return result(selected, briefing, Boolean(chosen));
}

function result(selected, briefing, hasWork) {
	return {
		ok: true,
		action: "missionAgentNextWork",
		reason: hasWork ? selected.reason : "no_unclaimed_work",
		briefing,
		nextInstructionAction: briefing.instructionRequest,
		mustContinue: hasWork
	};
}

/** Selects the highest-ranked mission with work this session can actually borrow. */
async function select(config, session, input = {}) {
	const missions = await Mission.all(config);
	const ranked = Candidates.rank(config, missions, {
		...input,
		activeMissionId: session.activeMissionId
	});
	const usable = ranked.find(candidate => {
		return !candidate.open.length || Claims.available(candidate.mission, session).length;
	});
	const candidate = usable || ranked[0];
	if (candidate) {
		return {
			mission: candidate.mission,
			reason: selectionReason(candidate, input)
		};
	}
	const root = Paths.projectRoot(config, {}, input);
	const mission = await Mission.create(config, {
		goal: input.goal || `Discover and complete remaining work in ${root}`,
		auto: true,
		metadata: { projectRoot: root, autoDiscovered: true }
	});
	return { mission, reason: "created_discovery_mission" };
}

function selectionReason(candidate, input = {}) {
	if (input.missionId && candidate.mission.id === input.missionId) {
		return "explicit_mission";
	}
	if (input.projectRoot || input.root || input.directory) {
		return "matching_absolute_project_root";
	}
	if (candidate.open.length) {
		return "highest_priority_remaining_work";
	}
	return "mission_selected_for_fresh_discovery";
}

module.exports = {
	next,
	select,
	selectionReason
};
