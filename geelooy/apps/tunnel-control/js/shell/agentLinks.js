// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file External AI and developer destinations for authenticated Tunnel Control.
 * @description
 * The Awtsmoos opens callback and headless consent doors without confusing them
 * with local panes; Awtsmoos.com keeps device login, metadata, manifest, OpenAPI,
 * Code, and OS one click away after the user signs in.
 */

import { h } from "../ui/core/html.js";

const AGENT_LINKS = Object.freeze([
	{
		label: "External AI / Agent API",
		href: "/api/tunnel/control/docs#external-agent",
		glyph: "AI"
	},
	{
		label: "Device Login",
		href: "/api/oauth/device",
		glyph: "DL"
	},
	{
		label: "Headless AI Guide",
		href: "/api/tunnel/control/docs#device-login",
		glyph: "HD"
	},
	{
		label: "OAuth Metadata",
		href: "/.well-known/oauth-authorization-server",
		glyph: "OA"
	},
	{
		label: "Agent Manifest",
		href: "/api/tunnel/control/agent-manifest",
		glyph: "AM"
	},
	{
		label: "OpenAPI",
		href: "/api/tunnel/control/openapi",
		glyph: "{}"
	},
	{
		label: "Code Editor",
		href: "/apps/code",
		glyph: "</>"
	},
	{
		label: "Virtual OS",
		href: "/os",
		glyph: "OS"
	}
]);

export function agentLinkButtons() {
	return AGENT_LINKS.map(link => h("a", {
		classes: ["awt-navigation-button", "is-agent-link"],
		attrs: {
			href: link.href,
			title: link.label,
			"aria-label": `Open ${link.label}`
		},
		children: [
			h("span", {
				classes: ["awt-navigation-glyph"],
				text: link.glyph
			}),
			h("span", {
				classes: ["awt-navigation-label"],
				text: link.label
			})
		]
	}));
}

export {
	AGENT_LINKS
};
