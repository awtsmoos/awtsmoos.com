// B"H
/** @file MacroUI.js @description Payload renderer helper for future macro panel. */
export function macroPanelView(payload = {}) {
  return { type: "MacroUI", open: payload.open === true, macros: payload.macros || [], canDragToActionBar: true };
}
export default { macroPanelView };
