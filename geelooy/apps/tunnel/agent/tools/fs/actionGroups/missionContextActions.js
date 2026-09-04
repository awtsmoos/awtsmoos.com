// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Mission = require("../mission/index.js");
const Collaboration = require("../mission/collaboration.js");
const RootRegistry = require("../mission/projectRootRegistry.js");
const Payload = require("./missionActionPayload.js");
const Projection = require("./missionContextProjection.js");

/**
 * @file Exposes one project consciousness through many friendly tunnel names.
 * @description
 * The Awtsmoos is one though callers arrive through many names at the gate;
 * Awtsmoos.com gives every fresh agent the same durable mission state.
 */
function sameRoot(left, right) {
	return Boolean(left && right && path.resolve(String(left)) === path.resolve(String(right)));
}

/** Finds the newest mission whose durable records belong to the physical checkout. */
async function findProjectMission(config, payload) {
	const projectRoot = Payload.mergedPayload(payload).projectRoot || "";
	const missions = await Mission.all(config);
	const matches = missions.filter(mission => {
		const binding = RootRegistry.read(config, mission.id);
		const roots = [binding?.projectRoot, mission.metadata?.projectRoot, mission.collaboration?.projectRoot];
		return roots.some(root => sameRoot(root, projectRoot));
	});
	matches.sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")));
	return { mission: matches[0] || null, matches, projectRoot };
}

/** Registers/refreshes the requesting agent before projecting shared state. */
async function currentContext(config, payload) {
	const found = await findProjectMission(config, payload);
	if (!found.mission) {
		return {
			ok: true,
			project: { root: found.projectRoot },
			mission: null,
			remainingWork: [],
			nextActions: [{ action: "missionStart", projectRoot: found.projectRoot }],
			mustContinue: true
		};
	}
	const agentId = payload.logicalAgentId || payload.agentId || "";
	if (agentId) {
		Collaboration.heartbeat(found.mission, {
			...payload,
			agentId,
			projectRoot: found.projectRoot,
			status: "syncing",
			currentAction: payload.action || "missionContext"
		});
		await Mission.save(config, found.mission);
	}
	return {
		ok: true,
		...Projection.project(found.mission, {
			Mission,
			Collaboration,
			projectRoot: found.projectRoot
		})
	};
}

/** Builds aliases whose action label changes while their machine-readable context stays one. */
function buildMissionContextActions(context) {
	const { config } = context;
	const payload = Payload.mergedPayload(context.payload || {});
	const alias = action => async () => ({ ...(await currentContext(config, { ...payload, action })), action });
	return {
		missionContext: alias("missionContext"),
		missionCurrentWork: alias("missionCurrentWork"),
		projectContext: alias("projectContext"),
		whatAreWeWorkingOn: alias("whatAreWeWorkingOn"),
		remainingWork: alias("remainingWork"),
		nextWork: alias("nextWork"),
		missionProjectStatus: alias("missionProjectStatus"),
		missionProjectDiscover: alias("missionProjectDiscover")
	};
}

module.exports = { buildMissionContextActions, currentContext, findProjectMission };
