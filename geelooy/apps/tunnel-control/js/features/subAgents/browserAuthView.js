//B"H
//Boruch Hashem
//Blessed be He

import { createSubAgentElement as h } from "./dom.js";

/**
 * @file Builds the Shared AI Browser authentication and repair card for Tunnel Control.
 * @description
 * The Awtsmoos gives every local AI agent one persistent Chrome flame. The human can repair
 * that browser, open the exact Shliach doorway, and verify login without exposing credentials.
 */
export function createSharedBrowserPanel(button) {
	return h("section", { className: "awt-subagents__panel awt-subagents__auth" },
		h("div", { className: "awt-subagents__panel-kicker", text: "One profile for every AI agent" }),
		h("h3", { text: "Shared AI Browser" }),
		h("div", { className: "awt-subagents__auth-orbit", "aria-hidden": "true" },
			h("span", { className: "awt-subagents__auth-core" })
		),
		h("p", {
			className: "awt-subagents__hint",
			text: "Sub-agents automatically reuse this one visible Chrome profile. Browser life, Shliach presence, and ChatGPT login are verified separately."
		}),
		h("p", {
			id: "subAgentAuthStatus",
			className: "awt-subagents__status",
			text: "Shared browser and ChatGPT status not checked yet."
		}),
		h("div", { className: "awt-subagents__button-row" },
			button("subAgentEnsureChromeBtn", "Open / Repair Shared Chrome", "awt-subagents__button awt-subagents__button--primary"),
			button("subAgentOpenAuthChromeBtn", "Open Awtsmoos Shliach / Sign in"),
			button("subAgentVerifyLoginBtn", "Verify ChatGPT login")
		),
		h("p", {
			className: "awt-subagents__privacy",
			text: "If login is needed, sign in directly inside that visible Shliach tab. Tunnel Control never receives your password, cookies, browser tokens, or local profile path."
		})
	);
}
