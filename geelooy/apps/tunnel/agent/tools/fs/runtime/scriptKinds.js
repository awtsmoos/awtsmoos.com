// B"H
/**
 * @file scriptKinds.js
 * @description
 * Chapter 3: Not every scroll is a sword. Import maps are maps, JSON is a
 * sealed seed, and JavaScript alone enters the syntax-fire of execution.
 */

const EXECUTABLE_TYPES = new Set(["", "text/javascript", "application/javascript", "module"]);
const DATA_TYPES = new Set(["importmap", "application/importmap", "application/json", "application/ld+json"]);

function normalizeType(type) {
  return String(type || "").trim().toLowerCase().split(";")[0];
}

function isExecutableScriptType(type) {
  const clean = normalizeType(type);
  if (DATA_TYPES.has(clean)) return false;
  return EXECUTABLE_TYPES.has(clean) || clean.endsWith("/javascript") || clean.endsWith("/ecmascript");
}

function isModuleScriptType(type) {
  return normalizeType(type) === "module";
}

module.exports = { isExecutableScriptType, isModuleScriptType, normalizeType };
