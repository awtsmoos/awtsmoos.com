//B"H
// Boruch Hashem
// Blessed is He

const Store = require("../planRegistry/store.js");
const Mutations = require("../planRegistry/mutations.js");
const Progress = require("../planRegistry/progress.js");
const Html = require("../planRegistry/html.js");

/**
 * @file Exposes Tunnel-native planning as durable collaborative actions.
 * @description The Awtsmoos moves planning from private scratch files into a shared living vessel;
 * agents and humans inspect phases, mark work, add prompts, and render one truth as HTML.
 */
function buildPlanActions(context) {
	const { config, payload = {} } = context;
	const value = input(payload);
	return {
		async tunnelPlanCreate() {
			const plan = await Store.create(config, withIdentity(value));
			return output(plan);
		},
		async tunnelPlanGet() {
			return output(await required(config, value.planId));
		},
		async tunnelPlanList() {
			const plans = await Store.list(config, value);
			return {
				ok: true,
				count: plans.length,
				plans: plans.map(plan => ({ ...plan, progress: Progress.summarize(plan) }))
			};
		},
		async tunnelPlanUpdate() {
			return changed(config, value, plan => Mutations.patch(plan, value));
		},
		async tunnelPlanChecklistSet() {
			return changed(config, value, plan => Mutations.setChecklist(plan, value));
		},
		async tunnelPlanPhaseSet() {
			return changed(config, value, plan => Mutations.setPhase(plan, value));
		},
		async tunnelPlanPhaseAdd() {
			return changed(config, value, plan => Mutations.addPhase(plan, value));
		},
		async tunnelPlanPromptAdd() {
			return changed(config, value, plan => Mutations.addPrompt(plan, withIdentity(value)));
		},
		async tunnelPlanHtml() {
			const plan = await required(config, value.planId);
			return { ok: true, planId: plan.planId, html: Html.render(plan), progress: Progress.summarize(plan) };
		}
	};
}

async function changed(config, payload, updater) {
	const planId = String(payload.planId || "");
	if (!planId) throw new Error("plan_id_required");
	return output(await Store.update(config, planId, updater));
}

async function required(config, planId) {
	const id = String(planId || "");
	if (!id) throw new Error("plan_id_required");
	const plan = await Store.get(config, id);
	if (!plan) throw new Error("plan_not_found");
	return plan;
}

function input(payload = {}) {
	const nested = payload.input && typeof payload.input === "object" ? payload.input : {};
	return { ...payload, ...nested };
}

function output(plan) {
	return { ok: true, plan, progress: Progress.summarize(plan), html: Html.render(plan) };
}

function withIdentity(payload = {}) {
	return {
		...payload,
		missionId: payload.missionId || "",
		roomId: payload.roomId || payload.missionId || "",
		ownerAgentId: payload.ownerAgentId || payload.logicalAgentId || payload.agentId || "",
		author: payload.author || payload.logicalAgentId || payload.agentId || "human"
	};
}

module.exports = { buildPlanActions, changed, input, output, required, withIdentity };
