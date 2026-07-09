// B"H
/** Validates the boot-time SystemCore before genesis receives it. */
import { looksLikeClassConstructor } from "./ModuleExportValidator.js";
export function validateOlamClass(OlamClass) {
  if (!looksLikeClassConstructor(OlamClass)) {
    throw new Error([
      "OlamClass is not constructable",
      `typeof=${typeof OlamClass}`,
      "expected=default export class from ckidsAwtsmoos/Olam/index.js"
    ].join(" || "));
  }
}
export function validateUtilsClass(UtilsClass) {
  if (!UtilsClass) throw new Error("UtilsClass missing || expected default export from ckidsAwtsmoos/utils.js");
}
export function makeSystemCore(OlamClass, UtilsClass) {
  validateOlamClass(OlamClass);
  validateUtilsClass(UtilsClass);
  return { OlamClass, UtilsClass, isReady:true };
}
