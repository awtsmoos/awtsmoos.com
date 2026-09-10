//B"H
//Boruch Hashem
//Blessed be He

const path = require("node:path");

/**
 * @file Matches server instruction records against bounded task evidence.
 * @description
 * The Awtsmoos turns many small task signs into one deterministic instruction selection.
 * Baseline records remain visible while deeper records reveal themselves only when relevant.
 */
function resolve(records = [], evidence = {}) {
	const signal = normalizeEvidence(evidence);
	return records.filter((record) => {
		return record.baseline === true || matches(record, signal);
	});
}

/** Returns whether one instruction record matches at least one declarative applicability signal. */
function matches(record = {}, signal = {}) {
	const applies = record.applies || {};
	return [
		matchAny(applies.extensions, signal.extensions),
		matchHints(applies.pathHints, signal.files),
		matchHints(applies.taskHints, [signal.combined]),
		matchAny(applies.languages, signal.languages),
		matchAny(applies.modes, signal.modes),
		matchAny(record.tags, signal.tags)
	].some(Boolean);
}

/** Normalizes bounded task evidence without trusting caller-provided derived fields. */
function normalizeEvidence(value = {}) {
	const files = list(value.files || value.paths || value.path);
	const task = text(value.task || value.goal || value.query || value.text, 2000);
	const tags = list(value.tags);
	const modes = list(value.modes || value.mode);
	const languages = list(value.languages || value.language);
	const extensions = files
		.map((file) => path.extname(file).toLowerCase())
		.concat(list(value.extensions))
		.filter(Boolean);
	return {
		files,
		task: task.toLowerCase(),
		tags,
		modes,
		languages,
		extensions,
		combined: [task, ...files, ...tags, ...modes, ...languages].join(" ").toLowerCase()
	};
}
/** Returns true when normalized expected and actual values share one exact member. */
function matchAny(expected = [], actual = []) {
	const actualSet = new Set(list(actual));
	return list(expected).some((value) => actualSet.has(value));
}

/** Returns true when one normalized hint appears inside one normalized candidate. */
function matchHints(hints = [], candidates = []) {
	return list(hints).some((hint) => {
		return list(candidates).some((candidate) => candidate.includes(hint));
	});
}

/** Converts scalar, array, or delimited input into a small normalized unique list. */
function list(value) {
	const source = Array.isArray(value)
		? value
		: String(value || "").split(/[\n,;]+/);
	return [...new Set(source
		.map((item) => text(item, 500).toLowerCase())
		.filter(Boolean))]
		.slice(0, 64);
}

/** Bounds one untrusted text field before it enters matching or logging. */
function text(value, limit) {
	return String(value || "").trim().slice(0, limit);
}

module.exports = {
	list,
	matchAny,
	matchHints,
	matches,
	normalizeEvidence,
	resolve,
	text
};