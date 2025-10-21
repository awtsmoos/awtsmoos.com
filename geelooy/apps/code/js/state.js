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
    githubToken: null,
    db: null,
    domItemMap: new Map(), // Maps "workspaceId::path" to { el, item }
    useTabs: true,
    expandedFolders: new Set(),
};

/**
 * --- DOM ELEMENT REFERENCES ---
 * A single source for all DOM element queries.
 */
export const DOM = {
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    hamburgerMenuBtn: document.getElementById('hamburger-menu-btn'),
    mobileSidebarToggle: document.getElementById('hamburger-sidebar-toggle'),
    mainMenu: document.getElementById('main-menu'),
    workspacesContainer: document.getElementById('workspaces-container'),
    editorWrapper: document.getElementById('editor-wrapper'),
    editor: document.getElementById('editor'),
    lineNumbers: document.getElementById('line-numbers'),
    emptyEditorMessage: document.getElementById('empty-editor-message'),
    tabBar: document.getElementById('tab-bar'),
    statusLeft: document.getElementById('status-left'),
    statusRight: document.getElementById('status-right'),
    loadingOverlay: document.getElementById('loading-overlay'),
    toastContainer: document.getElementById('toast-container'),
    genericDialog: document.getElementById('generic-dialog'),
    contextMenu: document.getElementById('context-menu'),
    findReplacePanel: document.getElementById('find-replace-panel'),
    addWorkspaceBtn: document.getElementById('add-workspace-btn'),
    findInput: document.getElementById('find-input'),
    replaceInput: document.getElementById('replace-input'),
    keyboardHelper: document.getElementById('keyboard-helper'),
};