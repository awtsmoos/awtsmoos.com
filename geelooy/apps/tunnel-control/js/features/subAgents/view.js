// B"H
// Boruch Hashem
// Blessed is He

import { createSubAgentElement as h, createSubAgentMetric } from "./dom.js";

/**
 * @file Visible first-class Sub-agents command deck.
 * @description The Awtsmoos turns hidden sparks into visible constellations; Awtsmoos.com gives authentication, launch, missions, and roster each a stable vessel with no stolen IDs.
 */

function button(id, text, className = "awt-subagents__button") {
	return h("button", { id, type: "button", className, text });
}

function buildAuthPanel() {
	return h("section", { className: "awt-subagents__panel awt-subagents__auth" },
		h("div", { className: "awt-subagents__panel-kicker", text: "Persistent browser identity" }),
		h("h3", { text: "Authenticate ChatGPT once" }),
		h("div", { className: "awt-subagents__auth-orbit", "aria-hidden": "true" }, h("span", { className: "awt-subagents__auth-core" })),
		h("p", { id: "subAgentAuthStatus", className: "awt-subagents__status", text: "Login status not checked yet." }),
		h("div", { className: "awt-subagents__button-row" },
			button("subAgentOpenAuthChromeBtn", "Open ChatGPT Auth Chrome", "awt-subagents__button awt-subagents__button--primary"),
			button("subAgentVerifyLoginBtn", "Verify login")
		),
		h("p", { className: "awt-subagents__privacy", text: "Your ChatGPT session stays inside the dedicated Chrome profile. Tunnel Control does not copy your password, cookies, or browser tokens." })
	);
}

function buildLaunchPanel() {
	return h("section", { className: "awt-subagents__panel awt-subagents__launch" },
		h("div", { className: "awt-subagents__panel-kicker", text: "Bounded recursive delegation" }),
		h("h3", { text: "Launch a sub-agent team" }),
		h("label", { className: "awt-subagents__label", text: "Mission goal", htmlFor: "subAgentGoal" }),
		h("textarea", { id: "subAgentGoal", className: "awt-subagents__textarea", rows: 5, placeholder: "Describe the outcome this team should produce…" }),
		h("div", { className: "awt-subagents__field-row" },
			h("label", { className: "awt-subagents__label awt-subagents__label--compact", text: "Initial agents", htmlFor: "subAgentAgentCount" }),
			h("input", { id: "subAgentAgentCount", className: "awt-subagents__number", type: "number", min: 3, max: 12, value: 4 })
		),
		h("p", { className: "awt-subagents__hint", text: "Recursive children are bounded to depth 4, 8 children per parent, and 32 website agents total." }),
		button("subAgentLaunchBtn", "Launch sub-agent team", "awt-subagents__button awt-subagents__button--launch")
	);
}

/** @description Creates the unique Sub-agents root consumed by the shell pane registry. @returns {HTMLElement} Detached Sub-agents command deck. @sideEffects Creates DOM nodes only. */
export function createSubAgentDeck() {
	return h("section", { id: "subAgentCommandDeck", className: "awt-subagents", "aria-label": "Sub-agents command deck" },
		h("header", { className: "awt-subagents__hero" },
			h("div", { className: "awt-subagents__eyebrow", text: "Awtsmoos agent constellation" }),
			h("h2", { text: "Sub-agents" }),
			h("p", { text: "Authenticate once, launch bounded teams, and watch every visible mission without entering the advanced agent console." })
		),
		h("div", { className: "awt-subagents__metrics" },
			createSubAgentMetric("subAgentMetricActive", "Active missions"),
			createSubAgentMetric("subAgentMetricAgents", "Visible agents"),
			createSubAgentMetric("subAgentMetricAuth", "ChatGPT auth"),
			createSubAgentMetric("subAgentMetricRefresh", "Last refresh")
		),
		h("div", { className: "awt-subagents__primary-grid" }, buildAuthPanel(), buildLaunchPanel()),
		h("section", { className: "awt-subagents__panel awt-subagents__missions" },
			h("div", { className: "awt-subagents__section-head" }, h("div", {}, h("div", { className: "awt-subagents__panel-kicker", text: "Live mission field" }), h("h3", { text: "Running and recent teams" })), button("subAgentRefreshBtn", "Refresh constellation")),
			h("div", { id: "subAgentMissionList", className: "awt-subagents__mission-list" }),
			h("div", { id: "subAgentMissionDetail", className: "awt-subagents__mission-detail" })
		),
		h("footer", { className: "awt-subagents__footer" },
			h("p", { id: "subAgentNotice", className: "awt-subagents__notice", "aria-live": "polite", text: "Ready." }),
			h("div", { className: "awt-subagents__button-row" }, button("subAgentMissionControlBtn", "Open Mission control"), button("subAgentAdvancedAgentsBtn", "Advanced AI Agents"))
		)
	);
}
