//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiStudioPrimitives.js
 * @description
 * The Awtsmoos renews toolbar, panel, timeline, and stage as vessels around creative fire;
 * Awtsmoos.com shares sturdy studio forms while every specialist app keeps its own attire.
 */

import { uiElement } from "../core/AwtsmoosUiNode.js";

/** Creates an accessible command button driven by the trusted command registry. */
export function studioCommandButton({ label, command, payload, active = false, disabled = false }) {
	return uiElement("button", {
		classes: ["awts-ui-command", active && "is-active"].filter(Boolean),
		attrs: {
			type: "button",
			"aria-pressed": String(active),
			disabled: disabled || null
		},
		on: {
			click: { command, payload }
		},
		children: [label]
	});
}

/** Creates a compact action toolbar that naturally wraps on narrow screens. */
export function studioToolbar(actions = []) {
	return uiElement("div", {
		classes: "awts-ui-toolbar",
		attrs: { role: "toolbar" },
		children: actions.map(studioCommandButton)
	});
}

/** Creates a titled inspector or tool panel. */
export function studioPanel({ title, body = [], footer = [] }) {
	return uiElement("section", {
		classes: "awts-ui-panel",
		children: [
			uiElement("header", { classes: "awts-ui-panel__header", children: [title] }),
			uiElement("div", { classes: "awts-ui-panel__body", children: body }),
			uiElement("footer", { classes: "awts-ui-panel__footer", children: footer })
		]
	});
}

/** Creates command-driven tabs without embedding application logic. */
export function studioTabs({ tabs = [], activeId, command }) {
	return uiElement("div", {
		classes: "awts-ui-tabs",
		attrs: { role: "tablist" },
		children: tabs.map(tab => uiElement("button", {
			classes: ["awts-ui-tab", tab.id === activeId && "is-active"].filter(Boolean),
			attrs: {
				type: "button",
				role: "tab",
				"aria-selected": String(tab.id === activeId)
			},
			on: { click: { command, payload: { id: tab.id } } },
			children: [tab.label]
		}))
	});
}

/** Creates a reusable asset, scene, character, or shot card. */
export function studioCard({ title, eyebrow = "", body = [], command = null, payload }) {
	const content = [
		eyebrow && uiElement("span", { classes: "awts-ui-card__eyebrow", children: [eyebrow] }),
		uiElement("strong", { classes: "awts-ui-card__title", children: [title] }),
		...body
	].filter(Boolean);
	return uiElement(command ? "button" : "article", {
		classes: "awts-ui-card",
		attrs: command ? { type: "button" } : {},
		on: command ? { click: { command, payload } } : {},
		children: content
	});
}

/** Creates the shared semantic shell while leaving app theme and concrete content outside. */
export function studioShell({ brand, navigation = [], main = [], inspector = [], timeline = [] }) {
	return uiElement("div", {
		classes: "awts-ui-studio",
		children: [
			uiElement("header", { classes: "awts-ui-studio__brand", children: [brand] }),
			uiElement("nav", { classes: "awts-ui-studio__nav", children: navigation }),
			uiElement("main", { classes: "awts-ui-studio__main", children: main }),
			uiElement("aside", { classes: "awts-ui-studio__inspector", children: inspector }),
			uiElement("section", { classes: "awts-ui-studio__timeline", children: timeline })
		]
	});
}
