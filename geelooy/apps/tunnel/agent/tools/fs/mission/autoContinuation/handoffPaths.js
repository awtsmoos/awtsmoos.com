// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const PathGuard = require("../../pathGuard.js");
const PlanningRoots = require("./planningRoots.js");

const MAX_FILES = 12;

/**
 * @file Resolves successor handoffs into bounded absolute paths without losing the living plan.
 * @description
 * The Awtsmoos remembers the exact vessel where a predecessor left its final light;
 * Awtsmoos.com ranks explicit, project, mission, then legacy paths so the nearest truth stays bright.
 */
function collect(config = {}, mission = {}, context = {}) {
	const authority = path.resolve(process.env.AWTSMOOS_PROJECT_ROOT || config.root || process.cwd());
	const projectRoot = path.resolve(
		context.projectRoot || mission.room?.projectRoot || mission.projectRoot || config.root || authority
	);
	const discovered = PlanningRoots.discover(authority, projectRoot, mission);
	const tiers = [
		explicitCandidates(mission, context),
		discovered.project,
		discovered.mission,
		discovered.legacy
	];
	const records = [];
	for (const tier of tiers) {
		records.push(...tierRecords(authority, projectRoot, tier));
	}
	return [...new Map(records.map(item => [item.path, item])).values()]
		.slice(0, MAX_FILES)
		.map(item => item.path);
}

/** Preserves tier precedence while allowing recent files to lead inside each discovery ring. */
function tierRecords(authority, projectRoot, values) {
	return values
		.map(value => safeAbsolute(authority, projectRoot, value))
		.filter(Boolean)
		.map(fileRecord)
		.filter(Boolean)
		.sort((left, right) => right.mtimeMs - left.mtimeMs);
}

function explicitCandidates(mission, context) {
	const values = [];
	append(values, context.handoffPaths);
	appendKnown(values, context.latestHandoff);
	appendKnown(values, context.recoveryCheckpoint?.latestHandoff);
	for (const agent of allAgents(mission)) {
		appendKnown(values, agent.lastOutcome);
	}
	const events = Array.isArray(mission.events) ? mission.events.slice(-50) : [];
	for (const event of events) {
		if (/handoff|complete/i.test(String(event.type || ""))) {
			appendKnown(values, event.data);
		}
	}
	return values;
}

function appendKnown(values, source = {}) {
	if (!source || typeof source !== "object") {
		return;
	}
	for (const key of ["handoffPaths", "planningFiles", "files", "references", "paths"]) {
		append(values, source[key]);
	}
}

function append(values, candidate) {
	if (Array.isArray(candidate)) {
		for (const item of candidate) {
			append(values, item);
		}
		return;
	}
	if (typeof candidate === "string" && candidate.trim()) {
		values.push(candidate.trim());
	}
}

function planningFiles(authority, projectRoot, mission = {}) {
	const discovered = PlanningRoots.discover(authority, projectRoot, mission);
	return [...discovered.project, ...discovered.mission, ...discovered.legacy];
}

function safeAbsolute(authority, projectRoot, value) {
	try {
		const candidate = path.isAbsolute(value) ? value : path.resolve(projectRoot, value);
		return PathGuard.safePath({ root: authority }, candidate);
	} catch {
		return "";
	}
}

function fileRecord(target) {
	try {
		const stat = fs.statSync(target);
		return stat.isFile() ? { path: target, mtimeMs: stat.mtimeMs } : null;
	} catch {
		return null;
	}
}

function allAgents(mission) {
	return [
		...Object.values(mission.room?.agents || {}),
		...Object.values(mission.collaboration?.agents || {})
	];
}

module.exports = { MAX_FILES, collect, explicitCandidates, planningFiles, safeAbsolute };
