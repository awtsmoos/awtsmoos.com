//B"H
//Boruch Hashem
//Blessed be He

const Dynamic = require("./instructionDynamicFile.js");
const Match = require("./instructionMatch.js");
const Record = require("./instructionRecord.js");
const { runtimeInstructions } = require("./instructionDefaultsRuntime.js");
const { workInstructions } = require("./instructionDefaultsWork.js");

const PROTOCOL_VERSION = 1;
const DEFAULTS = Object.freeze([
	...workInstructions,
	...runtimeInstructions
]);

/**
 * @file Presents one versioned server instruction catalog from defaults plus dynamic overlay.
 * @description
 * The Awtsmoos keeps baseline law stable while a bounded server file may renew selected records.
 * Every catalog generation is content-addressed so agents can reject stale or mismatched details.
 */
function snapshot(options = {}) {
	const byId = new Map();
	for (const source of DEFAULTS) {
		const record = Record.normalize(source);
		if (record) byId.set(record.id, record);
	}
	for (const record of Dynamic.loadDynamic(options)) {
		byId.set(record.id, record);
	}
	const records = [...byId.values()].sort((left, right) => {
		return left.id.localeCompare(right.id);
	});
	const headlines = records.map(Record.headline);
	const digest = Record.digest(headlines);
	return {
		records,
		headlines,
		digest,
		generation: digest.slice(0, 24)
	};
}

/** Returns the tiny registration advertisement without any full instruction body. */
function index(options = {}) {
	const value = snapshot(options);
	return {
		protocolVersion: PROTOCOL_VERSION,
		generation: value.generation,
		digest: value.digest,
		count: value.records.length,
		headlines: value.headlines.filter((record) => record.baseline === true)
	};
}
/** Resolves applicable compact headlines from bounded task evidence. */
function resolve(evidence = {}, options = {}) {
	const value = snapshot(options);
	return {
		generation: value.generation,
		digest: value.digest,
		headlines: Match.resolve(value.records, evidence).map(Record.headline)
	};
}

/** Returns full records only for explicitly requested stable IDs. */
function get(ids = [], options = {}) {
	const value = snapshot(options);
	const requested = normalizeIds(ids);
	const byId = new Map(value.records.map((record) => [record.id, record]));
	const instructions = requested
		.map((id) => byId.get(id))
		.filter(Boolean);
	return {
		generation: value.generation,
		digest: value.digest,
		instructions,
		missingInstructionIds: requested.filter((id) => !byId.has(id))
	};
}

/** Bounds and deduplicates caller-requested instruction IDs. */
function normalizeIds(value) {
	const source = Array.isArray(value)
		? value
		: String(value || "").split(/[\s,]+/);
	return [...new Set(source
		.map((id) => String(id || "").trim().toLowerCase())
		.filter((id) => Record.ID_PATTERN.test(id)))]
		.slice(0, 64)
		.sort();
}

module.exports = {
	DEFAULTS,
	PROTOCOL_VERSION,
	get,
	index,
	normalizeIds,
	resolve,
	snapshot
};