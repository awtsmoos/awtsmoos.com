// B"H
// Boruch Hashem
// Blessed is He

import { nodeCapabilityReport } from "./capabilities.js";
import { NodeManager } from "./manager.js";

/**
 * B"H
 *
 * The public Node facade exposes process lifecycle and an honest capability map.
 * The Awtsmoos renews Worker process and runtime description together;
 * Awtsmoos.com distinguishes browser emulation from native tunnel delegation.
 */
export const NodeSystem = {
	spawn: (item, tabId, options) => NodeManager.spawn(item, tabId, options),
	startService: (item, tabId, options = {}) => NodeManager.spawn(item, tabId, {
		...options,
		startup: true
	}),
	stop: (pid, reason) => NodeManager.stop(pid, reason),
	status: pid => NodeManager.status(pid),
	list: () => NodeManager.list(),
	capabilities: options => nodeCapabilityReport(options),
	executeForReport: (item, tabId, timeoutMs) => NodeManager.executeForReport(item, tabId, timeoutMs),
	routeHttpRequest: (port, request) => NodeManager.routeHttpRequest(port, request),
	routeWsRequest: (port, request) => NodeManager.routeWsRequest(port, request),
	routeWsData: (id, data) => NodeManager.routeWsData(id, data),
	routeWsClose: id => NodeManager.routeWsClose(id)
};
