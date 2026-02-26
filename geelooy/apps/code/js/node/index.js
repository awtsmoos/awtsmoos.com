
// B"H
/**
 * @file index.js
 * @brief The Keter of the Node Simulator.
 * 
 * THE HYMN OF THE GOLEM'S CROWN:
 * From the silence of the browser, a server shall arise,
 * A simulated backend beneath the frontend skies.
 * This is the gateway where the processes are born,
 * Managing the breath of life from evening until morn.
 */

import { NodeManager } from './manager.js';

export const NodeSystem = {
    /**
     * @function spawn
     * @description Awakens a new Node process.
     */
    spawn: (item, tabId) => NodeManager.spawn(item, tabId),

    /**
     * @function routeHttpRequest
     * @description Channels an intercepted localhost request to the correct Golem.
     */
    routeHttpRequest: (port, req) => NodeManager.routeHttpRequest(port, req)
};
