// B"H
// Boruch Hashem
// Blessed is He

import { createSubAgentElement as h, createSubAgentMetric } from "./dom.js";
import { createSharedBrowserPanel } from "./browserAuthView.js";

/**
 * @file Visible Sub-agents command deck with one shared browser and explicit execution truth.
 * @description
 * The Awtsmoos turns hidden sparks into visible constellations through one browser light;
 * Awtsmoos.com separates authentication, execution, launch, missions, and roster so every state reads right.
 */
function button(id, text, className = "awt-subagents__button") {
	return h("button", { id, type: "button", className, text });
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
		h("p", { className: "awt-subagents__hint", text: "Recursive children are bounded to depth 4, 8 children per parent, and 32 website agents total. Browser-backed children share one persistent profile but use separate tabs." }),
		button("subAgentLaunchBtn", "Launch sub-agent team", "awt-subagents__button awt-subagents__button--launch")
	);
}

export function createSubAgentDeck() {
	return h("section", { id: "subAgentCommandDeck", className: "awt-subagents", "aria-label": "Sub-agents command deck" },
		h("header", { className: "awt-subagents__hero" },
			h("div", { className: "awt-subagents__eyebrow", text: "Awtsmoos agent constellation" }),
			h("h2", { text: "Sub-agents" }),
			h("p", { text: "Authenticate the Shared AI Browser once, launch bounded teams, and watch live mission evidence without opening the advanced console." })
		),
		h("div", { className: "awt-subagents__metrics" },
			createSubAgentMetric("subAgentMetricExecution", "Tunnel execution"),
			createSubAgentMetric("subAgentMetricActive", "Active missions"),
			createSubAgentMetric("subAgentMetricAgents", "Visible agents"),
			createSubAgentMetric("subAgentMetricAuth", "Browser / ChatGPT"),
			createSubAgentMetric("subAgentMetricRefresh", "Last refresh")
		),
		h("div", { className: "awt-subagents__primary-grid" },
			createSharedBrowserPanel(button),
			buildLaunchPanel()
		),
		h("section", { className: "awt-subagents__panel awt-subagents__missions" },
			h("div", { className: "awt-subagents__section-head" },
				h("div", {},
					h("div", { className: "awt-subagents__panel-kicker", text: "Live mission field" }),
					h("h3", { text: "Running and recent teams" })
				),
				button("subAgentRefreshBtn", "Refresh constellation")
			),
			h("div", { id: "subAgentMissionList", className: "awt-subagents__mission-list" }),
			h("div", { id: "subAgentMissionDetail", className: "awt-subagents__mission-detail" })
		),
		h("footer", { className: "awt-subagents__footer" },
			h("p", { id: "subAgentNotice", className: "awt-subagents__notice", "aria-live": "polite", text: "Ready." }),
			h("div", { className: "awt-subagents__button-row" },
				button("subAgentMissionControlBtn", "Open Mission control"),
				button("subAgentAdvancedAgentsBtn", "Advanced AI Agents")
			)
		)
	);
}
