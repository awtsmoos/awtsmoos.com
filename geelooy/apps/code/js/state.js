// B"H
// FILE: js/state.js

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
    hexEditorInstance: null,
    zipExplorerInstance: null, // B"H - Instance for the Zip Explorer
    gitDb: null,
    
    postMessageRequestId: 0,
    postMessagePendingRequests: new Map(),
    
    
    contextEvent: null,
    githubToken: null,
    db: null,
    domItemMap: new Map(),
    useTabs: true,
    expandedFolders: new Set(),
    
    
    fileClipboard: [], // Will store the full item objects to be copied
    clipboardZip: null, // B"H - Stores a Blob when "Copy as ZIP" is used
    selectedItems: new Set(), // Will store unique paths of selected items in the UI
    
    isSelectionModeActive: false,
    
    consoleInstances: new Map(), // Maps a console tab ID to its Console instance
    previewIframes: new Map(),   // Maps an HTML preview tab ID to its iframe element
    


};

/**
 * --- DOM ELEMENT REFERENCES ---
 * This is now an empty shell that will be populated AFTER the page has loaded.
 */
export const DOM = {};

/**
 * This new function is the core of the fix. It finds all DOM elements
 * and populates the DOM object. It must be called only after the
 * DOM is fully loaded.
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
    
    DOM.selectionMenu = document.getElementById('selection-menu');
    
    DOM.previewer = document.getElementById('previewer');
    
    DOM.customMenuContainer = document.getElementById("custom-menu-container")
    
     // This will now correctly find the element.
     DOM.consoleHost = document.getElementById('console-host');
    DOM.iframeCache = document.getElementById('iframe-cache');
    
    DOM.selectionMenu = document.getElementById('selection-menu');
    DOM.hexNavPad = document.getElementById('hex-nav-pad');
    DOM.dataAltarContainer = document.getElementById("data-altar-container");

	DOM.hexEditorWrapper = document.getElementById('hex-editor-wrapper');
    DOM.zipExplorerWrapper = document.getElementById('zip-editor-wrapper'); // B"H
}