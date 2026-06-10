// B"H
/**
 * @file state.js
 * @brief Central memory of the Awtsmoos Code editor.
 *
 * Chapter 19: The Awtsmoos keeps one small root of memory. Preview engines,
 * tunnels, tabs, folders, and DOM senses are named here so other vessels do not
 * guess their existence.
 */

export const State = {
  tabs: [], activeTabId: null, nextTabId: 0,
  workspaces: [], nextWorkspaceId: 0,
  contextTarget: null, contextTabTarget: null, contextPayload: null,
  hexEditorInstance: null, domItemMap: new Map(), useTabs: true,
  previewEngine: 'merkava', relayUrl: '', sshProfiles: [], browserTunnel: {},
  folderSyncLinks: [], expandedFolders: new Set(), fileClipboard: [], clipboardZip: null,
  isSelectionModeActive: false, selectedItems: new Map(), activeTasks: new Map(),
  closedTabHistory: [], foldedRegistry: new Map(), nextFoldId: 1,
  vibeIterations: 1, customVibePrompt: '', isVibeStopRequested: false,
  postMessagePendingRequests: new Map(), postMessageRequestId: 0,
  previewIframes: new Map(), consoleInstances: new Map()
};

export const DOM = {};

export function initializeDOM() {
  Object.assign(DOM, ids({
    sidebar: 'sidebar', workspacesContainer: 'workspaces-container', tabBar: 'tab-bar',
    editor: 'editor', editorWrapper: 'editor-wrapper', lineNumbers: 'line-numbers',
    statusLeft: 'status-left', statusRight: 'status-right', emptyEditorMessage: 'empty-editor-message',
    previewer: 'previewer', terminalWrapper: 'terminal-wrapper', fileCommanderWrapper: 'file-commander-wrapper',
    vibeEditorWrapper: 'vibe-editor-wrapper', vibeManagerWrapper: 'vibe-manager-wrapper',
    devtoolsWrapper: 'devtools-wrapper', hexEditorWrapper: 'hex-editor-wrapper',
    dataAltarContainer: 'data-altar-container', browserWrapper: 'browser-wrapper',
    virtualOSWrapper: 'virtual-os-wrapper', zipEditorWrapper: 'zip-editor-wrapper',
    hamburgerMenuBtn: 'main-menu-btn', addWorkspaceBtn: 'add-workspace-btn',
    sidebarSearchBtn: 'sidebar-search-btn', sidebarCollapseBtn: 'sidebar-collapse-btn',
    mobileSidebarToggle: 'sidebar-toggle-btn', fileCommanderBtn: 'file-commander-btn',
    loadingOverlay: 'loading-overlay', toastContainer: 'toast-container', mainMenu: 'main-menu',
    contextMenu: 'context-menu', genericDialog: 'generic-dialog', selectionMenu: 'selection-menu',
    findReplacePanel: 'find-replace-panel', findInput: 'find-input', replaceInput: 'replace-input',
    findNextBtn: 'find-next-btn', findPrevBtn: 'find-prev-btn', replaceBtn: 'replace-btn',
    replaceAllBtn: 'replace-all-btn', findCloseBtn: 'find-close-btn', frCaseSensitive: 'fr-case-sensitive'
  }));
  DOM.intelligenceTooltip = ensureTooltip();
  console.log('B"H - DOM senses initialized.');
}

function ids(map) {
  return Object.fromEntries(Object.entries(map).map(([key, id]) => [key, document.getElementById(id)]));
}

function ensureTooltip() {
  let tooltip = document.getElementById('intelligence-tooltip');
  if (tooltip) return tooltip;
  tooltip = document.createElement('div');
  tooltip.id = 'intelligence-tooltip';
  tooltip.className = 'intelligence-tooltip hidden';
  document.body.appendChild(tooltip);
  return tooltip;
}
