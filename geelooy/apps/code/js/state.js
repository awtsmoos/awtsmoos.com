//B"H
/**
 * --- APPLICATION STATE ---
 * Centralized state management for the entire application.
 * B"H - Every state change is a new creation from the Awtsmoos.
 */
export const State = {
    tabs: [],
    activeTabId: null,
    nextTabId: 0,
    workspaces: [],
    nextWorkspaceId: 0,
    contextTarget: null,
    contextTabTarget: null,
    hexEditorInstance: null,
    zipExplorerInstance: null, 
    gitDb: null,
    knownGitRoots: new Map(),
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
    clipboardCloneSource: false,
    selectedItems: new Set(), 
    
    isSelectionModeActive: false,
    
    consoleInstances: new Map(), 
    previewIframes: new Map(),   
    
    activeTasks: new Map(), 
    
    closedTabHistory: [], 

    // B"H - Intelligence & Folding State
    foldedRegistry: new Map(), 
    nextFoldId: 1,

    // B"H - Vibe Coding Settings (Vessels for Divine logic)
    vibeIterations: 1,
    customVibePrompt: "",
    isVibeStopRequested: false,
    
};

/**
 * --- DOM ELEMENT REFERENCES ---
 */
export const DOM = {};

/**
 * B"H - Finding the physical handles of the UI.
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
    
    DOM.intelligenceTooltip = document.getElementById('intelligence-tooltip');
    if (!DOM.intelligenceTooltip) {
        DOM.intelligenceTooltip = document.createElement('div');
        DOM.intelligenceTooltip.id = 'intelligence-tooltip';
        DOM.intelligenceTooltip.className = 'intelligence-tooltip hidden';
        document.body.appendChild(DOM.intelligenceTooltip);
    }
}
