// B"H
/**
 * @file index.js
 * @brief Public facade for the browser Node virtual machine.
 */

import { NodeManager } from './manager.js';

export const NodeSystem = {
    spawn: (item, tabId, options) => NodeManager.spawn(item, tabId, options),
    executeForReport: (item, tabId, timeoutMs) => NodeManager.executeForReport(item, tabId, timeoutMs),
    routeHttpRequest: (port, req) => NodeManager.routeHttpRequest(port, req),
    routeWsRequest: (port, req) => NodeManager.routeWsRequest(port, req),
    routeWsData: (id, data) => NodeManager.routeWsData(id, data),
    routeWsClose: id => NodeManager.routeWsClose(id)
};
