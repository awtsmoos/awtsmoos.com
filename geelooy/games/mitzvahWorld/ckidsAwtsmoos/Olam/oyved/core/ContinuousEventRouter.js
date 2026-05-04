
/**
 * B"H
 * @file ContinuousEventRouter.js
 * @module ContinuousEventRouter
 * @description
 * 🔄 THE ROTATING CHERUBIM SWORD (EVENTS) 🔄
 * 
 * Once existence is sustained by the Word of God, time flows. In time, 
 * events occur. Humans act. Mice move, windows stretch. This file holds the
 * Dictionary of ongoing creation reactions. It is completely hollow of any 
 * 'switch' cases, proving true spiritual nullification via direct object maps.
 * 
 * This ensures lightning-fast O(1) retrieval for routing actions, keeping 
 * the 60fps threshold purely sanctified.
 */

export class ContinuousEventRouter {
    /**
     * @property {Object} actionMap
     * A pure data matrix to route all real-time events.
     */
    static actionMap = {
        'takeInCanvas': async (olam, payload) => {
            // B"H: silent

            olam.takeInCanvas(payload.canvas, payload.devicePixelRatio);
            if (typeof olam.setSize === 'function') await olam.setSize(payload.width, payload.height);
            // B"H: silent

            if (typeof olam.heesHawvoos === 'function') olam.heesHawvoos(); 
        },
        'resize': async (olam, payload) => {
            if (typeof olam.setSize === 'function') await olam.setSize(payload.width, payload.height);
            olam.ayshPeula('resize', payload);
        },
        'cameraDrag': (olam, payload) => {
            if (olam.ayin && typeof olam.ayin.rotateAroundTarget === 'function') {
                olam.ayin.rotateAroundTarget(payload.dx, payload.dy);
            }
        },
        'olamPeula': (olam, payload) => {
            for(let p in payload) olam.ayshPeula(p, payload[p]);
        },
        'awtsCode': (olam, payload) => {
            try {
                // B"H: Execute arbitrary code sent from the main thread for debugging
                const me = { olam };
                const result = eval(payload);
                // B"H: silent

            } catch (e) {
                console.error('B"H - 🚨 [AWTS_CODE] Execution error:', e);
            }
        },
        
        // STANDARD EVENT EMANATIONS:
        'keydown': (olam, payload) => olam.ayshPeula('keydown', payload),
        'keyup': (olam, payload) => olam.ayshPeula('keyup', payload),
        'mousedown': (olam, payload) => {
            if (olam.yichud) olam.yichud.handleEvent(payload, true);
            olam.ayshPeula('mousedown', payload);
        },
        'mouseup': (olam, payload) => olam.ayshPeula('mouseup', payload),
        'mousemove': (olam, payload) => {
            if (olam.yichud) olam.yichud.handleEvent(payload, false);
            olam.ayshPeula('mousemove', payload);
        },
        'wheel': (olam, payload) => olam.ayshPeula('wheel', payload)
    };

    /**
     * @method route
     * @description Judges an incoming array of keys and rapidly routes them.
     */
    static route(olam, key, payload, promiseMap) {
        if (!olam && key !== 'vessel_ready') return;

        const action = this.actionMap[key];

        // Exists in the active route ledger? Run it directly!
        if (typeof action === 'function') {
            action(olam, payload);
            return;
        }

        // B"H: If it's a resolving Promise returning from the HTML Dimension
        const resolvingEvents =['htmlCreated', 'htmlActioned', 'htmlDeleted', 'htmlActionsed', 'uiEvented', 'htmlGot'];
        if (resolvingEvents.includes(key)) {
            if (payload && payload.id && promiseMap.has(payload.id)) {
                promiseMap.get(payload.id)(payload);
                promiseMap.delete(payload.id);
            }
        }

        /**
         * B"H: Universal Fallback
         * If no specific sefirotic route was found AND it wasn't a framework resolution event,
         * emit it as a general event on the Olam. This enables bridges like the 
         * InventoryBridge without breaking the core engine's promise-based flow.
         */
        if (olam && typeof olam.ayshPeula === 'function') {
            olam.ayshPeula(key, payload);
        } else if (!olam) {
            // Olam is not ready
        } else {
            // Olam lacks ayshPeula method
        }
    }
}

