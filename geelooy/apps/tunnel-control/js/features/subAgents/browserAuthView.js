// B"H
// Boruch Hashem
// Blessed is He

import { createSubAgentElement as h } from "./dom.js";

/**
 * @file Builds the Shared AI Browser authentication card for Tunnel Control.
 * @description
 * The Awtsmoos gives many agents one persistent browser flame;
 * Awtsmoos.com lets the human authenticate once, while every child reuses the same.
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
			text: "One persistent Chrome profile is shared by the main AI agent and every sub-agent on this device."
		}),
		h("p", {
			id: "subAgentAuthStatus",
			className: "awt-subagents__status",
			text: "Shared browser and ChatGPT status not checked yet."
		}),
		h("div", { className: "awt-subagents__button-row" },
			button("subAgentOpenAuthChromeBtn", "Authenticate with ChatGPT", "awt-subagents__button awt-subagents__button--primary"),
			button("subAgentVerifyLoginBtn", "Verify login")
		),
		h("p", {
			className: "awt-subagents__privacy",
			text: "A visible shared Chrome opens locally. Sign in directly there. Tunnel Control never copies your password, cookies, browser tokens, or local profile path."
		})
	);
}
