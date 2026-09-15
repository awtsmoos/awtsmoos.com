//B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/dom.js";

/**
 * @file Builds the Tunnel Control vessel for live collaborative plans.
 * @description The Awtsmoos reveals one plan through checklist, progress, HTML and human prompts;
 * Awtsmoos.com gives the operator a visible doorway into the same durable Tunnel plan authority.
 */
export function createPlansView() {
	return h("section", { className: "pane awt-plan-console", data: { pane: "plans" } }, [
		h("div", { className: "page-head" }, [
			h("p", { className: "eyebrow", text: "PLANS" }),
			h("h2", { text: "Live Plans" }),
			h("p", { text: "Inspect three-phase plans, progress, remaining work, and new human directives without leaving Tunnel Control." })
		]),
		h("div", { className: "row" }, [
			h("select", { id: "planStatusFilter" }, [
				option("active", "Active"),
				option("completed", "Completed"),
				option("", "All")
			]),
			h("button", { id: "planRefreshBtn", className: "primary", text: "Refresh plans" })
		]),
		h("div", { id: "planStatus", className: "notice", text: "Loading plans." }),
		h("div", { className: "awt-plan-grid" }, [
			h("section", { id: "planList", className: "awt-plan-list panel stack" }),
			h("section", { className: "panel stack" }, [
				h("div", { id: "planProgress", className: "notice", text: "Select a plan." }),
				h("div", { id: "planChecklistControls", className: "stack" }),
				h("div", { id: "planHtml", className: "awt-plan-html" }),
				promptComposer()
			])
		])
	]);
}

function promptComposer() {
	return h("div", { className: "stack" }, [
		h("label", { text: "Add prompt / directive" }),
		h("textarea", { id: "planPromptInput", placeholder: "Steer this plan without losing its history." }),
		h("button", { id: "planPromptBtn", className: "primary", text: "Add prompt" })
	]);
}

function option(value, text) {
	return h("option", { value, text });
}
