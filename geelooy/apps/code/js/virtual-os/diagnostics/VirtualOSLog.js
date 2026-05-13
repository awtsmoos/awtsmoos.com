
// B"H
/**
 * @file VirtualOSLog.js
 * @description
 * Diagnostic shofar for the Virtual OS.
 * Every stage now announces itself so the black void can never hide.
 */

const PREFIX = '[VirtualOS] B"H';

/**
 * @function log
 * @param {string} stage The stage name.
 * @param {object} data Extra revealed state.
 * @returns {void}
 */
export function log(stage, data = {}) {
    console.log(`${PREFIX} - ${stage}`, data);
}

/**
 * @function warn
 * @param {string} stage The warning stage.
 * @param {object} data Extra revealed state.
 * @returns {void}
 */
export function warn(stage, data = {}) {
    console.warn(`${PREFIX} - ${stage}`, data);
}

/**
 * @function error
 * @param {string} stage The error stage.
 * @param {unknown} thrown The thrown rupture.
 * @param {object} data Extra revealed state.
 * @returns {void}
 */
export function error(stage, thrown, data = {}) {
    console.error(`${PREFIX} - ${stage}`, thrown, data);
}
