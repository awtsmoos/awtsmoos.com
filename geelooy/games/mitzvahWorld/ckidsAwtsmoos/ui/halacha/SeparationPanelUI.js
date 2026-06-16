// B"H
/** @file SeparationPanelUI.js @description Payload view helper for the educational separation panel. */
export function separationPanelView(payload = {}) { return { type: "SeparationPanelUI", open: payload.open === true, activeItemId: payload.activeItemId, steps: payload.steps || [], item: payload.item || null, disclaimer: "Educational gameplay, not practical halacha." }; }
export default { separationPanelView };
