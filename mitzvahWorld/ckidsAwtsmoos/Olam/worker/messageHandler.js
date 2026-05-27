
/**
 * B"H
 * Aggregated Message Handler
 * Combines all split handlers into one object for the Worker Manager.
 */
import coreHandlers from "./handlers/core.js";
import htmlHandlers from "./handlers/html.js";
import uiHandlers from "./handlers/ui.js";
import worldHandlers from "./handlers/world.js";

export default function setupMessageHandler(manager) {
    const { eved, myUi } = manager;
    const promiseMap = new Map();

    function registerPromise(id) {
        return new Promise((resolve, reject) => {
            promiseMap.set(id, { resolve, reject });
        });
    }
    
    manager.promiseMap = promiseMap;
    manager.registerPromise = registerPromise;

    // Combine all handlers
    // B"H: We assign them to manager.tawfeekim so they can reference 'this' if needed
    manager.tawfeekim = {
        ...coreHandlers(manager),
        ...htmlHandlers(manager),
        ...uiHandlers(manager),
        ...worldHandlers(manager)
    };

    manager.handleMessageEvent = (event) => {
        const data = event.data;
        if (typeof data === 'object' && data !== null) {
            Object.keys(data).forEach(key => {
                const task = manager.tawfeekim[key];
                const k = data[key];
                
                // Global error handler check
                if (k && k.error && manager.onerror) manager.onerror(k.error, manager);
                
                // Execute task
                if (typeof task === 'function') {
                     try {
                        // B"H FIX: Call with context of tawfeekim to ensure sibling methods (like increasedOlamLoading) work
                        task.call(manager.tawfeekim, k);
                     } catch(e) {
                         console.error("B\"H - Error executing task:", key, e);
                     }
                }
                
                // Execute custom tasks
                if (manager.customTawfeekeem && manager.customTawfeekeem[key]) {
                    try {
                        manager.customTawfeekeem[key](k);
                    } catch(e) {
                        console.error("B\"H - Error in custom task:", key, e);
                    }
                }

                // Handle Promises (generic logic for all returned events)
                // If any event returns with an ID, we check if there's a promise waiting for it
                if (k && k.id) {
                    const promiseInfo = promiseMap.get(k.id);
                    if (promiseInfo) {
                        // Resolve the promise
                        promiseInfo.resolve(k);
                        promiseMap.delete(k.id);
                    }
                }
            });
        }
    };
}
