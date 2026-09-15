//B"H
// Boruch Hashem
// Blessed is He

import { addPrompt, getPlan, listPlans, planHtml, setChecklist } from "./api.js";
import { renderChecklist, renderPlanList, renderProgress } from "./render.js";

/**
 * @file Binds Tunnel Control gestures to the shared Plan Registry.
 * @description The Awtsmoos lets humans steer a living plan without forking its truth; every click
 * and directive flows back through the Tunnel authority and refreshes one visible causal vessel.
 */
export function createPlansController(getTunnelName) {
	const state = { selectedId: "", plans: [], plan: null };
	async function refresh() {
		const status = document.getElementById("planStatusFilter")?.value || "active";
		const result = await listPlans(getTunnelName, status ? { status } : {});
		state.plans = result.plans || [];
		if (!state.selectedId || !state.plans.some(plan => plan.planId === state.selectedId)) {
			state.selectedId = state.plans[0]?.planId || "";
		}
		renderPlanList(document.getElementById("planList"), state.plans, state.selectedId);
		document.getElementById("planStatus").textContent = `${state.plans.length} plan(s) visible.`;
		if (state.selectedId) await select(state.selectedId);
		else clearDetail();
	}
	async function select(planId) {
		state.selectedId = planId;
		const [record, html] = await Promise.all([
			getPlan(getTunnelName, planId),
			planHtml(getTunnelName, planId)
		]);
		state.plan = record.plan;
		renderPlanList(document.getElementById("planList"), state.plans, planId);
		renderProgress(document.getElementById("planProgress"), record.plan, record.progress);
		renderChecklist(document.getElementById("planChecklistControls"), record.plan);
		document.getElementById("planHtml").innerHTML = html.html || "";
	}
	async function toggle(input) {
		await setChecklist(getTunnelName, {
			planId: state.selectedId,
			phaseId: input.dataset.phaseId,
			itemId: input.dataset.itemId,
			done: input.checked
		});
		await refresh();
	}
	async function prompt() {
		const field = document.getElementById("planPromptInput");
		const text = field?.value?.trim() || "";
		if (!text || !state.selectedId) return;
		await addPrompt(getTunnelName, { planId: state.selectedId, text, author: "human:tunnel-control" });
		field.value = "";
		await select(state.selectedId);
	}
	return { refresh, select, state, toggle, prompt };
}

export function bindPlansController(controller) {
	document.getElementById("planRefreshBtn")?.addEventListener("click", () => controller.refresh());
	document.getElementById("planStatusFilter")?.addEventListener("change", () => controller.refresh());
	document.getElementById("planPromptBtn")?.addEventListener("click", () => controller.prompt());
	document.getElementById("planList")?.addEventListener("click", event => {
		const button = event.target.closest("[data-plan-id]");
		if (button) controller.select(button.dataset.planId);
	});
	document.getElementById("planChecklistControls")?.addEventListener("change", event => {
		if (event.target.matches("input[type=checkbox][data-item-id]")) controller.toggle(event.target);
	});
}

function clearDetail() {
	document.getElementById("planProgress").textContent = "No plan selected.";
	document.getElementById("planChecklistControls").replaceChildren();
	document.getElementById("planHtml").replaceChildren();
}
