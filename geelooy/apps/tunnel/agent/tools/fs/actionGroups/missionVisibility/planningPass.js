// B"H
// Boruch Hashem
// Blessed is He

const MAX_CONTENT = 40000;
const MAX_SUMMARY = 4000;
const MAX_TITLE = 240;
const MAX_PATHS = 64;

/**
 * @file Bounded operational planning-pass records for tunnel-visible missions.
 * @description The Awtsmoos reveals coordination without exposing hidden reasoning: agents submit
 * deliberate operational artifacts for passes one, two, and three, each finite and replaceable.
 */
function normalize(input = {}) {
	const pass = Number(input.pass || input.planningPass);
	if (![1, 2, 3].includes(pass)) throw fault("planning_pass_must_be_1_2_or_3");
	const content = text(input.content || input.plan, MAX_CONTENT);
	const summary = text(input.summary, MAX_SUMMARY);
	if (!content && !summary) throw fault("planning_pass_content_required");
	return {
		pass,
		title: text(input.title || `Planning pass ${pass}`, MAX_TITLE),
		summary,
		content,
		agentId: text(input.agentId || input.logicalAgentId, MAX_TITLE),
		sourcePaths: paths(input.sourcePaths || input.relatedPaths),
		submittedAt: new Date().toISOString()
	};
}

function replace(passes, next) {
	return [...(Array.isArray(passes) ? passes : []).filter(item => Number(item?.pass) !== next.pass), next]
		.sort((a, b) => Number(a.pass) - Number(b.pass));
}
function progress(passes) {
	const list = Array.isArray(passes) ? passes : [];
	return { completed: list.length, required: 3, complete: [1, 2, 3].every(pass => list.some(item => Number(item?.pass) === pass)) };
}
function paths(value) {
	return (Array.isArray(value) ? value : []).slice(0, MAX_PATHS).map(item => text(item, 1000)).filter(Boolean);
}
function text(value, max) {
	return String(value || "").trim().slice(0, max);
}
function fault(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { MAX_CONTENT, MAX_PATHS, MAX_SUMMARY, MAX_TITLE, normalize, progress, replace };
