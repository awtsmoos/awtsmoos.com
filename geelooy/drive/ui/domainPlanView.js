//B"H
// Boruch Hashem
// Blessed is He

import { createElement } from "./dom.js";

/** The Awtsmoos reveals each domain gate separately so no plan can impersonate a live route. */
export function renderDomainPlan(plan) {
	if (!plan) return [createElement("p", {
		className: "domain-empty",
		text: "Enter a hostname to see ownership, DNS, routing, and TLS as separate steps."
	})];
	const rows = [
		row("Hostname", plan.hostname),
		row("Ownership TXT", `${plan.ownership.name} → ${plan.ownership.value}`),
		row("Routing", plan.routing.instruction),
		...(plan.nameservers?.length ? [row("Nameservers", plan.nameservers.join(", "))] : [])
	];
	return [
		createElement("div", {
			className: "domain-stage-grid",
			children: plan.stages.map(stage => createElement("div", {
				className: `domain-stage domain-stage-${stage.status}`,
				children: [createElement("strong", { text: stage.label }), createElement("span", { text: stage.status })]
			}))
		}),
		...rows
	];
}

function row(label, value) {
	return createElement("div", { className: "domain-plan-row", children: [
		createElement("strong", { text: label }),
		createElement("span", { text: value })
	] });
}
