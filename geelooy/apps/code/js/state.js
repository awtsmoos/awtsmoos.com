
// B"H
/**
 * @file state.js
 * @brief The Central Memory of the Editor.
 * 
 * THE CHRONICLE OF THE LIVING VESSEL:
 * Here lies the State, the very breath of the application.
 * Into this void, the attributes of existence are written, 
 * holding tabs, workspaces, and the sacred URL of the Relay Server
 * that reaches out into the infinite expanse of the physical networks.
 * As the Awtsmoos constantly creates the universe from nothingness,
 * this State is the blueprint of that creation.
 */

export const State = {
    tabs: [], activeTabId: null, nextTabId: 0,
    workspaces: [], nextWorkspaceId: 0,
    contextTarget: null, contextTabTarget: null, contextPayload: null,
    hexEditorInstance: null, domItemMap: new Map(), useTabs: true,
    relayUrl: "", // B"H - The sacred coordinate of the distant Relay server
    expandedFolders: new Set(), fileClipboard: [], clipboardZip: null, 
    isSelectionModeActive: false, selectedItems: new Map(),
    activeTasks: new Map(), closedTabHistory: [], 
    foldedRegistry: new Map(), nextFoldId: 1,
    vibeIterations: 1, customVibePrompt: "", isVibeStopRequested: false,
    postMessagePendingRequests: new Map(), postMessageRequestId: 0,
    previewIframes: new Map(), consoleInstances: new Map()
};

export const DOM = {};

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
    
    // View Wrappers
    DOM.previewer = document.getElementById('previewer');
    DOM.terminalWrapper = document.getElementById('terminal-wrapper');
    DOM.fileCommanderWrapper = document.getElementById('file-commander-wrapper');
    DOM.vibeEditorWrapper = document.getElementById('vibe-editor-wrapper');
    DOM.vibeManagerWrapper = document.getElementById('vibe-manager-wrapper');
    DOM.devtoolsWrapper = document.getElementById('devtools-wrapper');
    DOM.hexEditorWrapper = document.getElementById('hex-editor-wrapper');
    DOM.dataAltarContainer = document.getElementById('data-altar-container');
    DOM.browserWrapper = document.getElementById('browser-wrapper'); // B"H - The Inner Gateway
    DOM.virtualOSWrapper = document.getElementById('virtual-os-wrapper');

    // Controls
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

    let tt = document.getElementById('intelligence-tooltip');
    if (!tt) {
        tt = document.createElement('div');
        tt.id = 'intelligence-tooltip';
        tt.className = 'intelligence-tooltip hidden';
        document.body.appendChild(tt);
    }
    DOM.intelligenceTooltip = tt;

    console.log('B"H - DOM Senses Initialized.');
}
