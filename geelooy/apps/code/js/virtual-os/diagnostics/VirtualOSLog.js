
// B"H
/**
 * @file VirtualOSLog.js
 * @description
 * Diagnostic shofar for the Virtual OS.
 */

const PREFIX = '[VirtualOS] B"H';

/**
 * @function debugEnabled
 * @returns {boolean} True if verbose debug is enabled.
 */
export function debugEnabled() {
    return localStorage.getItem('awtsmoos.virtualOS.debug') === 'true';
}

/**
 * @function log
 * @param {string} stage Stage being revealed.
 * @param {object} data Data carried by the stage.
 * @returns {void}
 */
export function log(stage, data = {}) {
    if (debugEnabled()) console.log(`${PREFIX} - ${stage}`, data);
}

/**
 * @function always
 * @param {string} stage Stage always revealed.
 * @param {object} data Data carried by the stage.
 * @returns {void}
 */
export function always(stage, data = {}) {
    console.log(`${PREFIX} - ${stage}`, data);
}

/**
 * @function warn
 * @param {string} stage Warning stage.
 * @param {object} data Warning data.
 * @returns {void}
 */
export function warn(stage, data = {}) {
    console.warn(`${PREFIX} - ${stage}`, data);
}

/**
 * @function error
 * @param {string} stage Error stage.
 * @param {unknown} thrown Error object.
 * @param {object} data Extra data.
 * @returns {void}
 */
export function error(stage, thrown, data = {}) {
    console.error(`${PREFIX} - ${stage}`, thrown, data);
}
