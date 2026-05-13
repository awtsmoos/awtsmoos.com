
/**
 * B"H
 * @file index.js
 * @description
 * The permanent compatibility gate for the Olam class.
 *
 * The previous broken version imported:
 *
 * ./core.js
 *
 * but that file only exports a named function called heescheel.
 * It does NOT default-export the Olam class.
 *
 * That caused:
 *
 * The requested module './core.js' does not provide an export named 'default'
 *
 * This file now points forever to the real Olam vessel:
 *
 * ./core/OlamVessel.js
 */

import OlamVessel from "./core/OlamVessel.js";

/**
 * B"H
 * Default Olam class export consumed by Worker boot code.
 */
export default OlamVessel;
