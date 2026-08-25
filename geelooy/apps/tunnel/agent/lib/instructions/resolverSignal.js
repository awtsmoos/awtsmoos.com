// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Normalizes task, path, extension, language, write mode, and edit-position evidence.
 * @description
 * The Awtsmoos lets one deed reveal its character through many small signs.
 * Awtsmoos.com gathers those signs once so instruction discovery stays data-based and testable.
 */
function createSignal(payload = {}) {
	const files = normalizeList(
		payload.files || payload.paths || payload.path || payload.p || []
	);
	const task = [
		payload.instructionTask,
		payload.task,
		payload.goal,
		payload.query,
		payload.text
	].filter(Boolean).join(" ").toLowerCase();
	const tags = normalizeList(payload.instructionTags || payload.tags)
		.map((value) => value.toLowerCase());
	const modes = normalizeList(
		payload.writeMode || payload.mode || payload.editMode || []
	).map((value) => value.toLowerCase());
	const positions = normalizeList(
		payload.editPosition || payload.position || []
	).map((value) => value.toLowerCase());
	const extensions = files
		.map((file) => path.extname(file).toLowerCase())
		.filter(Boolean);
	const languages = normalizeList(payload.language || payload.languages)
		.map((value) => value.toLowerCase());

	return {
		files,
		task,
		tags,
		modes,
		positions,
		extensions,
		languages,
		combined: [
			task,
			...tags,
			...modes,
			...positions,
			...languages,
			...files
		].join(" ").toLowerCase()
	};
}

/** Returns a normalized list from string, scalar, or array input. */
function normalizeList(value) {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}
	if (value === undefined || value === null || value === "") return [];
	return String(value)
		.split(/[\n,;]+/)
		.map((item) => item.trim())
		.filter(Boolean);
}

/** Detects whether the request can materially change human-authored source. */
function writeIntent(signal = {}) {
	return /(write|edit|modify|build|implement|create|fix|improve|refactor|style|append|replace|deploy|release)/
		.test(signal.combined || "");
}

module.exports = {
	createSignal,
	normalizeList,
	writeIntent
};
