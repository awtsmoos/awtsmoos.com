
// B"H
// FILE: js/state.js

export const State = {
    tabs:[], activeTabId: null, nextTabId: 0,
    workspaces:[], nextWorkspaceId: 0,
    contextTarget: null, contextTabTarget: null,
    hexEditorInstance: null, domItemMap: new Map(), useTabs: true,
    expandedFolders: new Set(), fileClipboard:[], clipboardZip: null, 
    isSelectionModeActive: false, selectedItems: new Set(),
    activeTasks: new Map(), closedTabHistory:[], 
    foldedRegistry: new Map(), nextFoldId: 1,
    vibeIterations: 1, customVibePrompt: "", isVibeStopRequested: false,
    postMessagePendingRequests: new Map(), postMessageRequestId: 0,
    previewIframes: new Map(), consoleInstances: new Map()
};

export const DOM = {};

/**
 * B"H - COMPLETE AND UNCOMPROMISING DOM INITIALIZATION.
 * Every vessel is found and bound.
 */
export function initializeDOM() {
    DOM.sidebar = document.getElementById('sidebar');
    DOM.workspacesContainer = document.getElementById('workspaces-container');
    DOM.tabBar = document.getElementById('tab-bar');
    DOM.editor = document.getElementById('editor');
    DOM.editorWrapper = document.getElementById('editor-wrapper');
    DOM.lineNumbers = document.getElementById('line-numbers');
    DOM.statusLeft = document.getElementById('status-left');
    DOM.statusRight = document.getElementById('status-right');
    DOM.emptyEditorMessage = document.getElementById('empty-editor-message');
    DOM.previewer = document.getElementById('previewer');
    
    // B"H - Absolute Expansion Rectification
    // Forces the wrapper to violently claim all horizontal and vertical territory.
    let dtWrap = document.getElementById('devtools-wrapper');
    if (!dtWrap) {
        dtWrap = document.createElement('div');
        dtWrap.id = 'devtools-wrapper';
        dtWrap.className = 'hidden';
        dtWrap.style.cssText = 'height: 100%; width: 100%; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden;';
        document.querySelector('.editor-area').appendChild(dtWrap);
    }
    DOM.devtoolsWrapper = dtWrap;
    
    DOM.hamburgerMenuBtn = document.getElementById('main-menu-btn');
    DOM.addWorkspaceBtn = document.getElementById('add-workspace-btn');
    DOM.sidebarSearchBtn = document.getElementById('sidebar-search-btn');
    DOM.sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
    DOM.mobileSidebarToggle = document.getElementById('sidebar-toggle-btn');
    DOM.fileCommanderBtn = document.getElementById('file-commander-btn');

    DOM.loadingOverlay = document.getElementById('loading-overlay');
    DOM.toastContainer = document.getElementById('toast-container');
    DOM.mainMenu = document.getElementById('main-menu');
    DOM.contextMenu = document.getElementById('context-menu');
    DOM.genericDialog = document.getElementById('generic-dialog');
    DOM.selectionMenu = document.getElementById('selection-menu');

    DOM.findReplacePanel = document.getElementById('find-replace-panel');
    DOM.findInput = document.getElementById('find-input');
    DOM.replaceInput = document.getElementById('replace-input');
    DOM.keyboardHelper = document.getElementById('keyboard-helper');

    DOM.hexEditorWrapper = document.getElementById('hex-editor-wrapper');
    DOM.dataAltarContainer = document.getElementById('data-altar-container');

    let tt = document.getElementById('intelligence-tooltip');
    if (!tt) {
        tt = document.createElement('div');
        tt.id = 'intelligence-tooltip';
        tt.className = 'intelligence-tooltip hidden';
        document.body.appendChild(tt);
    }
    DOM.intelligenceTooltip = tt;
}
