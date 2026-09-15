//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders live plan summaries and checklist controls without owning plan truth.
 * @description The Awtsmoos lets one durable plan appear as list, progress and actionable checklist
 * while Awtsmoos.com keeps every mutation routed back through the Tunnel Plan Registry.
 */
export function renderPlanList(element, plans = [], selectedId = "") {
	element.replaceChildren(...plans.map(plan => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = `awt-plan-card${plan.planId === selectedId ? " is-selected" : ""}`;
		button.dataset.planId = plan.planId;
		const progress = plan.progress || {};
		button.textContent = `${plan.title} · ${progress.done || 0}/${progress.total || 0} · ${progress.percent || 0}%`;
		return button;
	}));
}

export function renderChecklist(element, plan = {}) {
	const nodes = [];
	for (const phase of plan.phases || []) {
		const heading = document.createElement("h3");
		heading.textContent = `${phase.title} · ${phase.status}`;
		nodes.push(heading);
		for (const item of phase.items || []) nodes.push(itemControl(phase.phaseId, item));
	}
	element.replaceChildren(...nodes);
}

export function renderProgress(element, plan, progress = {}) {
	if (!plan) {
		element.textContent = "Select a plan.";
		return;
	}
	element.textContent = `${plan.status} · ${progress.done || 0}/${progress.total || 0} done · ${progress.percent || 0}% · ${progress.remaining || 0} remaining`;
}

function itemControl(phaseId, item) {
	const label = document.createElement("label");
	label.className = "awt-plan-check";
	const input = document.createElement("input");
	input.type = "checkbox";
	input.checked = item.done === true;
	input.dataset.phaseId = phaseId;
	input.dataset.itemId = item.itemId;
	const text = document.createElement("span");
	text.textContent = item.note ? `${item.text} — ${item.note}` : item.text;
	label.append(input, text);
	return label;
}
