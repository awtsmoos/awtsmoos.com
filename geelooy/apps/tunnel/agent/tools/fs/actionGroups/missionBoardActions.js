// B"H
// Boruch Hashem
// Blessed is He

/** B"H: the mission board action group — the whole Mission OS through the virtual-OS tunnel. */
const Board = require("../mission/board/index.js");

function ok(action, extra = {}) { return { ok: true, action, ...extra }; }
function fail(action, error) {
	return { ok: false, action, error: error.code || "mission_error", detail: error.message };
}
const run = (action, fn, extra) => (...args) => Promise.resolve()
	.then(() => fn(...args))
	.then(result => ok(action, { ...(extra || {}), ...(result && typeof result === "object" && !Array.isArray(result) ? result : { result }) }))
	.catch(error => fail(action, error));

function buildMissionBoardActions({ config, payload }) {
	const p = payload || {};
	return {
		// --- core board ---
		missionBoardList: run("missionBoardList", () => Board.board(config, p.projectRoot), {}),
		missionBoardCreate: run("missionBoardCreate", async () => {
			const mission = await Board.create(config, p);
			if (p.checkpoints && p.checkpoints.length) {
				const Model = require("../mission/board/model.js");
				mission.checkpoints = p.checkpoints.map(c => Model.checkpoint(c));
				await Board.Store.saveMission(config, mission);
			}
			return { mission };
		}),
		missionBoardGet: run("missionBoardGet", () => Board.get(config, p.missionId, p.projectRoot)),
		missionBoardClaim: run("missionBoardClaim", () => Board.claim(config, p)),
		missionBoardAssign: run("missionBoardAssign", () => Board.assign(config, p)),
		missionBoardRelease: run("missionBoardRelease", () => Board.release(config, p)),
		missionBoardContext: run("missionBoardContext", () => Board.context(config, p.missionId, p.projectRoot)),
		missionBoardProgress: run("missionBoardProgress", () => Board.setProgress(config, p)),
		missionBoardNote: run("missionBoardNote", () => Board.addNote(config, p)),
		missionBoardCheckpointAdd: run("missionBoardCheckpointAdd", () => Board.addCheckpoint(config, p)),
		missionBoardCheckpointComplete: run("missionBoardCheckpointComplete", () => Board.completeCheckpoint(config, p)),

		// (1) marketplace
		missionMarketplaceList: run("missionMarketplaceList", () => Board.marketplace(config, {
			tags: p.tags, skills: p.skills || p.skillsRequired, projectRoot: p.projectRoot, assignee: p.assignee
		})),

		// (2) capsules
		missionCapsuleCreate: run("missionCapsuleCreate", () => Board.capsuleCreate(config, p)),
		missionCapsuleLoad: run("missionCapsuleLoad", () => Board.capsuleLoad(config, p.capsuleId)),

		// (3) templates
		missionTemplateList: run("missionTemplateList", () => Board.templateList(config)),
		missionTemplateInstantiate: run("missionTemplateInstantiate", async () => {
			const blueprint = await Board.templateInstantiate(config, p.templateId, p.params || {});
			const mission = await Board.create(config, {
				actor: p.actor, projectRoot: p.projectRoot || "general",
				title: p.title || blueprint.title, goal: blueprint.goal,
				tags: blueprint.tags, skillsRequired: blueprint.skillsRequired,
				templateId: blueprint.templateId
			});
			const Model = require("../mission/board/model.js");
			for (const c of blueprint.checkpoints || []) mission.checkpoints.push(Model.checkpoint(c));
			await Board.Store.saveMission(config, mission);
			return { mission, blueprint };
		}),

		// (4) swarm
		missionSwarmSplit: run("missionSwarmSplit", () => Board.swarmSplit(config, p)),
		missionSwarmMerge: run("missionSwarmMerge", () => Board.swarmMerge(config, p)),

		// (5) scheduler
		missionScheduleCreate: run("missionScheduleCreate", () => Board.scheduleCreate(config, p)),
		missionScheduleList: run("missionScheduleList", () => Board.scheduleList(config)),
		missionScheduleTick: run("missionScheduleTick", () => Board.scheduleTick(config, p)),

		// (7) lifecycle
		missionPause: run("missionPause", () => Board.pause(config, p)),
		missionResume: run("missionResume", () => Board.resume(config, p)),
		missionComplete: run("missionComplete", () => Board.complete(config, p)),
		missionFail: run("missionFail", () => Board.fail(config, p)),

		// (8) chaining
		missionChainAdd: run("missionChainAdd", () => Board.chainAdd(config, p)),

		// (9) messages
		missionMessageSend: run("missionMessageSend", () => Board.messageSend(config, p)),
		missionMessageInbox: run("missionMessageInbox", () => Board.messageInbox(config, p)),

		// (10) autopsy
		missionAutopsyLessons: run("missionAutopsyLessons", () => Board.autopsyLessons(config, p)),

		// (11) voice
		missionVoiceDictate: run("missionVoiceDictate", () => Board.voiceDictate(config, p)),

		// (12) federation
		missionFederationExport: run("missionFederationExport", () => Board.federationExport(config, p)),
		missionFederationImport: run("missionFederationImport", () => Board.federationImport(config, p)),

		// (6) dashboard
		missionDashboardSnapshot: run("missionDashboardSnapshot", () => Board.dashboardSnapshot(config)),
		missionDashboardPage: run("missionDashboardPage", async () => {
			const html = await Board.dashboardPage(config);
			const path = require("node:path");
			const file = path.join(Board.Store.root(config), "dashboard.html");
			await Board.Store.ensureDir(path.dirname(file));
			await require("node:fs/promises").writeFile(file, html, "utf8");
			return { path: file, bytes: html.length };
		})
	};
}

module.exports = { buildMissionBoardActions };
