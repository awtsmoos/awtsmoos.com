
// B"H
/**
 * @file StateRegistry.js
 * @brief THE ARCHIVE OF VISION (DA'AT).
 * 
 * CHAPTER CXVI: THE MULTIPLICITY OF THE HEARERS
 * 
 * In the previous world, a Vision could have only one Ear (onLog). 
 * If a second DevTools attempted to listen, the first was made deaf.
 * We now implement the Multicast Ritual, where every state container 
 * maintains a Set of listeners, allowing the one voice of the sandbox 
 * to be heard by all manifested UI vessels simultaneously.
 */

const _internalStates = new Map();

/**
 * @class StateRegistry
 * @description Manages the aggregation of state for all devtools portals.
 */
export const StateRegistry = {
    /**
     * B"H - Retrieves or Manifests a memory container for a Vision ID.
     */
    get(id, snapshot = null) {
        if (!_internalStates.has(id)) {
            console.log(`[StateRegistry] B"H - Solidifying new memory for Vision [${id}]`);
            _internalStates.set(id, {
                previewTabId: id,
                logs: snapshot?.logs || [],
                networkReqs: snapshot?.networkReqs || [],
                domString: snapshot?.domString || '',
                activePanel: snapshot?.activePanel || 'console',
                selectedPath: snapshot?.selectedPath || null,
                inspectPath: snapshot?.inspectPath || null,
                expandedPaths: new Set(snapshot?.expandedPaths || []),
                
                // SPIRITUAL MULTICAST SETS
                logListeners: new Set(),
                domListeners: new Set(),
                networkListeners: new Set(),
                inspectListeners: new Set(),
                
                mainWrapper: null
            });
        }
        return _internalStates.get(id);
    },

    remove(id) {
        const state = _internalStates.get(id);
        if (state) {
            state.logListeners.clear();
            state.domListeners.clear();
            state.networkListeners.clear();
            state.inspectListeners.clear();
        }
        _internalStates.delete(id);
    }
};
