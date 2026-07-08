
/**
 * B"H
 * @file SystemCoreValidator.js
 * @description
 * Validates the boot-time SystemCore before genesis receives it.
 */

import { looksLikeClassConstructor } from "./ModuleExportValidator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * B"H
 * Validates OlamClass.
 *
 * @param {any} OlamClass
 * Olam class.
 *
 * @returns {void}
 */
export function validateOlamClass(OlamClass) {
  if (!looksLikeClassConstructor(OlamClass)) {
    throw new Error(
      [
        "OlamClass is not constructable",
        `typeof=${typeof OlamClass}`,
        "expected=default export class from core/OlamVessel.js"
      ].join(" || ")
    );
  }
}

/**
 * B"H
 * Validates UtilsClass.
 *
 * @param {any} UtilsClass
 * Utils export.
 *
 * @returns {void}
 */
export function validateUtilsClass(UtilsClass) {
  if (!UtilsClass) {
    throw new Error("UtilsClass missing || expected default export from ckidsAwtsmoos/utils.js");
  }
}

/**
 * B"H
 * Builds and validates the system core.
 *
 * @param {any} OlamClass
 * Olam class.
 *
 * @param {any} UtilsClass
 * Utils.
 *
 * @returns {{OlamClass:any,UtilsClass:any,isReady:boolean}}
 * Ready system core.
 */
export function makeSystemCore(OlamClass, UtilsClass) {
  validateOlamClass(OlamClass);
  validateUtilsClass(UtilsClass);

  return {
    OlamClass,
    UtilsClass,
    isReady: true
  };
}
