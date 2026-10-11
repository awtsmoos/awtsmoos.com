// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — Mission Board durable store.
 * Plain JSON files beside device state (<stateRoot>/mission-board-v1), never in the repo.
 * Layout:
 *   projects/<safeProject>/missions/<missionId>.json
 *   capsules/<capsuleId>.json
 *   schedules/<scheduleId>.json
 *   templates/<templateId>.json        (custom templates; built-ins live in code)
 *   autopsies.jsonl
 *   activity.jsonl                    (append-only board activity for the dashboard)
 */

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Device = require("../../deviceStateRoot.js");
const Model = require("./model.js");

function root(config = {}) {
	return path.join(Device.awtsmoosRoot(config), "mission-board-v1");
}

function safe(value) {
	return String(value || "general").replace(/[^a-zA-Z0-9_.-]+/g, "_").slice(0, 160) || "general";
}

function missionDir(config, projectRoot) {
	return path.join(root(config), "projects", safe(projectRoot), "missions");
}

function missionPath(config, projectRoot, missionId) {
	return path.join(missionDir(config, projectRoot), `${safe(missionId)}.json`);
}

async function ensureDir(dir) { await fsp.mkdir(dir, { recursive: true }); }

async function readJson(file, fallback = null) {
	try { return JSON.parse(await fsp.readFile(file, "utf8")); }
	catch { return fallback; }
}

async function writeJson(file, value) {
	await ensureDir(path.dirname(file));
	const tmp = `${file}.tmp-${process.pid}`;
	await fsp.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
	await fsp.rename(tmp, file);
	return value;
}

async function activity(config, entry) {
	const file = path.join(root(config), "activity.jsonl");
	await ensureDir(path.dirname(file));
	await fsp.appendFile(file, JSON.stringify({ at: Model.stamp(), ...entry }) + "\n", "utf8");
}

async function saveMission(config, mission) {
	Model.touch(mission);
	const file = missionPath(config, mission.projectRoot, mission.missionId);
	await writeJson(file, mission);
	return mission;
}

/** Load a mission by id, scanning projects when projectRoot is unknown. */
async function loadMission(config, missionId, projectRoot = null) {
	const id = safe(missionId);
	if (projectRoot) {
		return readJson(missionPath(config, projectRoot, id), null);
	}
	const projectsDir = path.join(root(config), "projects");
	let projects = [];
	try { projects = await fsp.readdir(projectsDir); } catch { return null; }
	for (const project of projects) {
		const found = await readJson(path.join(projectsDir, project, "missions", `${id}.json`), null);
		if (found) return found;
	}
	return null;
}

async function listMissions(config, projectRoot) {
	const dir = missionDir(config, projectRoot);
	let files = [];
	try { files = await fsp.readdir(dir); } catch { return []; }
	const out = [];
	for (const file of files) {
		if (!file.endsWith(".json")) continue;
		const mission = await readJson(path.join(dir, file), null);
		if (mission) out.push(mission);
	}
	out.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
	return out;
}

async function listProjects(config) {
	const dir = path.join(root(config), "projects");
	try { return await fsp.readdir(dir); } catch { return []; }
}

/** Marketplace: every mission everywhere, filterable. */
async function listAllMissions(config, filter = {}) {
	const projects = await listProjects(config);
	let all = [];
	for (const project of projects) {
		const missions = await listMissions(config, project);
		all = all.concat(missions);
	}
	if (filter.status) all = all.filter(m => m.status === filter.status);
	if (filter.tags && filter.tags.length) {
		const tags = new Set(filter.tags.map(String));
		all = all.filter(m => (m.tags || []).some(t => tags.has(t)));
	}
	if (filter.skills && filter.skills.length) {
		const skills = new Set(filter.skills.map(String));
		all = all.filter(m => (m.skillsRequired || []).some(s => skills.has(s)));
	}
	if (filter.assignee) all = all.filter(m => m.assignee === filter.assignee);
	all.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
	return all;
}

// --- capsules ---
async function saveCapsule(config, capsule) {
	const file = path.join(root(config), "capsules", `${safe(capsule.capsuleId)}.json`);
	return writeJson(file, capsule);
}

async function loadCapsule(config, capsuleId) {
	return readJson(path.join(root(config), "capsules", `${safe(capsuleId)}.json`), null);
}

// --- schedules ---
async function saveSchedule(config, schedule) {
	const file = path.join(root(config), "schedules", `${safe(schedule.scheduleId)}.json`);
	return writeJson(file, schedule);
}

async function loadSchedule(config, scheduleId) {
	return readJson(path.join(root(config), "schedules", `${safe(scheduleId)}.json`), null);
}

async function listSchedules(config) {
	const dir = path.join(root(config), "schedules");
	let files = [];
	try { files = await fsp.readdir(dir); } catch { return []; }
	const out = [];
	for (const file of files) {
		if (!file.endsWith(".json")) continue;
		const s = await readJson(path.join(dir, file), null);
		if (s) out.push(s);
	}
	return out;
}

// --- custom templates ---
async function saveTemplate(config, template) {
	const file = path.join(root(config), "templates", `${safe(template.templateId)}.json`);
	return writeJson(file, template);
}

async function loadTemplate(config, templateId) {
	return readJson(path.join(root(config), "templates", `${safe(templateId)}.json`), null);
}

async function listCustomTemplates(config) {
	const dir = path.join(root(config), "templates");
	let files = [];
	try { files = await fsp.readdir(dir); } catch { return []; }
	const out = [];
	for (const file of files) {
		if (!file.endsWith(".json")) continue;
		const t = await readJson(path.join(dir, file), null);
		if (t) out.push(t);
	}
	return out;
}

// --- autopsies (global, searchable) ---
async function recordAutopsy(config, entry) {
	const file = path.join(root(config), "autopsies.jsonl");
	await ensureDir(path.dirname(file));
	await fsp.appendFile(file, JSON.stringify({ at: Model.stamp(), ...entry }) + "\n", "utf8");
}

async function readAutopsies(config) {
	const file = path.join(root(config), "autopsies.jsonl");
	let text = "";
	try { text = await fsp.readFile(file, "utf8"); } catch { return []; }
	return text.split("\n").filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
}

async function readActivity(config, limit = 100) {
	const file = path.join(root(config), "activity.jsonl");
	let text = "";
	try { text = await fsp.readFile(file, "utf8"); } catch { return []; }
	const lines = text.split("\n").filter(Boolean);
	return lines.slice(-limit).map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
}

module.exports = {
	root, safe, ensureDir,
	saveMission, loadMission, listMissions, listProjects, listAllMissions,
	saveCapsule, loadCapsule,
	saveSchedule, loadSchedule, listSchedules,
	saveTemplate, loadTemplate, listCustomTemplates,
	recordAutopsy, readAutopsies,
	activity, readActivity
};
