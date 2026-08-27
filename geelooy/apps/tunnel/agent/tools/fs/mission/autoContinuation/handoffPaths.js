// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Discovery = require("./handoffDiscovery.js");
const PathGuard = require("../../pathGuard.js");

const MAX_FILES = 12;

/**
 * @file Resolves handoff evidence only inside the living project root.
 * @description
 * The Awtsmoos remembers unfinished meaning without enthroning an old machine address;
 * Awtsmoos.com accepts named handoffs only beneath today's project root and joins them with
 * shallow current-root discovery, so sibling worktrees cannot masquerade as present authority.
 */
function collect(config = {}, mission = {}, context = {}) {
	const projectRoot = path.resolve(
		context.projectRoot || mission.room?.projectRoot ||
		mission.projectRoot || config.root || process.cwd()
	);
	const records = [
		...explicitCandidates(mission, context),
		...Discovery.planningFiles(projectRoot)
	]
		.map((value) => safeAbsolute(projectRoot, projectRoot, value))
		.filter(Boolean)
		.map(fileRecord)
		.filter(Boolean)
		.sort((left, right) => right.mtimeMs - left.mtimeMs);
	return [...new Map(records.map((item) => [item.path, item])).values()]
		.slice(0, MAX_FILES)
		.map((item) => item.path);
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
		if (!/handoff|complete/i.test(String(event.type || ""))) continue;
		appendKnown(values, event.data);
	}
	return values;
}

function appendKnown(values, source = {}) {
	if (!source || typeof source !== "object") return;
	for (const key of ["handoffPaths", "planningFiles", "files", "references", "paths"]) {
		append(values, source[key]);
	}
}

function append(values, candidate) {
	if (Array.isArray(candidate)) {
		for (const item of candidate) append(values, item);
		return;
	}
	if (typeof candidate === "string" && candidate.trim()) {
		values.push(candidate.trim());
	}
}

function planningFiles(_authority, projectRoot) {
	return Discovery.planningFiles(projectRoot);
}

function safeAbsolute(_authority, projectRoot, value) {
	try {
		const candidate = path.isAbsolute(value) ? value : path.resolve(projectRoot, value);
		return PathGuard.safePath({ root: projectRoot }, candidate);
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
