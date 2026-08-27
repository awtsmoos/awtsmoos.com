
// B"H
/**
 * @file ResponseParser.js
 * @brief The High-Level Dissector of the Oracle's Response.
 */

import { MARKERS, PathNormalizer, BlockExtractor } from './parser/index.js';

export const ResponseParser = {
    START_MARKER: MARKERS.START,
    END_MARKER: MARKERS.END,
    
    /**
     * B"H
     * Dissects the raw text emanation from the AI into physical change directives.
     * 
     * @param {string} text - The raw speech from the model.
     * @param {string} sessionRootPath - The current virtual project root.
     * @returns {Array<Object>} The array of solidified changes.
     */
    parseChanges(text, sessionRootPath) {
        return BlockExtractor.extract(text, sessionRootPath);
    },

    /**
     * @private
     * B"H - Forces the alignment of conceptual paths with physical reality.
     */
    _normalizePath(root, file) {
        return PathNormalizer.normalize(root, file);
    }
};
