// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Focused health-aware vessel-detail DOM for Tunnel Control.
 * @description
 * The Awtsmoos gives one sanitized presentation model a visible card without
 * reopening raw discovery. Awtsmoos.com keeps route, health, capabilities, and
 * cross-app doors together while hidden machinery remains outside the vessel.
 * A green transport may still confess degraded execution, and truth becomes light.
 */

import { h } from "../../ui/core/html.js";

export function vesselDetailCard(model, selected = false) {
	const children = [
		heading(model, selected),
		h("code", { text: model.route || "No immutable route" }),
		h("p", {
			text: `${model.status}${model.displayName ? ` · display name ${model.displayName}` : ""}`
		}),
		healthBlock(model.health),
		capabilityRow(model.capabilities)
	];
	if (!model.canCommand && model.category === "virtual-os") {
		children.push(h("p", {
			text: "Virtual OS can browse/write its virtual files, but it does not run native shell commands."
		}));
	}
	const actions = actionRow(model.launches || (model.launch ? [model.launch] : []));
	if (actions) {
		children.push(actions);
	}
	return h("article", {
		classes: ["awt-vessel-detail", selected ? "is-selected" : ""].filter(Boolean),
		children
	});
}

export function cardShell(title, children) {
	return h("article", {
		classes: ["mini-card", "is-success"],
		children: [
			h("header", {
				classes: ["mini-card__header"],
				children: [h("strong", { text: title })]
			}),
			...children
		]
	});
}

export function row(values, element = "td") {
	return h("tr", {
		children: values.map(value => h(element, { text: value }))
	});
}

function heading(model, selected) {
	return h("div", {
		classes: ["awt-vessel-detail__heading"],
		children: [
			h("strong", { text: `${selected ? "Selected · " : ""}${model.name}` }),
			h("span", { text: model.label })
		]
	});
}

function healthBlock(health = {}) {
	return h("div", {
		classes: ["awt-vessel-health", `is-${health.state || "unknown"}`],
		attrs: { "data-health": health.state || "unknown" },
		children: [
			h("strong", { text: health.label || "Health unknown" }),
			h("span", { text: health.detail || "No bounded health evidence available." })
		]
	});
}

function capabilityRow(labels) {
	return h("div", {
		classes: ["awt-vessel-capabilities"],
		children: labels.length
			? labels.map(label => h("span", { text: label }))
			: [h("span", { text: "No interactive capabilities" })]
	});
}

function actionRow(actions) {
	if (!actions.length) {
		return null;
	}
	return h("div", {
		classes: ["awt-vessel-actions"],
		children: actions.map(action => h("a", {
			attrs: { href: action.href },
			text: action.label
		}))
	});
}
