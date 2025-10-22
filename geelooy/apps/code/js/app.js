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

export const App = {
    getTabString: () => State.useTabs ? '\t' : '    ',

    saveSession() {
        const persistableWorkspaces = State.workspaces
            .filter(ws => ws.type === 'github' || ws.type === 'indexeddb')
            .map(ws => {
                // We must remove non-serializable properties like 'handle'
                const { handle, ...serializableWs } = ws;
                return serializableWs;
            });

        const persistableWorkspaceIds = new Set(persistableWorkspaces.map(ws => ws.id));

        const persistableTabs = State.tabs
            .filter(tab => tab.item.workspaceId && persistableWorkspaceIds.has(tab.item.workspaceId))
            .map(tab => {
                const { handle, ...serializableItem } = tab.item;
                return serializableItem;
            });

        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        const activeTabUniquePath = activeTab && activeTab.item.workspaceId && persistableWorkspaceIds.has(activeTab.item.workspaceId)
            ? Tabs.getUniquePath(activeTab.item)
            : null;
        
        const session = {
            workspaces: persistableWorkspaces,
            openTabs: persistableTabs,
            activeTabUniquePath: activeTabUniquePath,
            expandedFolders: Array.from(State.expandedFolders) // Save expanded folders state
        };

        localStorage.setItem('vividX_session_profound', JSON.stringify(session));
    },

    loadSession() {
        const savedSession = localStorage.getItem('vividX_session_profound');
        if (!savedSession) return;

        try {
            const session = JSON.parse(savedSession);

            if (session.workspaces && Array.isArray(session.workspaces)) {
                session.workspaces.forEach(wsData => {
                    Workspaces.add(wsData, false); 
                });
            }

            if (session.openTabs && Array.isArray(session.openTabs)) {
                session.openTabs.forEach(item => {
                    Tabs.create(item, false, false);
                });
            }

            if (session.activeTabUniquePath) {
                const activeTab = State.tabs.find(t => t.uniquePath === session.activeTabUniquePath);
                if (activeTab) {
                    State.activeTabId = activeTab.id;
                }
            }

            if (session.expandedFolders && Array.isArray(session.expandedFolders)) {
                State.expandedFolders = new Set(session.expandedFolders);
            }
        } catch (e) {
            console.error("Failed to load session:", e);
            localStorage.removeItem('vividX_session_profound'); // Clear corrupted session
        }
    },

    async initialize() {
        UI.showLoading("VIVID X Initializing...");
        
        this.loadSettings();
        this.loadSession();

        this.setupEventListeners();
        
        try {
            await FileSystemProvider.IndexedDB.init();
        } catch (e) {
            UI.showToast("Browser Storage (IndexedDB) failed to initialize.", 'error');
        }
        
        Workspaces.render();
        Tabs.activate(State.activeTabId || null);
        FindReplace.init();
        Editor.init();
        
        UI.hideLoading();
        UI.showToast("Welcome to VIVID X // Profound Edition", 'success');
    },

    saveSettings: () => {
         localStorage.setItem('vividX_settings_profound', JSON.stringify({ 
             githubToken: State.githubToken,
             useTabs: State.useTabs 
         }));
    },

    loadSettings: () => {
         const settings = JSON.parse(localStorage.getItem('vividX_settings_profound') || '{}');
         State.githubToken = settings.githubToken || null;
         State.useTabs = settings.useTabs ?? true;
    },

    // B"H - In js/app.js

// PASTE THIS ENTIRE FUNCTION TO REPLACE YOUR OLD ONE
setupEventListeners() {
    // --- Element References ---
    const appContainer = document.querySelector('.app-container');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');

    // --- 1. Main Menu Button ---
    // This button's ONLY job is to show the main menu. No more mixed logic.
    if (mainMenuBtn) {
        mainMenuBtn.onclick = (e) => {
            Menus.showMainMenu(e);
        };
    }

    // --- 2. Universal Sidebar Toggle Button (Top Bar) ---
    // This button intelligently handles both mobile and desktop sidebar states.
    if (sidebarToggleBtn) {
        sidebarToggleBtn.onclick = (e) => {
            e.stopPropagation();
            const isMobile = window.matchMedia('(max-width: 768px)').matches;

            if (isMobile) {
                // On mobile, it toggles the slide-out panel.
                DOM.sidebar.classList.toggle('is-open');
                DOM.sidebarOverlay.classList.toggle('is-visible');
            } else {
                // On desktop, it toggles the collapsed state.
                appContainer.classList.toggle('sidebar-collapsed');
            }
        };
    }

    // --- 3. Internal Sidebar Collapse Button (In Header) ---
    // This button provides a second way to collapse the sidebar on desktop.
    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.onclick = () => {
            appContainer.classList.toggle('sidebar-collapsed');
        };
    }
    
    // --- 4. Mobile "Click Outside to Close" Logic ---
    // This logic is preserved and correctly handles closing the mobile sidebar.
    const closeMobileSidebar = () => {
        DOM.sidebar.classList.remove('is-open');
        DOM.sidebarOverlay.classList.remove('is-visible');
    };
    
    document.addEventListener('click', (e) => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!isMobile || !DOM.sidebar.classList.contains('is-open')) {
            return; // Only run this logic on mobile when the sidebar is open
        }

        const isClickInsideSidebar = DOM.sidebar.contains(e.target);
        const isClickOnToggleButton = sidebarToggleBtn && sidebarToggleBtn.contains(e.target);

        if (!isClickInsideSidebar && !isClickOnToggleButton) {
            closeMobileSidebar();
        }
    });

    // --- ALL YOUR OTHER EVENT LISTENERS (UNCHANGED) ---
    
    DOM.editor.addEventListener('input', () => {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !activeTab.isDirty) {
            activeTab.isDirty = true;
            Tabs.render();
        }
        UI.updateLineNumbers();
    });
    DOM.editor.addEventListener('scroll', UI.syncScroll);
    DOM.editor.addEventListener('keyup', StatusBar.update);
    DOM.editor.addEventListener('click', StatusBar.update);
    new ResizeObserver(UI.updateLineNumbers).observe(DOM.editor);

    DOM.contextMenu.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) Menus.handleAction(button.dataset.action);
    });
    DOM.mainMenu.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button && !button.disabled) Menus.handleAction(button.dataset.action);
    });

    DOM.addWorkspaceBtn.onclick = () => this.showAddWorkspaceDialog();

    window.addEventListener('keydown', (e) => {
        const hasModifier = e.ctrlKey || e.metaKey;
        if (hasModifier && e.key.toLowerCase() === 's') { e.preventDefault(); Tabs.saveActive(); }
        if (hasModifier && e.key.toLowerCase() === 'f') { e.preventDefault(); FindReplace.show(); }
        if (e.key === 'Escape') {
            if (DOM.genericDialog.classList.contains('visible')) {
                const cancelButton = DOM.genericDialog.querySelector('#dialog-cancel-btn');
                if (cancelButton) cancelButton.click();
                return;
            }
            if (DOM.findReplacePanel.style.display !== 'none') FindReplace.hide();
            else Menus.hideAll();
        }
    });

    const handleTabInInputs = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const input = e.target;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.setRangeText(App.getTabString(), start, end, 'end');
        }
    };
    DOM.findInput.addEventListener('keydown', handleTabInInputs);
    DOM.replaceInput.addEventListener('keydown', handleTabInInputs);

    DOM.editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const editor = DOM.editor;
            const fullText = editor.value;
            const cursorPosition = editor.selectionStart;
            const lineStartPos = fullText.substring(0, cursorPosition).lastIndexOf('\n') + 1;
            const currentLineText = fullText.substring(lineStartPos, cursorPosition);
            const leadingWhitespaceMatch = currentLineText.match(/^\s*/);
            const indent = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : '';
            const textToInsert = '\n' + indent;
            editor.setRangeText(textToInsert, cursorPosition, editor.selectionEnd, 'end');
            editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    DOM.keyboardHelper.addEventListener('click', (e) => {
        const button = e.target.closest('button.kh-btn');
        if (!button) return;
        const editor = DOM.editor;
        const key = button.dataset.key;
        const pair = button.dataset.pair;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        if (pair) {
            const [charStart, charEnd] = pair;
            const selectedText = editor.value.substring(start, end);
            const textToInsert = charStart + selectedText + charEnd;
            editor.setRangeText(textToInsert, start, end, 'select');
            if (start === end) {
                editor.selectionStart = editor.selectionEnd = start + 1;
            }
        } else if (key === 'tab') {
            editor.setRangeText(App.getTabString(), start, end, 'end');
        }
        editor.focus();
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    });

    window.addEventListener('beforeunload', () => this.saveSession());
},

    async showAddWorkspaceDialog() {
        const contentHTML = `
            <div id="workspace-options">
                <button class="menu-button" data-action="local"><svg class="svg-icon"><use href="#icon-laptop"></use></svg> Local Folder</button>
                <button class="menu-button" data-action="github"><svg class="svg-icon"><use href="#icon-github"></use></svg> GitHub Repository</button>
                <button class="menu-button" data-action="idb"><svg class="svg-icon"><use href="#icon-brain"></use></svg> Browser Storage</button>
            </div>`;
        
        UI.showDialog({ 
            title: 'Add New Workspace', contentHTML, okText: '', cancelText: 'Cancel'
        });

        const optionsContainer = document.getElementById('workspace-options');
        if (!optionsContainer) return;

        optionsContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const button = e.target.closest('button');
            if (!button) return;
            const action = button.dataset.action;
            DOM.genericDialog.classList.remove('visible');
            switch (action) {
                case 'local': this.addLocalWorkspace(); break;
                case 'github': this.addGithubWorkspace(); break;
                case 'idb': this.addIdbWorkspace(); break;
            }
        });
    },

    async addLocalWorkspace() {
        try {
            const handle = await window.showDirectoryPicker();
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
                     throw new Error('Permission to write to directory was denied.');
                }
            }
            Workspaces.add({ name: `💻 ${handle.name}`, type: 'local', handle });
            // Note: We don't save the session here as local workspaces are not persistable.
        } catch (e) {
            if (e.name !== 'AbortError') UI.showToast(`Could not open directory: ${e.message}`, 'error');
        }
    },

    addIdbWorkspace() {
        Workspaces.add({ name: '🧠 Browser Storage', type: 'indexeddb' });
    },

    async addGithubWorkspace() {
        if (!State.githubToken) {
            const token = await UI.showDialog({ title: "GitHub Personal Access Token", message: "Enter a PAT with 'repo' scope:", hasInput: true, inputType: 'password', placeholder: "ghp_...", cancelText: 'Cancel'});
            if (token) { State.githubToken = token; this.saveSettings(); } else return;
        }
        UI.showLoading("Fetching repositories...");
        try {
            const repos = await FileSystemProvider.GitHub.api('/user/repos?sort=updated&per_page=100');
            const repoListHTML = repos.map(repo => `<button class="menu-button" data-repo-full-name="${repo.full_name}">${repo.full_name}</button>`).join('');
            
            UI.showDialog({ title: 'Select a Repository', contentHTML: `<div style="max-height: 50vh; overflow-y: auto;">${repoListHTML}</div>`, okText: '', cancelText: 'Cancel'});
            
            document.getElementById('dialog-content').querySelectorAll('.menu-button').forEach(btn => {
                btn.onclick = (e) => {
                    const fullName = btn.dataset.repoFullName;
                    const [owner, repoName] = fullName.split('/');
                    const repoData = repos.find(r => r.full_name === fullName);
                    Workspaces.add({ name: `📦 ${fullName}`, type: 'github', repoInfo: { owner, repo: repoName }, branch: repoData.default_branch });
                    DOM.genericDialog.classList.remove('visible');
                };
            });
        } catch (e) {
            UI.showToast(`Failed to fetch repos: ${e.message}`, 'error');
            const clearToken = await UI.showDialog({title: "Authentication Error", message: "Your GitHub token may be invalid. Clear the saved token and try again?", okText: "Clear Token", cancelText: "Cancel"});
            if (clearToken) { State.githubToken = null; this.saveSettings(); UI.showToast("GitHub token cleared.", "info"); }
        } finally { UI.hideLoading(); }
    },
    
    async openLocalFile() {
        try {
            if (!window.showOpenFilePicker) {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const content = await file.text();
                        Tabs.createTemporary(file.name, content);
                    }
                };
                input.click();
                return;
            }
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const content = await file.text();
            Tabs.createTemporary(file.name, content);
        } catch (err) {
            if (err.name !== 'AbortError') {
                UI.showToast(`Error opening file: ${err.message}`, 'error');
            }
        }
    },

    async showSettings() {
        const contentHTML = `
            <label for="github-token-input" style="font-weight: 600; margin-bottom: -8px;">GitHub Personal Access Token</label>
            <input type="password" id="github-token-input" value="${State.githubToken || ''}" placeholder="ghp_...">
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
                <input type="checkbox" id="use-tabs-checkbox" ${State.useTabs ? 'checked' : ''} style="width: auto;">
                <label for="use-tabs-checkbox">Use Tab Characters (instead of spaces)</label>
            </div>
        `;
        const result = await UI.showDialog({ title: 'Settings', contentHTML, okText: 'Save', cancelText: 'Cancel' });

        if (result) {
            const token = document.getElementById('github-token-input').value;
            State.githubToken = token || null;
            State.useTabs = document.getElementById('use-tabs-checkbox').checked;
            this.saveSettings();
            UI.showToast('Settings saved.', 'success');
        }
    },
};