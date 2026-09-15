//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Mutates one live plan without replacing its identity or losing prior prompts.
 * @description The Awtsmoos lets planning evolve openly; Awtsmoos.com changes checklist state,
 * phase state and human prompts while preserving the one durable plan vessel.
 */
function patch(plan, input = {}) {
	for (const key of ["title", "summary", "status", "missionId", "roomId", "projectRoot", "ownerAgentId"]) {
		if (input[key] !== undefined) plan[key] = String(input[key]);
	}
	if (Array.isArray(input.labels)) plan.labels = input.labels.map(String);
	return plan;
}

function setChecklist(plan, input = {}) {
	const phase = findPhase(plan, input.phaseId);
	const item = (phase.items || []).find(value => value.itemId === String(input.itemId || ""));
	if (!item) throw new Error("plan_checklist_item_not_found");
	if (input.done !== undefined) item.done = input.done === true;
	if (input.note !== undefined) item.note = String(input.note || "").slice(0, 4000);
	return plan;
}

function setPhase(plan, input = {}) {
	const phase = findPhase(plan, input.phaseId);
	if (input.status !== undefined) phase.status = String(input.status);
	if (input.summary !== undefined) phase.summary = String(input.summary || "").slice(0, 8000);
	return plan;
}

function addPrompt(plan, input = {}) {
	const text = String(input.text || input.prompt || "").trim();
	if (!text) throw new Error("plan_prompt_required");
	plan.prompts = Array.isArray(plan.prompts) ? plan.prompts : [];
	plan.prompts.push({
		promptId: String(input.promptId || `prompt_${crypto.randomUUID()}`),
		text: text.slice(0, 12000),
		author: String(input.author || input.logicalAgentId || "human"),
		createdAt: new Date().toISOString()
	});
	return plan;
}

function addPhase(plan, input = {}) {
	plan.phases = Array.isArray(plan.phases) ? plan.phases : [];
	const index = plan.phases.length + 1;
	plan.phases.push({
		phaseId: String(input.phaseId || `phase_${index}`),
		title: String(input.title || `Phase ${index}`).slice(0, 300),
		status: String(input.status || "pending"),
		summary: String(input.summary || "").slice(0, 8000),
		items: Array.isArray(input.items) ? input.items.map((item, itemIndex) => ({
			itemId: String(item.itemId || `item_${index}_${itemIndex + 1}`),
			text: String(item.text || "").slice(0, 4000),
			done: item.done === true,
			note: String(item.note || "").slice(0, 4000)
		})) : []
	});
	return plan;
}

function findPhase(plan, phaseId) {
	const phase = (plan.phases || []).find(value => value.phaseId === String(phaseId || ""));
	if (!phase) throw new Error("plan_phase_not_found");
	return phase;
}

module.exports = { addPhase, addPrompt, patch, setChecklist, setPhase };
