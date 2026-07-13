// B"H
// Boruch Hashem
// Blessed is He

import { extractPermissions } from "../tunnels/extractTunnel.js";
import { createDeckCard, createDeckValue } from "./runtimeBoardPrimitives.js";

/**
 * The Awtsmoos reveals identity and measured capacity without confusing raw
 * tunnel permissions with normalized workspace fields in Awtsmoos.com.
 */

/**
 * Creates the active tunnel identity card.
 *
 * @param {object} context Runtime context.
 * @returns {HTMLElement} Tunnel card.
 */
export function tunnelCard(context = {}) {
	const runtime = context.runtime || {};
	const tunnel = runtime.tunnel || {};
	const permissions = extractPermissions(tunnel.raw || {});
	const canCommand = permissions.allowCommands || Boolean(runtime.mountedCapabilities?.commands);
	const name = tunnel.name || context.getTunnelName?.() || "No tunnel selected";
	const root = runtime.activeRoot || tunnel.root || "No project root reported";
	const access = [
		permissions.allowWrite ? "write" : "read-only",
		canCommand ? "commands" : "no commands"
	].join(" · " );
	return createDeckCard({
		title: "Tunnel vessel",
		subtitle: "Connected runtime identity",
		rows: [
			createDeckValue("Name", name),
			createDeckValue("Project", root, { code: true }),
			createDeckValue("Access", access)
		],
		pane: "setup",
		buttonText: "Inspect tunnel",
		stateClasses: ["is-connected"]
	});
}

/** @returns {HTMLElement} Structured runtime telemetry card. */
export function fabricCard() {
	return createDeckCard({
		title: "Runtime fabric",
		subtitle: "Exact observed counts with freshness",
		rows: [
			createDeckValue("Connected tunnels", "Discovering…", { id: "awtDeckTunnelCount" }),
			createDeckValue("Active workers", "Not reported", { id: "awtDeckWorkerCount" }),
			createDeckValue("Queued actions", "Not reported", { id: "awtDeckQueueCount" }),
			createDeckValue("Browser targets", "Not reported", { id: "awtDeckBrowserCount" }),
			createDeckValue("Shell sessions", "Not reported", { id: "awtDeckShellCount" }),
			createDeckValue("Last observation", "Waiting for an API envelope", { id: "awtDeckFreshness" })
		],
		pane: "live",
		buttonText: "Inspect runtime",
		stateClasses: ["is-fabric", "is-idle"],
		id: "awtDeckFabricCard"
	});
}
