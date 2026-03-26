
// B"H
/**
 * @file ResponseParser.js
 * @brief The legacy conduit to the new parsing realm.
 */

import { MARKERS, PathNormalizer, BlockExtractor } from './parser/index.js';

export const ResponseParser = {
    START_MARKER: MARKERS.START,
    END_MARKER: MARKERS.END,
    
    parseChanges(text, sessionRootPath) {
        return BlockExtractor.extract(text, sessionRootPath);
    },

    _normalizePath(root, file) {
        return PathNormalizer.normalize(root, file);
    }
};
