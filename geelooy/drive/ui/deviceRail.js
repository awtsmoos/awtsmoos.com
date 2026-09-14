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
			const mode = workspaceMode(state.transportMode);
			eyebrow.textContent = mode.eyebrow;
			title.textContent = mode.title;
			reconnect.hidden = !mode.tunnel;
			help.hidden = !mode.tunnel;
			if (!state.devices.length) {
				replaceChildren(list, emptyDeviceState(mode));
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

function emptyDeviceState(mode) {
	return createElement("div", { className: "empty-rail", children: [
		createElement("strong", { text: mode.emptyTitle }),
		createElement("p", { text: mode.emptyText })
	] });
}

function workspaceMode(mode) {
	if (mode === "os") return { eyebrow: "Virtual computer", title: "Workspace", tunnel: false, emptyTitle: "OS bridge unavailable", emptyText: "Reopen Drive from Geelooy OS." };
	if (mode === "browser") return { eyebrow: "Private browser", title: "Browser Workspace", tunnel: false, emptyTitle: "Browser workspace unavailable", emptyText: "Reload this Builder tab to reopen local IndexedDB source." };
	if (mode === "cloud") return { eyebrow: "Your account", title: "Awtsmoos Cloud", tunnel: false, emptyTitle: "No cloud alias available", emptyText: "Sign in and create an Awtsmoos alias to use cloud source storage." };
	return { eyebrow: "Your computer", title: "Devices", tunnel: true, emptyTitle: "No device connected", emptyText: "Start the Awtsmoos Tunnel and reconnect. Your files remain on your machine." };
}

function shortenRoute(route) {
	return route.length > 16 ? `${route.slice(0, 7)}…${route.slice(-6)}` : route;
}
