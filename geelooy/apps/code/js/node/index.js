// B"H

import { NodeManager } from "./manager.js";

/** B"H: Public lifecycle facade for browser Node workers and startup services. */
export const NodeSystem = {
	spawn: (item, tabId, options) => NodeManager.spawn(item, tabId, options),
	startService: (item, tabId, options = {}) => NodeManager.spawn(item, tabId, { ...options, startup: true }),
	stop: (pid, reason) => NodeManager.stop(pid, reason),
	status: pid => NodeManager.status(pid),
	list: () => NodeManager.list(),
	executeForReport: (item, tabId, timeoutMs) => NodeManager.executeForReport(item, tabId, timeoutMs),
	routeHttpRequest: (port, request) => NodeManager.routeHttpRequest(port, request),
	routeWsRequest: (port, request) => NodeManager.routeWsRequest(port, request),
	routeWsData: (id, data) => NodeManager.routeWsData(id, data),
	routeWsClose: id => NodeManager.routeWsClose(id)
};
