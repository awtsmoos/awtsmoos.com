// B"H
/**
 * @file highlighter.worker.js
 * @version 3.0 (Olam HaAsiyah - The World of Action)
 * @description The Neshama's antechamber. This worker is now the pure interface between
 * the physical world (main thread) and the spiritual worlds of parsing (the imported logic).
 * It manages state and communication, but delegates the heavy intellectual work.
 */

import { processHighlightRequest } from './highlighter-logic.js';

// --- Worker State ---
const clientState = new Map();

/**
 * @function getClosestCachedState
 * @description Searches backwards from a given line to find the nearest valid cached state.
 * This function remains here as it is fundamentally tied to the worker's state management.
 * @param {number} startLine - The line index to start searching from.
 * @param {function} getInitialState - A function to get the initial state for the language.
 * @returns {{state: object, line: number}} - The cached state and the line number it corresponds to.
 */
function getClosestCachedState(startLine, getInitialState, stateObj) {
    const cache = stateObj.lineStatesCache;
    for (let i = Math.min(startLine, cache.length - 1); i >= 0; i--) {
        if (cache[i]) {
            // Deep copy the state to prevent mutation of the cache
            return { state: JSON.parse(JSON.stringify(cache[i])), line: i };
        }
    }
    // If no cache is found, return the initial state at line -1 (to start processing from line 0).
    return { state: getInitialState(stateObj.language), line: -1 };
}

// --- Worker Message Handler ---
self.onmessage = (e) => {
    const { type, clientId } = e.data;
    if (!clientId) return;

    if (!clientState.has(clientId)) {
        clientState.set(clientId, {
            language: 'js',
            lines: [],
            lineStatesCache: []
        });
    }
    const stateObj = clientState.get(clientId);

    switch (type) {
        /**
         * Handles the initial setting or updating of the entire text content.
         * This invalidates and clears all existing caches.
         */
        case 'setText': {
            stateObj.language = e.data.language || 'js';
            stateObj.lines = e.data.text.split('\n');
            stateObj.lineStatesCache = []; // Clear the memory upon receiving new text.
            break;
        }

        /**
         * The primary highlighting request, now handled by the imported logic.
         */
        case 'highlight': {
            if (stateObj.lines.length === 0) return;

            const result = processHighlightRequest(e.data, {
                language: stateObj.language,
                lines: stateObj.lines,
                lineStatesCache: stateObj.lineStatesCache,
                getClosestCachedState: (startLine, getInitialState) => getClosestCachedState(startLine, getInitialState, stateObj),
            });

            if (result) {
                // Update our cache with the new states calculated by the logic module.
                result.newCachedStates.forEach(item => {
                    stateObj.lineStatesCache[item.lineIndex] = item.state;
                });

                self.postMessage({
                    type: 'highlightResult',
                    clientId,
                    htmlLines: result.highlightedLines,
                    requestId: e.data.requestId,
                    responseFirstLine: e.data.firstLineToRender,
                    scrollTopAtRequest: e.data.scrollTopAtRequest,
                    scrollLeftAtRequest: e.data.scrollLeftAtRequest
                });
            }
            break;
        }
    }
};
