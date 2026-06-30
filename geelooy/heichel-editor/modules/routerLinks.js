// B"H
/**
 * @module EditorRouterLinks
 * @description
 * Builds fallback routes for missing editor context without guessing identity.
 */

/**
 * Links offered when the editor cannot safely submit.
 * @returns {Array<{href:string,label:string}>}
 */
export function missingParamLinks() {
  return [
    { href: "/profile", label: "Choose Alias" },
    { href: "/heichelos", label: "Open Heichelos" }
  ];
}
