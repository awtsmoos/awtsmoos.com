// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (5) Scheduled missions.
 * Recurring clock-based work: a schedule names a template (or a mission
 * blueprint) plus an interval. Every tick, due schedules spawn a fresh
 * mission that carries over context — the previous run's notes, progress
 * summary, and newest capsule — so nothing is ever lost between runs.
 */

const Store = require("./store.js");
const Model = require("./model.js");
const Templates = require("./templates.js");
const Capsules = require("./capsules.js");
const Service = require("./service.js");

function parseInterval(payload = {}) {
	if (payload.intervalSec) return Math.max(60, Number(payload.intervalSec));
	const every = String(payload.every || "").toLowerCase().trim();
	const match = every.match(/^(\d+)\s*(m|min|mins|minute|minutes|h|hour|hours|d|day|days|w|week|weeks)$/);
	if (!match) return null;
	const n = Number(match[1]);
	const unit = { m: 60, min: 60, mins: 60, minute: 60, minutes: 60, h: 3600, hour: 3600, hours: 3600, d: 86400, day: 86400, days: 86400, w: 604800, week: 604800, weeks: 604800 }[match[2]];
	return n * unit;
}

async function create(config, payload = {}) {
	const intervalSec = parseInterval(payload);
	if (!intervalSec) {
		const error = new Error("Schedule needs every: e.g. '30m', '6h', '1d', '1w' (or intervalSec).");
		error.code = "interval_required";
		throw error;
	}
	const actor = payload.actor || "unknown";
	let blueprint = null;
	if (payload.templateId) {
		blueprint = await Templates.instantiate(config, payload.templateId, payload.params || {});
	} else if (payload.title) {
		blueprint = {
			title: Model.cleanText(payload.title, 300),
			goal: Model.cleanText(payload.goal || ""),
			tags: Model.cleanList(payload.tags),
			skillsRequired: Model.cleanList(payload.skillsRequired),
			templateId: null
		};
	} else {
		const error = new Error("Schedule needs templateId or title.");
		error.code = "blueprint_required";
		throw error;
	}
	const now = Date.now();
	const schedule = {
		scheduleId: Model.id("sched"),
		name: Model.cleanText(payload.name || blueprint.title, 300),
		projectRoot: Model.cleanText(payload.projectRoot || "general", 300),
		blueprint,
		params: payload.params || {},
		intervalSec,
		nextRunAt: new Date(now + intervalSec).toISOString(),
		lastRunAt: null,
		lastMissionId: null,
		runCount: 0,
		carryContext: payload.carryContext !== false,
		createdBy: Model.cleanText(actor, 200),
		createdAt: Model.stamp(),
		active: true
	};
	await Store.saveSchedule(config, schedule);
	await Store.activity(config, { kind: "schedule_created", scheduleId: schedule.scheduleId, name: schedule.name, every: payload.every || `${intervalSec}s`, by: actor });
	return schedule;
}

async function list(config) {
	return Store.listSchedules(config);
}

async function setActive(config, scheduleId, active, actor) {
	const schedule = await Store.loadSchedule(config, scheduleId);
	if (!schedule) {
		const error = new Error(`No schedule ${scheduleId}.`);
		error.code = "schedule_not_found";
		throw error;
	}
	schedule.active = !!active;
	await Store.saveSchedule(config, schedule);
	return schedule;
}

/** Carry context forward: previous run's summary, notes tail, newest capsule. */
async function carryOver(config, schedule) {
	if (!schedule.carryContext || !schedule.lastMissionId) return null;
	const prev = await Store.loadMission(config, schedule.lastMissionId, schedule.projectRoot);
	if (!prev) return null;
	const capsule = await Capsules.latest(config, prev.missionId, prev.projectRoot).catch(() => null);
	return {
		previousMissionId: prev.missionId,
		previousStatus: prev.status,
		previousSummary: prev.progress.summary,
		previousNotes: prev.notes.slice(-10),
		previousCapsuleId: capsule ? capsule.capsuleId : null,
		previousAutopsy: prev.autopsy
	};
}

/** Tick: spawn missions for every due, active schedule. */
async function tick(config, payload = {}) {
	const now = Date.now();
	const schedules = await Store.listSchedules(config);
	const spawned = [];
	for (const schedule of schedules) {
		if (!schedule.active) continue;
		if (new Date(schedule.nextRunAt).getTime() > now && !payload.force) continue;
		const carried = await carryOver(config, schedule);
		const mission = await Service.create(config, {
			actor: `scheduler:${schedule.scheduleId}`,
			projectRoot: schedule.projectRoot,
			title: `${schedule.blueprint.title} — run ${schedule.runCount + 1}`,
			goal: schedule.blueprint.goal,
			tags: [...new Set([...(schedule.blueprint.tags || []), "scheduled"])],
			skillsRequired: schedule.blueprint.skillsRequired,
			templateId: schedule.blueprint.templateId,
			spawnedFrom: schedule.lastMissionId
		});
		if (carried) {
			mission.notes.push(Model.note({
				by: `scheduler:${schedule.scheduleId}`,
				text: `Context carried from previous run ${carried.previousMissionId} [${carried.previousStatus}]: ${carried.previousSummary || "(no summary)"}${carried.previousCapsuleId ? ` — resume capsule ${carried.previousCapsuleId}.` : ""}`
			}));
			mission.priorContext = carried;
			await Store.saveMission(config, mission);
		}
		schedule.lastRunAt = Model.stamp();
		schedule.lastMissionId = mission.missionId;
		schedule.runCount += 1;
		schedule.nextRunAt = new Date(now + schedule.intervalSec).toISOString();
		await Store.saveSchedule(config, schedule);
		await Store.activity(config, { kind: "schedule_fired", scheduleId: schedule.scheduleId, missionId: mission.missionId, run: schedule.runCount });
		spawned.push({ schedule, mission, carried });
	}
	return spawned;
}

module.exports = { create, list, setActive, tick, carryOver, parseInterval };
