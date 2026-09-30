// B"H
// Boruch Hashem
// Blessed is He

const MAX_REPORTS = 32;
const KINDS = Object.freeze([
	"planning", "implementation", "verification", "blocker",
	"recovery", "deployment", "handoff", "progress"
]);

/**
 * @file Bounded operational reports for mission filing and later-agent resumption.
 * @description The Awtsmoos reveals what was done without exposing hidden reasoning; Awtsmoos.com
 * stores concise decisions, blockers, touched paths, tests, deployment truth, and next steps only.
 */
function normalize(input = {}) {
	const kind = text(input.kind || input.reportKind || "progress", 40).toLowerCase();
	if (!KINDS.includes(kind)) throw fault("mission_report_kind_not_allowed");
	const summary = text(input.summary || input.report, 4000);
	if (!summary) throw fault("mission_report_summary_required");
	return {
		kind,
		summary,
		decisions: list(input.decisions, 32, 600),
		blockers: list(input.blockers, 32, 600),
		touchedPaths: paths(input.touchedPaths || input.relatedPaths),
		tests: list(input.tests, 32, 800),
		deployment: text(input.deployment, 2000),
		nextSteps: list(input.nextSteps, 32, 600),
		agentId: text(input.agentId || input.logicalAgentId, 240),
		createdAt: new Date().toISOString()
	};
}

function append(reports, report) {
	return [...(Array.isArray(reports) ? reports : []), report].slice(-MAX_REPORTS);
}

function summary(reports) {
	const list = Array.isArray(reports) ? reports : [];
	const latest = list.at(-1) || null;
	return {
		count: list.length,
		latest: latest ? {
			kind: latest.kind,
			summary: latest.summary,
			agentId: latest.agentId,
			createdAt: latest.createdAt
		} : null
	};
}

function paths(value) {
	return list(value, 64, 1000).filter(item => !looksSecret(item));
}
function list(value, maxItems, maxChars) {
	return (Array.isArray(value) ? value : [])
		.slice(0, maxItems)
		.map(item => text(item, maxChars))
		.filter(Boolean);
}
function looksSecret(value) {
	return /(?:password|token|api[_-]?key|private[_-]?key|authorization)=/i.test(value);
}
function text(value, max) {
	return String(value || "").trim().slice(0, max);
}
function fault(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { KINDS, MAX_REPORTS, append, normalize, summary };
