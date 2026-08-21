// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const PathGuard = require("../../pathGuard.js");

const MAX_FILES = 12;
const MAX_SCAN = 80;

/**
 * @file Resolves bounded successor handoff and thought references into absolute safe paths.
 * @description
 * The Awtsmoos remembers the exact vessel where a predecessor left its final light.
 * Awtsmoos.com follows only named handoffs and shallow known thought roots, then turns
 * every surviving reference into one canonical absolute path beneath immutable authority.
 */
function collect(config = {}, mission = {}, context = {}) {
	const authority = path.resolve(process.env.AWTSMOOS_PROJECT_ROOT || config.root || process.cwd());
	const projectRoot = path.resolve(context.projectRoot || mission.room?.projectRoot || mission.projectRoot || config.root || authority);
	const explicit = explicitCandidates(mission, context);
	const discovered = planningFiles(authority, projectRoot);
	const records = [...explicit, ...discovered]
		.map(value => safeAbsolute(authority, projectRoot, value))
		.filter(Boolean)
		.map(fileRecord)
		.filter(Boolean)
		.sort((left, right) => right.mtimeMs - left.mtimeMs);
	return [...new Map(records.map(item => [item.path, item])).values()]
		.slice(0, MAX_FILES)
		.map(item => item.path);
}

function explicitCandidates(mission, context) {
	const values = [];
	append(values, context.handoffPaths);
	appendKnown(values, context.latestHandoff);
	appendKnown(values, context.recoveryCheckpoint?.latestHandoff);
	for (const agent of allAgents(mission)) appendKnown(values, agent.lastOutcome);
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
	if (typeof candidate === "string" && candidate.trim()) values.push(candidate.trim());
}

function planningFiles(authority, projectRoot) {
	const roots = [
		path.join(authority, ".awtsmoos-agent-thoughts"),
		path.join(authority, "awtsmoos.com", "geelooy", "ai", "thoughts"),
		path.join(projectRoot, ".awtsmoos-agent-thoughts"),
		path.join(projectRoot, "geelooy", "ai", "thoughts")
	];
	const found = [];
	for (const root of new Set(roots)) walk(root, found, 0);
	return found.slice(0, MAX_SCAN);
}

function walk(root, found, depth) {
	if (depth > 3 || found.length >= MAX_SCAN) return;
	let entries = [];
	try {
		entries = fs.readdirSync(root, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (found.length >= MAX_SCAN) break;
		const target = path.join(root, entry.name);
		if (entry.isDirectory()) walk(target, found, depth + 1);
		else if (entry.isFile() && /\.(md|txt)$/i.test(entry.name)) found.push(target);
	}
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
