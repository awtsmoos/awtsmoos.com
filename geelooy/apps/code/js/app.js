// B"H
// FILE: js/app.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';
import { StatusBar } from './statusbar.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { Workspaces } from './workspaces.js';
import { Menus } from './menus.js';
import { FindReplace } from './find-replace.js';

/**
 * App Module: Main application controller and initializer.
 */
export const App = {
    getTabString: () => State.useTabs ? '\t' : '    ',

    // --- B"H: NEW SESSION MANAGEMENT FUNCTIONS ---

    saveSession() {
        // 1. Filter out workspaces that we cannot save (like local folders).
        const persistableWorkspaces = State.workspaces.filter(ws => ws.type === 'github' || ws.type === 'indexeddb');
        const persistableWorkspaceIds = new Set(persistableWorkspaces.map(ws => ws.id));

        // 2. Filter out tabs that belong to non-persistable workspaces.
        const persistableTabs = State.tabs
            .filter(tab => persistableWorkspaceIds.has(tab.item.workspaceId))
            .map(tab => tab.item); // We only need to save the 'item' object for each tab.

        // 3. Find the unique path of the active tab, if it's persistable.
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        const activeTabUniquePath = activeTab && persistableWorkspaceIds.has(activeTab.item.workspaceId)
            ? Tabs.getUniquePath(activeTab.item)
            : null;
        
        const session = {
            workspaces: persistableWorkspaces,
            openTabs: persistableTabs,
            activeTabUniquePath: activeTabUniquePath
        };

        localStorage.setItem('vividX_session_profound', JSON.stringify(session));
    },

    loadSession() {
        const savedSession = localStorage.getItem('vividX_session_profound');
        if (!savedSession) return;

        const session = JSON.parse(savedSession);

        // 1. Re-populate the workspaces state.
        if (session.workspaces && Array.isArray(session.workspaces)) {
            session.workspaces.forEach(wsData => {
                // We call the existing add function, but prevent it from saving again immediately.
                Workspaces.add(wsData, false); 
            });
        }

        // 2. Re-create the tabs. The create function handles everything else.
        if (session.openTabs && Array.isArray(session.openTabs)) {
            session.openTabs.forEach(item => {
                Tabs.create(item, false, false); // Don't activate, don't re-save
            });
        }

        // 3. Find which tab should be active.
        if (session.activeTabUniquePath) {
            const activeTab = State.tabs.find(t => t.uniquePath === session.activeTabUniquePath);
            if (activeTab) {
                State.activeTabId = activeTab.id;
            }
        }
    },
    // --- END NEW SESSION FUNCTIONS ---

    async initialize() {
        UI.showLoading("VIVID X Initializing...");
        
        this.loadSettings();
        this.loadSession(); // Load saved workspaces and tabs BEFORE setting up listeners

        this.setupEventListeners();
        
        try {
            await FileSystemProvider.IndexedDB.init();
        } catch (e) {
            UI.showToast("Browser Storage (IndexedDB) failed to initialize.", 'error');
        }
        
        Workspaces.render(); // Render the loaded workspaces
        Tabs.activate(State.activeTabId || null); // Activate the loaded active tab
        FindReplace.init();
        
        UI.hideLoading();
        UI.showToast("Welcome to VIVID X // Profound Edition", 'success');
    },

    // ... (rest of the file is largely the same, but we add saveSession calls)

    saveSettings: () => { /* ... unchanged ... */ },
    loadSettings: () => { /* ... unchanged ... */ },
    setupEventListeners() {
        // ... all existing listeners ...

        // Add a final catch-all save when the user leaves the page.
        window.addEventListener('beforeunload', () => this.saveSession());
    },
    
    // In every function that adds a workspace, we now call saveSession.
    async addLocalWorkspace() {
        // Local workspaces are not saved, so no saveSession call here.
        try {
            const handle = await window.showDirectoryPicker();
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
                     throw new Error('Permission to write to directory was denied.');
                }
            }
            Workspaces.add({ name: `💻 ${handle.name}`, type: 'local', handle });
        } catch (e) {
            if (e.name !== 'AbortError') UI.showToast(`Could not open directory: ${e.message}`, 'error');
        }
    },
    addIdbWorkspace() {
        Workspaces.add({ name: '🧠 Browser Storage', type: 'indexeddb' });
        this.saveSession(); // SAVE
    },
    async addGithubWorkspace() {
        // ... (existing logic) ...
        try {
            // ...
            document.getElementById('dialog-content').querySelectorAll('.menu-button').forEach(btn => {
                btn.onclick = (e) => {
                    // ... (existing logic to create workspace)
                    Workspaces.add({ name: `📦 ${fullName}`, type: 'github', /*...*/ });
                    DOM.genericDialog.classList.remove('visible');
                    this.saveSession(); // SAVE
                };
            });
        } catch (e) {
            // ... (existing error handling) ...
        } finally { UI.hideLoading(); }
    },
    
    // ... (rest of the functions: showAddWorkspaceDialog, openLocalFile, showSettings are unchanged)
};