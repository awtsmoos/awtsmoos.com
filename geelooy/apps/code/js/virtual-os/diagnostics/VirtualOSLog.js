
// B"H
/**
 * @file VirtualOSLog.js
 * @description
 * Diagnostic shofar for the Virtual OS.
 */

/**
 * @constant {string}
 */
const PREFIX = '[VirtualOS] B"H';

/**
 * @function log
 * @param {string} stage The stage being revealed.
 * @param {object} data Data carried by the stage.
 * @returns {void}
 */
export function log(stage, data = {}) {
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
