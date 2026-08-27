// B"H
/** Shared browser-side state vessel for legacy Vibe modules. */
export const State = globalThis.AwtsmoosState ||= {
  workspaces: [],
  tabs: [],
  domItemMap: new Map(),
  activeTabId: null
};
