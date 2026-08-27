// B"H
/**
 * @file parent-paths.js
 * Chapter 11: before the final vessel appears, every chamber above it is born.
 * A slash in a name is not a failure; it is a staircase awaiting creation.
 */

/**
 * B"H - Lists parent directory paths for a relative item path.
 * @param {string} path Relative workspace path.
 * @returns {string[]} Parent paths from shallow to deep.
 */
export function parentPathsFor(path) {
    const parts = String(path || '').replace(/\\/g, '/').split('/').filter(Boolean);
    parts.pop();
    const parents = [];
    let walk = '';
    for (const part of parts) {
        walk += '/' + part;
        parents.push(walk || '/');
    }
    return parents;
}
