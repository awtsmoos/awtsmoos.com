// B"H
// Boruch Hashem
// Blessed is He

const Planning = require("./planningPass.js");
const Reports = require("./report.js");

const SCHEMA_VERSION = 3;
const RECORD_FIELDS = Object.freeze([
	"missionId", "title", "description", "goals", "status", "progress",
	"tasks", "agents", "decisions", "openQuestions", "relatedPaths"
]);

/**
 * @file Owns mission-visibility record shape independently from persistence mechanics.
 * @description The Awtsmoos renews one mission through plans and reports; Awtsmoos.com keeps
 * migrations finite, list summaries compact, and full operational testimony available on demand.
 */
function initial(id, input = {}) {
	const stamp = now();
	return hydrate({
		id,
		missionId: text(input.missionId),
		title: text(input.title),
		description: text(input.description),
		goals: list(input.goals),
		status: text(input.status || "active"),
		progress: text(input.progress),
		tasks: list(input.tasks),
		agents: list(input.agents),
		decisions: list(input.decisions),
		openQuestions: list(input.openQuestions),
		relatedPaths: list(input.relatedPaths),
		planningPasses: [],
		reports: [],
		createdAt: stamp,
		updatedAt: stamp,
		archived: false,
		archivedAt: null
	});
}

function hydrate(record = {}) {
	const planningPasses = Array.isArray(record.planningPasses) ? record.planningPasses : [];
	const reports = Array.isArray(record.reports) ? record.reports.slice(-Reports.MAX_REPORTS) : [];
	return {
		...record,
		schemaVersion: SCHEMA_VERSION,
		missionId: text(record.missionId),
		planningPasses,
		planningProgress: Planning.progress(planningPasses),
		reports,
		reportSummary: Reports.summary(reports)
	};
}

function applyPatch(record, patch = {}) {
	for (const key of RECORD_FIELDS) {
		if (patch[key] !== undefined) record[key] = patch[key];
	}
	return record;
}

function summary(record) {
	return {
		id: record.id,
		missionId: record.missionId,
		title: record.title,
		status: record.status,
		progress: record.progress,
		updatedAt: record.updatedAt,
		archived: record.archived,
		planningProgress: record.planningProgress,
		reportSummary: record.reportSummary
	};
}

function list(value) {
	return Array.isArray(value) ? value : [];
}
function text(value) {
	return String(value || "").trim();
}
function now() {
	return new Date().toISOString();
}

module.exports = { RECORD_FIELDS, SCHEMA_VERSION, applyPatch, hydrate, initial, now, summary };
