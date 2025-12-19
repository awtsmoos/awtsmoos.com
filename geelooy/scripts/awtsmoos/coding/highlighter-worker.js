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
let language = 'js';
let lines = [];
let lineStatesCache = []; // The cache for Da'at (Knowledge)

/**
 * @function getClosestCachedState
 * @description Searches backwards from a given line to find the nearest valid cached state.
 * This function remains here as it is fundamentally tied to the worker's state management.
 * @param {number} startLine - The line index to start searching from.
 * @param {function} getInitialState - A function to get the initial state for the language.
 * @returns {{state: object, line: number}} - The cached state and the line number it corresponds to.
 */
function getClosestCachedState(startLine, getInitialState) {
    for (let i = Math.min(startLine, lineStatesCache.length - 1); i >= 0; i--) {
        if (lineStatesCache[i]) {
            // Deep copy the state to prevent mutation of the cache
            return { state: JSON.parse(JSON.stringify(lineStatesCache[i])), line: i };
        }
    }
    // If no cache is found, return the initial state at line -1 (to start processing from line 0).
    return { state: getInitialState(language), line: -1 };
}

// --- Worker Message Handler ---
self.onmessage = (e) => {
    const { type } = e.data;

    switch (type) {
        /**
         * Handles the initial setting or updating of the entire text content.
         * This invalidates and clears all existing caches.
         */
        case 'setText': {
            language = e.data.language || 'js';
            lines = e.data.text.split('\n');
            lineStatesCache = []; // Clear the memory upon receiving new text.
            break;
        }

        /**
         * The primary highlighting request, now handled by the imported logic.
         */
        case 'highlight': {
            if (lines.length === 0) return;

            const result = processHighlightRequest(e.data, {
                language,
                lines,
                lineStatesCache,
                getClosestCachedState,
            });

            if (result) {
                // Update our cache with the new states calculated by the logic module.
                result.newCachedStates.forEach(item => {
                    lineStatesCache[item.lineIndex] = item.state;
                });

                self.postMessage({
                    type: 'highlightResult',
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
