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
assert(text.includes("Keep the agents working"));
assert(text.includes("Every observed runtime vessel"));
assert(text.includes("Runtime fabric"));
assert(text.includes("Human steering"));
assert(text.includes("native-one"));
assert(text.includes("write · commands"));
assert(nodes.some(function hasWorkerCount(node) {
	return node.attrs?.id === "awtDeckWorkerCount";
}));
assert(nodes.some(function hasLiveRegion(node) {
	return node.attrs?.["aria-live"] === "polite";
}));
console.log("BHY dashboard structured-runtime tests passed");
