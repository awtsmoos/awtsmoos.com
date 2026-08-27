// B"H

import { h } from "../ui/core/html.js";
import { PANE_META } from "../router/paneMeta.js";

export function missionHero() {
	return h("header", { classes: ["awt-mission-hero"], children: [
		h("p", { classes: ["awt-mini-kicker"], text: "B\"H · TUNNEL MISSION CONTROL" }),
		h("h2", { attrs: { id: "awtMissionTitle" }, text: "Keep the agents working without losing the thread." }),
		h("p", { text: "One durable room for every mission, one correlated transport for every action, and one human channel that can pause, steer, review, and resume the work." })
	] });
}

export function quickActions() {
	const keys = ["missionRooms", "live", "aiAgents", "terminal", "explorer", "setup"];
	return h("nav", {
		classes: ["awt-quick-actions"],
		attrs: { "aria-label": "Primary command center actions" },
		children: keys.map(key => {
			const meta = PANE_META[key] || {};
			return h("button", { classes: ["awt-quick-action"], attrs: { type: "button", "data-awt-navigate": key }, text: meta.title || key });
		})
	});
}

export function runtimeIdentity(ctx = {}) {
	const tunnel = ctx.runtime?.tunnel || {};
	const rows = [
		["Tunnel", tunnel.name || ctx.getTunnelName?.() || "Not selected"],
		["Project root", ctx.runtime?.activeRoot || tunnel.root || "Not reported"],
		["Vessel", tunnel.vesselType || tunnel.kind || "native-local"],
		["Permissions", permissionText(tunnel)]
	];
	return h("section", {
		classes: ["awt-mission-status"],
		attrs: { "aria-label": "Active runtime identity" },
		children: rows.map(([label, value]) => stat(label, value))
	});
}

function permissionText(tunnel) {
	const permissions = ["read"];
	if (tunnel.allowWrite) permissions.push("write");
	if (tunnel.allowCommands) permissions.push("commands");
	if (tunnel.allowSecrets) permissions.push("secrets");
	return permissions.join(" · ");
}

function stat(label, value) {
	return h("article", { classes: ["awt-mission-stat"], children: [
		h("span", { text: label }),
		h("strong", { text: String(value || "—") })
	] });
}
