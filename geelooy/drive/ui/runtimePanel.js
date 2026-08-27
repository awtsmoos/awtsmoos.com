//B"H
// Boruch Hashem
// Blessed is He

import { runtimeReadiness } from "../core/deviceCapabilities.js";
import { actionButton, createElement, replaceChildren } from "./dom.js";

/**
 * @file Managed static-runtime control panel for Geelooy Drive.
 * @description
 * The Awtsmoos lets a project listen without granting a shell; Awtsmoos.com reveals server identity, command scope,
 * public proxy verification, recent requests, and Stop as separate bounded controls that never confuse local port with public URL.
 */

export function createRuntimePanelView(actions) {
	const status = createElement("strong", { className: "runtime-status" });
	const copy = createElement("p", { className: "runtime-copy" });
	const details = createElement("div", { className: "runtime-details" });
	const logs = createElement("div", { className: "runtime-logs" });
	const start = actionButton("Start static server", actions.runtimeStart, { className: "button primary small" });
	const expose = actionButton("Expose public", actions.runtimeExpose, { className: "button quiet small" });
	const refresh = actionButton("Logs", actions.runtimeLogs, { className: "button quiet small" });
	const stop = actionButton("Stop", actions.runtimeStop, { className: "button danger small" });
	const controls = createElement("div", {
		className: "runtime-actions",
		children: [start, expose, refresh, stop]
	});
	const element = createElement("section", {
		className: "runtime-panel panel",
		attributes: { "aria-label": "Managed static runtime" },
		children: [
			createElement("span", { className: "eyebrow", text: "Runtime" }),
			status,
			copy,
			details,
			controls,
			logs
		]
	});
	return {
		element,
		render(state) {
			const readiness = runtimeReadiness(state);
			const eligible = state.transportMode === "standalone" && readiness.capable && Boolean(state.currentRoute);
			const keyLoaded = Boolean(state.mutationCredentialConfigured);
			const server = state.runtimeServer;
			status.textContent = runtimeStatus(state, readiness);
			copy.textContent = runtimeCopy(state, eligible, keyLoaded);
			start.hidden = Boolean(server);
			start.disabled = !eligible || !keyLoaded || Boolean(state.busyAction);
			expose.hidden = !server;
			refresh.hidden = !server;
			stop.hidden = !server;
			expose.disabled = !keyLoaded || Boolean(state.busyAction) || Boolean(state.runtimeExposure?.publicUrl);
			refresh.disabled = !keyLoaded || Boolean(state.busyAction);
			stop.disabled = !keyLoaded || Boolean(state.busyAction);
			replaceChildren(details, runtimeDetails(state));
			replaceChildren(logs, runtimeLogNodes(state.runtimeLogs));
		}
	};
}

function runtimeStatus(state, readiness) {
	if (state.runtimeServer) return "Managed server running";
	if (state.transportMode === "os") return "Tunnel runtime unavailable";
	if (!state.currentRoute) return "No Tunnel device";
	return readiness.capable ? readiness.label : "Runtime not advertised";
}

function runtimeCopy(state, eligible, keyLoaded) {
	if (state.runtimeServer) return "A bounded static server is running on the recorded Tunnel device. No arbitrary command was launched.";
	if (state.transportMode === "os") return "OS VFS intentionally exposes files only; runtime commands never cross the embed bridge.";
	if (!eligible) return "Choose a Tunnel device that advertises runtime support.";
	if (!keyLoaded) return "Load a scoped key containing tunnel.command. The backend will prove its scope when Start is attempted.";
	return "Start the current folder on an ephemeral device port, then expose it publicly only when you choose.";
}

function runtimeDetails(state) {
	const server = state.runtimeServer;
	if (!server) return [];
	const nodes = [
		createElement("span", { text: `Device port ${server.port}` }),
		createElement("span", { text: `Root ${server.path || "."}` }),
		createElement("span", { text: server.ready ? "Ready" : "Starting" })
	];
	const exposure = state.runtimeExposure;
	if (exposure?.publicUrl) {
		nodes.push(createElement("a", {
			text: exposure.publicVerified ? "Open verified public URL ↗" : "Open public URL ↗",
			attributes: { href: exposure.publicUrl, target: "_blank", rel: "noopener noreferrer" }
		}));
	}
	return nodes;
}

function runtimeLogNodes(logs) {
	if (!logs?.length) return [];
	return logs.slice(-6).reverse().map(entry => createElement("code", {
		text: typeof entry === "string" ? entry : JSON.stringify(entry)
	}));
}
