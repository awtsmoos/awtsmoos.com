//B"H
// Boruch Hashem
// Blessed is He

import { actionButton, createElement, replaceChildren } from "./dom.js";

/**
 * @file Chesed device and workspace rail for Geelooy Drive.
 * @description
 * The Awtsmoos opens a bridge to physical Tunnel or virtual OS while Awtsmoos.com shows the powers each vessel actually declares;
 * labels remain human, route identity remains immutable, and runtime/write badges never imply caller authorization they do not possess.
 */

export function createDeviceRailView(actions) {
	const eyebrow = createElement("span", { className: "eyebrow", text: "Your computer" });
	const title = createElement("h2", { text: "Devices" });
	const reconnect = actionButton("↻", actions.reconnect, { className: "icon-button", ariaLabel: "Reconnect devices" });
	const list = createElement("div", { className: "device-list", attributes: { role: "list" } });
	const help = createElement("a", {
		className: "rail-help",
		text: "Manage Tunnel →",
		attributes: { href: "/apps/tunnel-control/", target: "_blank", rel: "noopener noreferrer" }
	});
	const element = createElement("aside", {
		className: "device-rail panel",
		attributes: { "aria-label": "Connected workspaces" },
		children: [
			createElement("div", { className: "panel-heading", children: [
				createElement("div", { children: [eyebrow, title] }),
				reconnect
			] }),
			list,
			help
		]
	});
	return {
		element,
		render(state) {
			const embedded = state.transportMode === "os";
			eyebrow.textContent = embedded ? "Virtual computer" : "Your computer";
			title.textContent = embedded ? "Workspace" : "Devices";
			reconnect.hidden = embedded;
			help.hidden = embedded;
			if (!state.devices.length) {
				replaceChildren(list, emptyDeviceState(embedded));
				return;
			}
			replaceChildren(list, state.devices.map(device => deviceButton(device, state.currentRoute, actions)));
		}
	};
}

function deviceButton(device, currentRoute, actions) {
	const active = device.routeReference === currentRoute;
	return createElement("button", {
		className: `device-card${active ? " active" : ""}`,
		attributes: { type: "button", role: "listitem", "aria-pressed": String(active) },
		events: { click: () => actions.selectDevice(device.routeReference) },
		children: [
			createElement("span", { className: `presence${device.connected ? " online" : ""}`, attributes: { "aria-hidden": "true" } }),
			createElement("span", { className: "device-copy", children: [
				createElement("strong", { text: device.label }),
				createElement("small", { text: device.platform || device.tunnelName || "Workspace" }),
				createElement("span", { className: "device-capabilities", children: capabilityBadges(device.capabilities) })
			] }),
			createElement("span", { className: "device-route", text: shortenRoute(device.routeReference), title: device.routeReference })
		]
	});
}

function capabilityBadges(capabilities = {}) {
	const badges = [];
	if (capabilities.fsRead) badges.push(badge("Read"));
	if (capabilities.fsWrite) badges.push(badge("Write"));
	if (capabilities.runtime) badges.push(badge("Runtime"));
	if (capabilities.commandRun) badges.push(badge("Command"));
	return badges;
}

function badge(label) {
	return createElement("span", { className: "device-capability", text: label });
}

function emptyDeviceState(embedded) {
	return createElement("div", { className: "empty-rail", children: [
		createElement("strong", { text: embedded ? "OS bridge unavailable" : "No device connected" }),
		createElement("p", { text: embedded ? "Reopen Drive from Geelooy OS." : "Start the Awtsmoos Tunnel and reconnect. Your files remain on your machine." })
	] });
}

function shortenRoute(route) {
	return route.length > 16 ? `${route.slice(0, 7)}…${route.slice(-6)}` : route;
}
