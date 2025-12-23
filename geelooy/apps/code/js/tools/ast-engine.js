
// B"H
// FILE: code/js/state.js

/**
 * --- APPLICATION STATE ---
 * Centralized state management for the entire application.
 */
export const State = {
    tabs: [],
    activeTabId: null,
    nextTabId: 0,
    workspaces: [],
    nextWorkspaceId: 0,
    contextTarget: null,
    contextTabTarget: null, // B"H - Current tab targeted for context menu
    hexEditorInstance: null,
    zipExplorerInstance: null, 
    gitDb: null,
    
    postMessageRequestId: 0,
    postMessagePendingRequests: new Map(),
    
    contextEvent: null,
    githubToken: null,
    db: null,
    domItemMap: new Map(), // uniquePath -> { el, item }
    useTabs: true,
    expandedFolders: new Set(), // uniquePaths of expanded dirs
    
    fileClipboard: [], 
    clipboardZip: null, 
    selectedItems: new Set(), 
    
    isSelectionModeActive: false,
    
    consoleInstances: new Map(), 
    previewIframes: new Map(),   
    
    activeTasks: new Map(), // B"H - background taskId -> { card, label }
    
    closedTabHistory: [], // B"H - Stack for reopening tabs

    // B"H - NEW: Intelligence & Folding State
    // We keep a global registry for simplicity, keyed by the unique ID inside the fold marker.
    foldedRegistry: new Map(), 
    nextFoldId: 1
};

/**
 * --- DOM ELEMENT REFERENCES ---
 */
export const DOM = {};

/**
 * This function finds all DOM elements and populates the DOM object.
 */
export function initializeDOM() {
    DOM.sidebar = document.getElementById('sidebar');
    DOM.sidebarOverlay = document.getElementById('sidebar-overlay');
    DOM.hamburgerMenuBtn = document.getElementById('main-menu-btn');      
    DOM.mobileSidebarToggle = document.getElementById('sidebar-toggle-btn'); 
    
    DOM.mainMenu = document.getElementById('main-menu');
    DOM.workspacesContainer = document.getElementById('workspaces-container');
    DOM.editorWrapper = document.getElementById('editor-wrapper');
    DOM.editor = document.getElementById('editor');
    DOM.lineNumbers = document.getElementById('line-numbers');
    DOM.emptyEditorMessage = document.getElementById('empty-editor-message');
    DOM.tabBar = document.getElementById('tab-bar');
    DOM.statusLeft = document.getElementById('status-left');
    DOM.statusRight = document.getElementById('status-right');
    DOM.loadingOverlay = document.getElementById('loading-overlay');
    DOM.toastContainer = document.getElementById('toast-container');
    DOM.genericDialog = document.getElementById('generic-dialog');
    DOM.contextMenu = document.getElementById('context-menu');
    DOM.findReplacePanel = document.getElementById('find-replace-panel');
    DOM.addWorkspaceBtn = document.getElementById('add-workspace-btn');
    DOM.findInput = document.getElementById('find-input');
    DOM.replaceInput = document.getElementById('replace-input');
    DOM.keyboardHelper = document.getElementById('keyboard-helper');
    
    DOM.viewConsoleBtn = document.getElementById('view-console-btn');
    DOM.previewer = document.getElementById('previewer');
    DOM.customMenuContainer = document.getElementById("custom-menu-container")
    DOM.consoleHost = document.getElementById('console-host');
    DOM.iframeCache = document.getElementById('iframe-cache');
    DOM.selectionMenu = document.getElementById('selection-menu');
    DOM.hexNavPad = document.getElementById('hex-nav-pad');
    DOM.dataAltarContainer = document.getElementById("data-altar-container");
	DOM.hexEditorWrapper = document.getElementById('hex-editor-wrapper');
    DOM.zipExplorerWrapper = document.getElementById('zip-editor-wrapper');
    
    // B"H - New Element
    DOM.intelligenceTooltip = document.getElementById('intelligence-tooltip');
    if (!DOM.intelligenceTooltip) {
        DOM.intelligenceTooltip = document.createElement('div');
        DOM.intelligenceTooltip.id = 'intelligence-tooltip';
        DOM.intelligenceTooltip.className = 'intelligence-tooltip hidden';
        document.body.appendChild(DOM.intelligenceTooltip);
    }
}
