// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (10) Failure autopsy.
 * Failed missions write up what went wrong so it is never repeated.
 * New missions automatically receive the most relevant past lessons.
 */

const Store = require("./store.js");
const Model = require("./model.js");

async function record(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const actor = payload.actor || mission.assignee || "unknown";
	const autopsy = {
		at: Model.stamp(),
		by: Model.cleanText(actor, 200),
		whatWentWrong: Model.cleanText(payload.whatWentWrong || ""),
		cause: Model.cleanText(payload.cause || ""),
		lesson: Model.cleanText(payload.lesson || ""),
		missionId: mission.missionId,
		projectRoot: mission.projectRoot,
		title: mission.title,
		tags: mission.tags
	};
	if (!autopsy.whatWentWrong || !autopsy.lesson) {
		const error = new Error("Autopsy needs whatWentWrong and lesson.");
		error.code = "autopsy_incomplete";
		throw error;
	}
	mission.autopsy = autopsy;
	mission.status = "failed";
	await Store.saveMission(config, mission);
	await Store.recordAutopsy(config, autopsy);
	await Store.activity(config, { kind: "mission_failed", missionId: mission.missionId, by: actor, lesson: autopsy.lesson.slice(0, 200) });
	return mission;
}

/** Searchable past lessons — consulted at mission creation and on demand. */
async function lessons(config, filter = {}) {
	const all = await Store.readAutopsies(config);
	let out = all;
	if (filter.projectRoot) out = out.filter(a => a.projectRoot === filter.projectRoot);
	if (filter.tags && filter.tags.length) {
		const tags = new Set(filter.tags.map(String));
		out = out.filter(a => (a.tags || []).some(t => tags.has(t)));
	}
	if (filter.query) {
		const q = String(filter.query).toLowerCase();
		out = out.filter(a => `${a.whatWentWrong} ${a.cause} ${a.lesson} ${a.title}`.toLowerCase().includes(q));
	}
	out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
	return out.slice(0, filter.limit || 20);
}

module.exports = { record, lessons };
