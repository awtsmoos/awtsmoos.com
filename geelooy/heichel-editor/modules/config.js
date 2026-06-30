// B"H
/**
 * @module EditorConfig
 * @description
 * Reads the Heichel editor route without inventing identity; governance should
 * begin with clear names, not convenient ghosts.
 */

/**
 * Extracts editor route parameters.
 * @param {Location} locationValue browser location
 * @returns {{heichelId:string, actorAlias:string, missing:string[]}}
 */
export function readEditorConfig(locationValue) {
  const params = new URLSearchParams(locationValue.search);
  const heichelId = (params.get("heichel") || "").trim();
  const actorAlias = (params.get("alias") || "").trim();
  const missing = [];
  if (!heichelId) missing.push("heichel");
  if (!actorAlias) missing.push("alias");
  return { heichelId, actorAlias, missing };
}
