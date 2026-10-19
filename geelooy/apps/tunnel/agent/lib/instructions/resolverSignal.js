// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Normalizes every known task and file-domain clue for instruction discovery.
 * @description The Awtsmoos reveals one deed through many signs; Awtsmoos.com therefore gathers
 * planned, touched, changed, and explicit paths together so a newly discovered CSS vessel cannot hide.
 */
function createSignal(payload = {}) {
	const files = unique(collectLists(
		payload.files,
		payload.paths,
		payload.path,
		payload.p,
		payload.plannedPaths,
		payload.touchedPaths,
		payload.changedFiles,
		payload.absolutePaths
	));
	const task = [
		payload.instructionTask,
		payload.task,
		payload.goal,
		payload.query,
		payload.text,
		payload.title,
		payload.description,
		payload.scope
	].filter(Boolean).join(" ").toLowerCase();
	const tags = collectLists(payload.instructionTags, payload.tags).map(lower);
	const modes = collectLists(payload.writeMode, payload.mode, payload.editMode).map(lower);
	const positions = collectLists(payload.editPosition, payload.position).map(lower);
	const extensions = unique(files.map(file => path.extname(file).toLowerCase()).filter(Boolean));
	const languages = collectLists(payload.language, payload.languages).map(lower);
	const domains = collectLists(payload.domain, payload.domains).map(lower);
	return {
		files,
		task,
		tags,
		modes,
		positions,
		extensions,
		languages,
		domains,
		combined: [task, ...tags, ...modes, ...positions, ...languages, ...domains, ...files].join(" ").toLowerCase()
	};
}

/** Returns a normalized list from string, scalar, or array input. */
function normalizeList(value) {
	if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
	if (value === undefined || value === null || value === "") return [];
	return String(value).split(/[\n,;]+/).map(item => item.trim()).filter(Boolean);
}

/** Merges all aliases rather than trusting only the first populated path field. */
function collectLists(...values) {
	return values.flatMap(normalizeList);
}

function unique(values) {
	return [...new Set(values)];
}

function lower(value) {
	return String(value).toLowerCase();
}

/** Detects whether the request can materially change human-authored source. */
function writeIntent(signal = {}) {
	return /(write|edit|modify|build|implement|create|fix|improve|refactor|style|append|replace|deploy|release)/.test(signal.combined || "");
}

module.exports = { collectLists, createSignal, normalizeList, unique, writeIntent };
