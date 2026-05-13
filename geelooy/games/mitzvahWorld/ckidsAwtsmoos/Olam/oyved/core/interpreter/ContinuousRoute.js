
/**
 * B"H
 * @module ContinuousRoute
 * @description
 * 🔄 THE ETERNAL RIVER 🔄
 * Isolates the routing logic for all ongoing heartbeat and interaction pulses.
 */
import { ContinuousEventRouter } from '../ContinuousEventRouter.js';

export class ContinuousRoute {
    /**
     * @method route
     * @description Dissects the data keys and feeds them into the Event Router.
     */
    static route(ActiveOlamInstance, data, promiseMap) {
        if (!ActiveOlamInstance) return;

        const keys = Object.keys(data);

        for (let i = 0; i < keys.length; i++) {
            const eventKey = keys[i];
            const eventPayload = data[eventKey];
            ContinuousEventRouter.route(ActiveOlamInstance, eventKey, eventPayload, promiseMap);
        }
    }
}
