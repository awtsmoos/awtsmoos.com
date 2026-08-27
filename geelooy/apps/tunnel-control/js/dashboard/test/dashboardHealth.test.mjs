// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { installFakeDom, walkNodes } from "./fakeDom.js";

installFakeDom();
const dashboardModule = await import("../dashboard.js");
const context = {
	session: {
		loggedIn: true
	},
	runtime: {
		id: "rt",
		mode: "native-tunnel",
		activeRoot: "/repo",
		mountedCapabilities: {
			commands: true
		},
		tunnel: {
			connected: true,
			name: "native-one",
			raw: {
				liveConfig: {
					allowWrite: true,
					allowCommands: true
				},
				tools: {
					fsRead: true,
					command: true,
					chrome: true
				}
			}
		}
	},
	getTunnelName() {
		return "native-one";
	}
};

const summary = dashboardModule.dashboardHealthSummary(context);
assert.strictEqual(summary.total, 8);
assert(summary.ready >= 5);
assert.strictEqual(dashboardModule.landingLinks.os, "https://awtsmoos.com/os");

const dashboard = dashboardModule.createDashboard(context);
assert.strictEqual(dashboard.tag, "section");
const nodes = walkNodes(dashboard);
const text = nodes.map(function readText(node) {
	return node.textContent;
}).join(" " );
for (const destination of [
	"Mission control",
	"Live commands",
	"Project explorer",
	"Browser control",
	"AI agents",
	"Runtime mesh"
]) {
	assert(text.includes(destination), `launcher includes ${destination}`);
}
assert(nodes.some(function hasDashboard(node) {
	return node.attrs?.id === "awtDashboard";
}));
assert(nodes.some(function hasApplicationNavigation(node) {
	return node.attrs?.["aria-label"] === "Application navigation";
}));
assert(nodes.some(function hasLauncherNavigation(node) {
	return node.attrs?.["aria-label"] === "Open an application";
}));
assert(nodes.filter(function isNavigationDestination(node) {
	return Boolean(node.attrs?.["data-awt-navigate"]);
}).length >= 16);
assert(nodes.some(function opensMissionControl(node) {
	return node.attrs?.["data-awt-navigate"] === "missionRooms";
}));
console.log("BHY dashboard launcher and health tests passed");
