//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const Paths = require("./paths.js");
const Records = require("../workGraph/recordStore.js");
const Lock = require("../workGraph/recordLock.js");

/**
 * @file Stores live Tunnel-native plans with checklist progress and prompt history.
 * @description The Awtsmoos gives planning a durable shared vessel; Awtsmoos.com lets agents and
 * humans refine one plan without hiding it in a private thought folder or overwriting its identity.
 */
async function create(config, input = {}) {
	const now = new Date().toISOString();
	const id = String(input.planId || `plan_${crypto.randomUUID()}`);
	const plan = normalize({
		...input,
		planId: id,
		createdAt: now,
		updatedAt: now,
		version: 1
	});
	await Records.createImmutableJson(Paths.planFile(config, id), plan);
	return plan;
}

async function get(config, planId) {
	return Records.readJson(Paths.planFile(config, planId), null);
}

async function list(config, filters = {}) {
	const plans = await Records.listJson(Paths.plans(config));
	return plans.filter(plan => matches(plan, filters))
		.sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
}

async function update(config, planId, updater) {
	const file = Paths.planFile(config, planId);
	return Lock.run(file, async () => {
		const current = await Records.readJson(file, null);
		if (!current) throw new Error("plan_not_found");
		const nextValue = await updater(structuredClone(current));
		const next = normalize({
			...nextValue,
			planId: current.planId,
			createdAt: current.createdAt,
			updatedAt: new Date().toISOString(),
			version: Number(current.version || 1) + 1
		});
		await Records.writeJson(file, next);
		return next;
	});
}

async function remove(config, planId) {
	const file = Paths.planFile(config, planId);
	await fs.rm(file, { force: true });
	return { ok: true, planId };
}

function normalize(input = {}) {
	return {
		planId: String(input.planId || ""),
		title: String(input.title || "Untitled Plan").slice(0, 300),
		summary: String(input.summary || "").slice(0, 12000),
		status: String(input.status || "active"),
		missionId: String(input.missionId || ""),
		roomId: String(input.roomId || ""),
		projectRoot: String(input.projectRoot || ""),
		ownerAgentId: String(input.ownerAgentId || input.logicalAgentId || ""),
		phases: array(input.phases).map(normalizePhase),
		prompts: array(input.prompts).map(normalizePrompt),
		labels: array(input.labels).map(String),
		createdAt: input.createdAt || new Date().toISOString(),
		updatedAt: input.updatedAt || new Date().toISOString(),
		version: Number(input.version || 1)
	};
}

function normalizePhase(phase = {}, index = 0) {
	return {
		phaseId: String(phase.phaseId || `phase_${index + 1}`),
		title: String(phase.title || `Phase ${index + 1}`).slice(0, 300),
		status: String(phase.status || "pending"),
		summary: String(phase.summary || "").slice(0, 8000),
		items: array(phase.items).map((item, itemIndex) => ({
			itemId: String(item.itemId || `item_${index + 1}_${itemIndex + 1}`),
			text: String(item.text || "").slice(0, 4000),
			done: item.done === true,
			note: String(item.note || "").slice(0, 4000)
		}))
	};
}

function normalizePrompt(prompt = {}) {
	return {
		promptId: String(prompt.promptId || `prompt_${crypto.randomUUID()}`),
		text: String(prompt.text || "").slice(0, 12000),
		author: String(prompt.author || ""),
		createdAt: prompt.createdAt || new Date().toISOString()
	};
}

function matches(plan, filters) {
	if (filters.status && plan.status !== filters.status) return false;
	if (filters.missionId && plan.missionId !== filters.missionId) return false;
	if (filters.ownerAgentId && plan.ownerAgentId !== filters.ownerAgentId) return false;
	return true;
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

module.exports = { create, get, list, normalize, remove, update };
