// B"H
/** @file ChatPanelUI.js @description Payload renderer helper for future DOM chat panel. */
export function chatPanelView(payload = {}) {
  return { type: "ChatPanelUI", open: payload.open === true, tabs: payload.tabs || [], activeTab: payload.activeTab || "General", messages: payload.visible || payload.messages || [], input: payload.input || "" };
}
export default { chatPanelView };
