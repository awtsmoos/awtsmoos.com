
// B"H
/**
 * @file path.js
 * @description
 * Path harmonizer for the small desktop universe.
 */

/**
 * @function normalizePath
 * @param {unknown} value Any path-like vessel.
 * @returns {string} Absolute normalized path.
 */
export function normalizePath(value = '/') {
    const text = String(value || '/').replaceAll('\\', '/').replace(/\/+/g, '/');
    return text.startsWith('/') ? text : `/${text}`;
}

/**
 * @function containsPath
 * @param {string} child Possible child path.
 * @param {string} parent Possible parent path.
 * @returns {boolean} True if child lives under parent.
 */
export function containsPath(child, parent) {
    const c = normalizePath(child);
    const p = normalizePath(parent);
    if (p === '/') return true;
    return c === p || c.startsWith(`${p.replace(/\/+$/, '')}/`);
}

/**
 * @function joinPath
 * @param {string} base Base path.
 * @param {string} next Next path.
 * @returns {string} Joined path.
 */
export function joinPath(base = '/', next = '') {
    const b = normalizePath(base).replace(/\/+$/, '');
    return normalizePath(`${b}/${next}`);
}

/**
 * @function baseName
 * @param {string} path Path.
 * @returns {string} Base name.
 */
export function baseName(path = '/') {
    const parts = normalizePath(path).split('/').filter(Boolean);
    return parts.at(-1) || 'Root';
}
