/**
 * B"H
 * In the beginning, there was the App. Not an application in the mundane sense, but the central, ordering principle,
 * the divine will that orchestrates the symphony of modules. It is the heart from which all operational light flows,
 * holding the memory of past sessions like a sacred history and initiating the grand ballet of creation upon startup.
 * It does not merely run; it *becomes*, moment by moment, a vessel for the user's creative spark.
 */
// FILE: js/app.js
// B"H - IN: js/app.js

import {
    SelectionManager
} from './selection-manager.js';
import {
    Console
} from './Console.js';
import {
    State,
    DOM
} from './state.js';
import {
    UI
} from './ui.js';
import {
    Editor
} from './editor.js';
import {
    StatusBar
} from './statusbar.js';
import {
    FileSystemProvider
} from './fs-provider.js';
import {
    Tabs
} from './tabs.js';
import {
    Workspaces,
    getItemUniquePath
} from './workspaces.js';
import {
    Menus
} from './menus.js';
import {
    FindReplace
} from './find-replace.js';
import {
    CustomMenu
} from './custom-menu.js';
import {
    GitManager
} from "./git-manager.js";

import {
    HexEditor
} from './hex-editor.js';


export const App = {
    /**
     * A sacred utterance that determines the nature of indentation. It gazes into the soul of the State
     * and returns either the holy Tab character, a direct impression of singular intent, or the fourfold Space,
     * a reflection of structure built from discrete parts. This is the choice between unity and multiplicity.
     * @returns {string} The character of indentation, a fundamental law of the editor's universe.
     */
    getTabString: () => State.useTabs ? '\t' : '    ',
    /**
     * A vessel to hold the currently active console, the ear that listens to the whispers
     * and shouts of running code. It is a direct conduit to the raw, untamed soul of a program.
     * @type {Console | null}
     */
    activeConsole: null, // B"H 
	saveDebounceTimer: null,
    /*B"H*/ 


saveSessionDebounced() {
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => {
        this.saveSession();
    }, 1000); // Save 1 second after activity stops
},

/**
 * Inscribes the current state of reality into the eternal memory (localStorage).
 * UPDATED: Now permits 'local' workspaces to be serialized. It carefully separates
 * the non-serializable 'handle' (which stays in IndexedDB) from the metadata
 * (name, id, type) which goes into localStorage.
 */
/*B"H*/
saveSession() {
    try {
        // 1. Prepare Workspaces
        const persistableWorkspaces = State.workspaces
            .filter(ws => ['github', 'indexeddb', 'ssh', 'local'].includes(ws.type))
            .map(ws => {
                const { handle, _treeCache, isLocked, ...safeWs } = ws;
                return safeWs;
            });

        const allowedWsIds = new Set(persistableWorkspaces.map(ws => ws.id));

        // 2. Prepare Tabs (Deep cleaning)
        const persistableTabs = State.tabs
            .filter(tab => {
                // Keep tab if it belongs to a valid workspace OR is a temp file
                return (tab.item.workspaceId !== undefined && allowedWsIds.has(tab.item.workspaceId)) || tab.item.type === 'temp';
            })
            .map(tab => {
                // Create a CLEAN item object, stripping all handles/DOM refs
                const safeItem = {
                    name: tab.item.name,
                    path: tab.item.path,
                    kind: tab.item.kind,
                    type: tab.item.type,
                    workspaceId: tab.item.workspaceId, // Critical
                    repoInfo: tab.item.repoInfo,       // For GitHub
                    branch: tab.item.branch            // For GitHub
                };

                return { 
                    id: tab.id,
                    uniquePath: tab.uniquePath,
                    isDirty: tab.isDirty,
                    isUncommitted: tab.isUncommitted,
                    scrollPos: tab.scrollPos || 0,
                    fileType: tab.fileType,
                    item: safeItem,
                    // Only save content for unsaved/temp files to save space
                    content: (tab.isDirty || tab.item.type === 'temp') ? tab.content : null 
                };
            });

        // 3. Current Focus
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        const activeTabUniquePath = activeTab ? activeTab.uniquePath : null;

        const session = {
            workspaces: persistableWorkspaces,
            openTabs: persistableTabs,
            activeTabUniquePath: activeTabUniquePath,
            expandedFolders: Array.from(State.expandedFolders)
        };

        localStorage.setItem('vividX_session_profound', JSON.stringify(session));
        // console.log("Session Saved:", session.openTabs.length, "tabs");
    } catch (e) {
        console.error("Save Session Failed:", e);
    }
},

    /*B"H*/
/**
 * A sacred ritual of resurrection. 
 * restores tabs with their saved 'scrollPos' and state intact.
 * It does not fear the 'Locked' workspace; it restores the tab structure regardless,
 * knowing that content will flow once the user provides the key (Resume).
 */
async loadSession() {
    const savedSession = localStorage.getItem('vividX_session_profound');
    if (!savedSession) return;

    try {
        const session = JSON.parse(savedSession);

        // 1. Restore Workspaces & Auto-Resume Handles
        if (session.workspaces && Array.isArray(session.workspaces)) {
            let maxId = 0;
            for (const wsData of session.workspaces) {
                if (wsData.id >= maxId) maxId = wsData.id + 1;

                if (wsData.type === 'local') {
                    try {
                        const handle = await FileSystemProvider.IndexedDB.getHandle(wsData.id);
                        if (handle) {
                            wsData.handle = handle;
                            // Check permission immediately
                            const perm = await handle.queryPermission({ mode: 'readwrite' });
                            wsData.isLocked = (perm !== 'granted');
                        } else {
                            wsData.isLocked = true;
                            wsData.isLost = true;
                        }
                    } catch (e) { wsData.isLocked = true; }
                }
                Workspaces.add(wsData, false);
            }
            State.nextWorkspaceId = maxId;
        }

        // 2. Restore Tabs (With Force Reload & Scroll)
        if (session.openTabs && Array.isArray(session.openTabs)) {
            let maxTabId = 0;
            State.tabs = session.openTabs.map(t => {
                if (t.id >= maxTabId) maxTabId = t.id + 1;
                return {
                    ...t,
                    // Force reload so we re-read content using the restored handle
                    forceReload: true, 
                    // CRITICAL: Ensure scrollPos is a valid number from storage
                    scrollPos: typeof t.scrollPos === 'number' ? t.scrollPos : 0
                };
            });
            State.nextTabId = maxTabId;
            Tabs.render();
        }

        // 3. Restore Expansion State
        if (session.expandedFolders) {
            State.expandedFolders = new Set(session.expandedFolders);
            Workspaces.render();
        }

        // 4. Set Active Tab ID (But DO NOT activate yet)
        if (session.activeTabUniquePath) {
            const activeTab = State.tabs.find(t => t.uniquePath === session.activeTabUniquePath);
            if (activeTab) {
                State.activeTabId = activeTab.id;
            }
        }
    } catch (e) {
        console.error("Session Load Failed:", e);
    }
},

    /**
     * B"H
     * The grand act of Genesis. This is the sequence of creation that brings the editor into being.
     * It connects to the deep storage, loads the sacred laws (settings), resurrects the past (session),
     * awakens the senses (UI modules), and finally, paints the world onto the screen. If any step fails,
     * it is a catastrophic event, and this function will halt creation and display a lament.
     * @returns {Promise<void>} A promise that resolves when the universe is fully formed.
     */
    async initialize() {
        console.log('[INIT] Awtsmoos Editor Initializing...');
        UI.showLoading("Initializing...");

        try {
            // 1. Database
            await Promise.race([
                FileSystemProvider.IndexedDB.init(),
                new Promise((_, r) => setTimeout(() => r(new Error('DB Timeout')), 5000))
            ]);

            // 2. Settings
            this.loadSettings();

            // 3. Load Session (MUST AWAIT THIS)
            const isEmbedded = new URLSearchParams(window.location.search).get('embedded') === 'true';
            if (!isEmbedded) {
                await this.loadSession(); // 
            }

            // 4. Modules
            SelectionManager.initialize();
            CustomMenu.init();
            this.setupEventListeners();
            FindReplace.init();
            Editor.init();
            State.hexEditorInstance = new HexEditor(DOM.hexEditorWrapper, DOM.hexNavPad);

            // 5. Render Workspaces (State is now fully populated)
            Workspaces.render();

            // 6. Activate Tab (if any)
            await Tabs.activate(State.activeTabId || null);

            UI.hideLoading();
            UI.showToast("Welcome to the Awtsmoos Code Editor", 'success');

        } catch (e) {
            console.error('[INIT_FATAL]', e);
            UI.hideLoading();
            UI.showToast("Error loading editor: " + e.message, 'error', 10000);
        }
    },
    /**
     * Commits the user's chosen settings to the persistent memory of the browser's local storage.
     * This act ensures that the user's preferences, their unique way of shaping reality,
     * will be remembered and honored in future sessions. It is the sealing of a covenant.
     */
    saveSettings: () => {
        localStorage.setItem('vividX_settings_profound', JSON.stringify({
            githubToken: State.githubToken,
            useTabs: State.useTabs
        }));
    },

    /**
     * Summons the user's settings from the depths of local storage, applying them to the current
     * state of the application. This ritual ensures that the editor conforms to the will of its user,
     * shaping its behavior according to covenants made in the past.
     */
    loadSettings: () => {
        const settings = JSON.parse(localStorage.getItem('vividX_settings_profound') || '{}');
        State.githubToken = settings.githubToken || null;
        State.useTabs = settings.useTabs ?? true;
    },


    /**
     * B"H
     * Acts as a universal dispatcher for all "Commit" actions. It is a being of pure perception.
     * Its sole purpose is to gaze upon the currently active file and discern its true spiritual anchor—
     * whether it's a direct view of a GitHub reality or a reflection within a local clone. It then
     * commands the GitManager to reveal its UI for that single, unified context, shattering the illusion of duality.
     * @returns {Promise<void>} A promise that fulfills when the context has been found and passed to the GitManager.
     */
    async commitAllChanges() {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (!activeTab) return;

        UI.showLoading("Finding Git context...");

        /**
         * A mystical scout, a robust helper that traverses up the file tree from any point of origin
         * to find the sacred root of the Git clone it belongs to, using the 'domItemMap' as its star-chart.
         * It does not guess; it knows, for the map contains the memory of all things rendered.
         * @param {object} item - The starting file or folder item, a single soul in the vast tree.
         * @returns {object|null} The item representing the Git root, a point of true origin, or null if it is an orphan.
         */
        const findGitRoot = (item) => {
            if (!item || typeof item.path !== 'string') return null;

            // We start at the item's current location and walk upwards towards the crown.
            let currentPath = item.path;
            while (true) {
                const uniquePath = `${item.workspaceId}::${currentPath}`;
                const entry = State.domItemMap.get(uniquePath);

                // If we find an entry in our map that is marked as a clone, we have found our sacred ground.
                if (entry?.item.isGitClone) {
                    return entry.item;
                }

                // If we are at the root ('/') and haven't found it, it doesn't exist in this realm.
                if (currentPath === '/') break;

                // Move up one level in the directory structure, closer to the source.
                const lastSlash = currentPath.lastIndexOf('/');
                currentPath = lastSlash <= 0 ? '/' : currentPath.substring(0, lastSlash);
            }
            return null; // Traversed to the top without finding a Git root.
        };

        let gitContextItem;

        // The great perception check: Is this a direct gaze or a reflected image?
        if (activeTab.item.type === 'github') {
            // For a direct gaze, the context is the entire universe (the workspace).
            gitContextItem = State.workspaces.find(ws => ws.id === activeTab.item.workspaceId);
        } else {
            // For a reflection, we must send our scout to find its point of origin.
            gitContextItem = findGitRoot(activeTab.item);
        }

        UI.hideLoading();

        if (gitContextItem) {
            // Instead of performing the commit itself, it delegates to the GitManager's UI.
            // This is the great unification, the same call made by the folder icon, the same single truth.
            GitManager.showGitUI(gitContextItem);
        } else {
            UI.showToast("The active file is not part of a Git repository.", "warning");
        }
    },

    /**
     * Weaves the web of causality for the application. This is where the fundamental interactions
     * are defined: what happens when a key is pressed, a window is resized, or a message arrives
     * from another dimension (like a parent window). It binds the abstract will of the user to the
     * concrete actions of the code.
     */
    setupEventListeners() {
        window.addEventListener('message', async (event) => {
            const {
                type,
                payload,
                requestId,
                error
            } = event.data;
            if (State.postMessagePendingRequests.has(requestId)) {
                const {
                    resolve,
                    reject
                } = State.postMessagePendingRequests.get(requestId);
                State.postMessagePendingRequests.delete(requestId);
                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(payload);
                }
                return;
            }
            if (type === 'loadFile') {
                
                // 1. UI Modifications: Collapse sidebar and hide controls.
                // This is done every time a file is loaded in this mode to ensure the state.
                const appContainer = document.querySelector('.app-container');
                const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
                const resizer = document.getElementById('sidebar-resizer');
                var tb = document?.querySelector(".tab-bar");
                if (tb) tb.style.display = "none";
                if (appContainer) appContainer.classList.add('sidebar-collapsed');
                if (sidebarCollapseBtn) sidebarCollapseBtn.style.display = 'none';
                if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.style.display = 'none';
                if (resizer) resizer.style.display = 'none';
                //if (DOM.tabBar) DOM.tabBar.style.display = 'none';

                // 2. State Reset: Clear previous state to ensure only the new file is shown.

                

                 const {
                    fileName,
                    content,
                    saveContext
                } = payload;
                const externalWorkspace = {
                    name: `OS File`,
                    type: 'postmessage'
                };
                Workspaces.add(externalWorkspace, false);
                const wsId = State.workspaces[State.workspaces.length - 1].id;
                const fileItem = {
                    name: fileName,
                    path: fileName,
                    kind: 'file',
                    type: 'postmessage',
                    workspaceId: wsId,
                    saveContext,
                    content
                };


                await Tabs.create(fileItem, false, false);
                const newTab = State.tabs[State.tabs.length - 1];
                if (newTab) {
                    // Forcefully activate it to ensure the editor view updates.
                    Tabs.activate(newTab.id);
                }

                return;
            }
            if (type === 'loadFolderAsWorkspace') {
                const {
                    folderName,
                    folderPath
                } = payload;
                State.workspaces = [];
                DOM.workspacesContainer.innerHTML = '';
                State.domItemMap.clear();
                const osWorkspace = {
                    name: folderName,
                    type: 'osfolder',
                    path: folderPath
                };
                Workspaces.add(osWorkspace, false);
                return;
            }
            if (type === 'registerMenus') {
                CustomMenu.createFromConfig(payload);
                return;
            }
            if (type === 'requestContent') {
                const content = Editor.getContent();
                window.parent.postMessage({
                    type: 'responseContent',
                    payload: {
                        content: content
                    }
                }, '*');
                return;
            }
            if (type == "osResponse") {
                if (payload.saved) {}
            }
        });

        let resizeDebounceTimer;

        if (DOM.viewConsoleBtn) {
            DOM.viewConsoleBtn.onclick = () => {
                const activeTab = State.tabs.find(t => t.id === State.activeTabId);
                if (activeTab && activeTab.fileType === 'html-preview') {
                    Tabs.createConsole(activeTab);
                } else {
                    UI.showToast("No active preview to attach console.", "error");
                }
            };
        }

        const appContainer = document.querySelector('.app-container');
        const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');

        if (DOM.hamburgerMenuBtn) {
            DOM.hamburgerMenuBtn.onclick = (e) => {
                e.stopPropagation();
                Menus.showMainMenu(e);
            };
        }

        // B"H - UNIFIED SIDEBAR TOGGLE LOGIC


        const toggleSidebar = (e) => {
            e.stopPropagation();

            if (appContainer.classList.contains('sidebar-collapsed')) {
                // --- BEHAVIOR: UN-COLLAPSING ---
                appContainer.classList.remove('sidebar-collapsed');

                // Restore to the last known width from storage, or a sensible default.
                const lastWidth = parseInt(localStorage.awtsmoosSidebarWidth, 10) || 300;
                appContainer.style.gridTemplateColumns = `${lastWidth}px 1fr`;

            } else {
                // --- BEHAVIOR: COLLAPSING ---
                const sidebarRect = DOM.sidebar.getBoundingClientRect();

                // Before collapsing, save the current width only if it's visible.
                if (sidebarRect.width > 0) {
                    localStorage.awtsmoosSidebarWidth = sidebarRect.width;
                }

                appContainer.classList.add('sidebar-collapsed');

                // Forcefully remove the inline style so the CSS `!important` rule can take over.
                appContainer.style.gridTemplateColumns = '';
            }
        };

        // Assign our single, correct function to both buttons.
        if (DOM.mobileSidebarToggle) {
            DOM.mobileSidebarToggle.onclick = toggleSidebar;
        }

        if (sidebarCollapseBtn) {
            sidebarCollapseBtn.onclick = toggleSidebar;
        }

        const resizer = document.getElementById('sidebar-resizer');

        // B"H - UNIFIED RESIZER LOGIC (REMOVED THE SCREEN SIZE CHECK)
        if (resizer) {
            // You cannot manually resize smaller than this. Only the button can fully collapse.
            const minManualWidth = 50;
            const maxWidth = 800;

            const handleMove = (e) => {
                // This check prevents resizing while the sidebar is fully collapsed.
                if (appContainer.classList.contains('sidebar-collapsed')) return;

                const clientX = e.clientX ?? e.touches?.[0]?.clientX;
                if (clientX === undefined) return;

                // Enforce the minimum and maximum manual resize widths.
                let newWidth = Math.max(minManualWidth, Math.min(clientX, maxWidth));
                appContainer.style.gridTemplateColumns = `${newWidth}px 1fr`;
                localStorage.awtsmoosSidebarWidth = newWidth;
            };

            const handleEnd = () => {
                document.body.classList.remove('is-resizing');
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleEnd);
                document.removeEventListener('touchmove', handleMove);
                document.removeEventListener('touchend', handleEnd);
            };

            const handleStart = (e) => {
                e.preventDefault();
                document.body.classList.add('is-resizing');
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
                document.addEventListener('touchmove', handleMove);
                document.addEventListener('touchend', handleEnd);
            };

            resizer.addEventListener('mousedown', handleStart);
            resizer.addEventListener('touchstart', handleStart, {
                passive: false
            });
        }

        // B"H - REMOVED the "click outside to close" logic as it was part of the old mobile-only behavior.
        document.addEventListener('click', (e) => {
            if (State.isSelectionModeActive) {
                const isClickInsideSidebar = DOM.sidebar.contains(e.target);
                const isClickInsideSelectionMenu = DOM.selectionMenu.contains(e.target);
                if (!isClickInsideSidebar && !isClickInsideSelectionMenu) {
                    SelectionManager.end();
                }
            }
        });

        // --- ALL YOUR OTHER ORIGINAL EVENT LISTENERS (PRESERVED EXACTLY) ---
        DOM.editor.addEventListener('input', () => {
        if (State.isRestoring) return; 

        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) {
            if (!activeTab.isDirty) {
                activeTab.isDirty = true;
                Tabs.render();
            }
            activeTab.content = DOM.editor.value;
            this.saveSessionDebounced();
        }
        UI.updateLineNumbers();
    });
        // 1. Guarded Scroll Listener
    DOM.editor.addEventListener('scroll', () => {
        UI.syncScroll();
        
        // STRICT LOCK: If restoring, DO NOT SAVE.
        if (State.isRestoring) return;

        // Additional Safety: If the app just started (< 2 seconds), be careful about saving '0'
        // unless the user actually clicked/typed.
        
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
            this.saveSessionDebounced();
        }
    });
        DOM.editor.addEventListener('keyup', StatusBar.update);
        DOM.editor.addEventListener('click', StatusBar.update);
        new ResizeObserver(UI.updateLineNumbers).observe(DOM.editor);
        DOM.contextMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const button = e.target.closest('button');
            if (button) Menus.handleAction(button.dataset.action);
        });
        DOM.mainMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const button = e.target.closest('button');
            if (button && !button.disabled) Menus.handleAction(button.dataset.action);
        });
        DOM.addWorkspaceBtn.onclick = () => this.showAddWorkspaceDialog();
        window.addEventListener('keydown', (e) => {
            const hasModifier = e.ctrlKey || e.metaKey;
            if (hasModifier && e.key.toLowerCase() === 's') {
                e.preventDefault();
                Tabs.saveActive();
            }
            if (hasModifier && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
                FindReplace.show(selectedText);
            }
            if (e.key === 'Escape') {
                if (State.isSelectionModeActive) {
                    e.preventDefault();
                    SelectionManager.end();
                } else if (DOM.genericDialog.classList.contains('visible')) {
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
            if (FindReplace.isFindSelectionActive) {
                return;
            }
            if (e.key === 'Tab') {
                return;
            }
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
                editor.dispatchEvent(new Event('input', {
                    bubbles: true
                }));
            }
        });
        DOM.keyboardHelper.addEventListener('click', (e) => {
            const button = e.target.closest('button.kh-btn');
            if (!button) return;
            const activeEditorInstance = Editor.currentHighlighter;
            if (!activeEditorInstance) return;
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
                activeEditorInstance.indentSelection();
            }
            editor.focus();
        });
        // 2. The Final Sync (CRITICAL)
    window.addEventListener('beforeunload', () => {
        // Before we die, force-sync the current scroll position to the state.
        // This catches the case where user scrolls and hits Refresh immediately.
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
            // Also sync content if dirty
            if (activeTab.isDirty) {
                activeTab.content = DOM.editor.value;
            }
        }
        
        this.saveSession();
    });
    },




    /**
     * Opens a dialog that presents the user with a choice of worlds to create or enter.
     * This is the genesis point for new workspaces, the crossroads from which all file-based
     * journeys begin. It is a moment of pure potential.
     * @returns {Promise<void>}
     */
    async showAddWorkspaceDialog() {
        const contentHTML = /*html*/ `
            <div id="workspace-options">
                <button class="menu-button" data-action="local"><svg class="svg-icon"><use href="#icon-laptop"></use></svg> Local Folder</button>
                <!--<button class="menu-button" data-action="ssh"><svg class="svg-icon"><use href="#icon-ssh"></use></svg> SSH Connection</button>-->
                
                <button class="menu-button" data-action="github"><svg class="svg-icon"><use href="#icon-github"></use></svg> GitHub Repository</button>
                <button class="menu-button" data-action="idb"><svg class="svg-icon"><use href="#icon-brain"></use></svg> Browser Storage</button>
            </div>`;

        UI.showDialog({
            title: 'Add New Workspace',
            contentHTML,
            okText: '',
            cancelText: 'Cancel'
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
                case 'local':
                    this.addLocalWorkspace();
                    break;
                case 'ssh':
                    this.addSshWorkspace();
                    break;
                case 'github':
                    this.addGithubWorkspace();
                    break;
                case 'idb':
                    this.addIdbWorkspace();
                    break;
            }
        });
    },

 
    /*B"H*/
	/**
	 * Initiates the sacred ritual of opening a local directory.
	 * This updated version performs a binding ritual: it takes the handle granted
	 * by the user and saves it to IndexedDB. This ensures that even if the tab
	 * is closed, the connection to the world (the folder) remains in potential.
	 * @returns {Promise<void>}
	 */
	/**
     * immediately renders the workspace in the UI after saving.
     */
    async addLocalWorkspace() {
        try {
            const handle = await window.showDirectoryPicker();
            
            // 1. Verify basic permission immediately
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
                    throw new Error('Permission to write to directory was denied.');
                }
            }

            // 2. Generate ID and Data
            // We manually assign the ID so we can save the handle with it before adding to state.
            const wsId = State.nextWorkspaceId++;
            const wsData = {
                id: wsId,
                name: `💻 ${handle.name}`,
                type: 'local',
                handle: handle 
            };

            // 3. SAVE THE HANDLE TO INDEXEDDB
            await FileSystemProvider.IndexedDB.saveHandle(wsId, handle);

            // 4. Add to State AND Render
            // B"H - CHANGE: We pass 'true' here. This tells Workspaces.js to:
            // a) Add it to the list
            // b) Render it to the DOM immediately
            // c) Save the session state
            Workspaces.add(wsData, true);
            
            UI.showToast("Folder added and remembered.", "success");
            
        } catch (e) {
            if (e.name !== 'AbortError') UI.showToast(`Could not open directory: ${e.message}`, 'error');
        }
    },

    /**
     * Opens a portal to a remote machine through the arcane art of SSH. This function
     * gathers the necessary incantations—host, user, credentials—and attempts to establish
     * a connection, bringing a distant filesystem into the user's immediate reality.
     * @returns {Promise<void>}
     */
    async addSshWorkspace() {
        const dialogHTML = `
	        <div id="ssh-form">
	            <label for="ssh-host">Host/Domain</label>
	            <input type="text" id="ssh-host" placeholder="example.com">
	            
	            <label for="ssh-user">Username</label>
	            <input type="text" id="ssh-user" placeholder="root">
	
	            <label for="ssh-auth-method">Auth Method</label>
	            <select id="ssh-auth-method">
	                <option value="password" selected>Password</option>
	                <option value="pem">PEM Private Key</option>
	            </select>
	
	            <div id="ssh-password-container">
	                <label for="ssh-password">Password</label>
	                <input type="password" id="ssh-password">
	            </div>
	
	            <div id="ssh-pem-container" style="display:none;">
	                <label for="ssh-pem-file">Private Key File</label>
	                <input type="file" id="ssh-pem-file" accept=".pem">
	            </div>
	
	            <label for="ssh-path">Initial Path (optional)</label>
	            <input type="text" id="ssh-path" value="/" placeholder="/var/www/html">
	        </div>
	    `;

        // Show the dialog and wait for the user to submit
        const result = await UI.showDialog({
            title: 'New SSH Connection',
            contentHTML: dialogHTML,
            okText: 'Connect',
            cancelText: 'Cancel'
        });

        if (!result) return; // User cancelled

        // Add the event listener to the dialog *after* it has been created
        const authSelect = document.getElementById('ssh-auth-method');
        const passContainer = document.getElementById('ssh-password-container');
        const pemContainer = document.getElementById('ssh-pem-container');
        authSelect.onchange = () => {
            passContainer.style.display = authSelect.value === 'password' ? 'block' : 'none';
            pemContainer.style.display = authSelect.value === 'pem' ? 'block' : 'none';
        };

        // Gather data from the form
        const host = document.getElementById('ssh-host').value;
        const user = document.getElementById('ssh-user').value;
        const authMethod = document.getElementById('ssh-auth-method').value;
        const path = document.getElementById('ssh-path').value || '/';

        if (!host || !user) {
            UI.showToast("Host and Username are required.", "error");
            return;
        }

        const wsData = {
            name: `⚡ ${user}@${host}`,
            type: 'ssh',
            sshInfo: {
                host,
                user,
                authMethod,
                initialPath: path
            }
        };

        try {
            if (authMethod === 'password') {
                const password = document.getElementById('ssh-password').value;
                if (!password) throw new Error("Password is required.");
                wsData.sshInfo.password = btoa(password); // btoa is for transport, NOT security.
            } else {
                const file = document.getElementById('ssh-pem-file').files[0];
                if (!file) throw new Error("PEM file is required.");
                wsData.sshInfo.pem = await file.text();
            }

            UI.showLoading("Verifying connection...");
            await FileSystemProvider.SSH._api('connect', wsData.sshInfo, {});
            UI.showToast("Connection successful!", 'success');

            Workspaces.add(wsData);

        } catch (e) {
            UI.showToast(`Failed: ${e.message}`, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * Creates a new workspace within the browser's own internal universe (IndexedDB).
     * This is a self-contained world, a garden enclosed, perfect for thoughts and experiments
     * that need no connection to the outside.
     */
    addIdbWorkspace() {
        Workspaces.add({
            name: '🧠 Browser Storage',
            type: 'indexeddb'
        });
    },

    /**
     * B"H
     * Handles the entire sacred workflow for adding a GitHub repository. This corrected version
     * properly parses repository URLs, including those that end with a '.git' suffix,
     * ensuring that any public star can be correctly summoned from the celestial sphere. It understands
     * the difference between seeking one's own hidden treasures and gazing upon the public works of others.
     * @returns {Promise<void>}
     */
    async addGithubWorkspace() {
        // A helper function, a whispered incantation to summon a public repo from the ether.
        const addRepoFromUrl = async (url) => {
            if (!url) {
                const result = await UI.showDialog({
                    title: "Add Public GitHub Repo",
                    message: "Enter the full URL of a public repository to open it in read-only mode.",
                    hasInput: true,
                    inputType: 'url',
                    placeholder: "https://github.com/owner/repo",
                    okText: "Add Read-Only",
                    cancelText: 'Cancel'
                });
                if (!result) return;
                url = result;
            }
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname !== 'github.com') throw new Error('URL must be from github.com');
                const parts = urlObj.pathname.split('/').filter(p => p);
                if (parts.length < 2) throw new Error('Invalid repo URL format, a fractured reflection.');

                const owner = parts[0];
                // THIS IS THE FIX: We find the repository name and cleanse it of the '.git' suffix.
                let repo = parts[1].replace(/\.git$/, '');

                UI.showLoading(`Gathering starlight from ${owner}/${repo}...`);
                const repoData = await FileSystemProvider.GitHub.api(`/repos/${owner}/${repo}`);
                Workspaces.add({
                    name: `📦 (Public) ${owner}/${repo}`,
                    type: 'github',
                    repoInfo: {
                        owner,
                        repo
                    },
                    branch: repoData.default_branch,
                    readOnly: true
                });
            } catch (e) {
                UI.showToast(`Failed to add repo: ${e.message}`, 'error');
            } finally {
                UI.hideLoading();
            }
        };

        // If no token is known, we must ask. Does the user wish to unlock their own worlds, or explore others?
        if (!State.githubToken) {
            const choice = await UI.showDialog({
                title: "GitHub Token Required",
                message: "A Personal Access Token is needed to access your private repositories. You can add a public repository without a token.",
                okText: "Enter Token",
                cancelText: "Add Public Repo by URL"
            });
            if (choice === true) { // User chose to Enter Token
                const token = await UI.showDialog({
                    title: "GitHub Personal Access Token",
                    message: "Enter a PAT with 'repo' scope:",
                    hasInput: true,
                    inputType: 'password',
                    placeholder: "ghp_...",
                    cancelText: 'Cancel'
                });
                if (token) {
                    State.githubToken = token;
                    this.saveSettings();
                    this.addGithubWorkspace(); // Recurse, now with the key in hand.
                }
            } else if (choice === null) { // User chose to Add Public URL
                await addRepoFromUrl();
            }
            return;
        }

        // If a token exists, we present a grand vista of both personal and public possibilities.
        UI.showLoading("Fetching your repositories...");
        try {
            const repos = await FileSystemProvider.GitHub.api('/user/repos?sort=updated&per_page=100');
            const repoListHTML = repos.map(repo => `<button class="menu-button" data-repo-full-name="${repo.full_name}">${repo.full_name}</button>`).join('');

            const contentHTML = `
            <div class="github-url-section" style="margin-bottom: 16px;">
                <p>Add a public repository by URL (read-only):</p>
                <input type="url" id="github-repo-url-input" placeholder="https://github.com/owner/repo" style="margin-bottom: 8px;">
                <button id="add-public-repo-btn" class="secondary-btn" style="width:100%;">Add from URL</button>
            </div>
            <hr class="menu-separator">
            <p style="text-align: center; color: var(--color-text-secondary); margin: -4px 0 8px;">Or select from your repositories (read/write):</p>
            <div style="max-height: 40vh; overflow-y: auto;">${repoListHTML}</div>
        `;

            UI.showDialog({
                title: 'Add GitHub Repository',
                contentHTML: contentHTML,
                okText: '',
                cancelText: 'Close'
            });

            document.getElementById('add-public-repo-btn').onclick = () => {
                const url = document.getElementById('github-repo-url-input').value;
                if (url) {
                    DOM.genericDialog.classList.remove('visible');
                    addRepoFromUrl(url);
                }
            };

            document.getElementById('dialog-content').querySelectorAll('button[data-repo-full-name]').forEach(btn => {
                btn.onclick = () => {
                    const fullName = btn.dataset.repoFullName;
                    const [owner, repoName] = fullName.split('/');
                    const repoData = repos.find(r => r.full_name === fullName);
                    Workspaces.add({
                        name: `📦 ${fullName}`,
                        type: 'github',
                        repoInfo: {
                            owner,
                            repo: repoName
                        },
                        branch: repoData.default_branch
                    });
                    DOM.genericDialog.classList.remove('visible');
                };
            });
        } catch (e) {
            UI.showToast(`Failed to fetch repos: ${e.message}`, 'error');
            const clearToken = await UI.showDialog({
                title: "Authentication Error",
                message: "Your GitHub token may be invalid. Clear the saved token and try again?",
                okText: "Clear Token",
                cancelText: "Cancel"
            });
            if (clearToken) {
                State.githubToken = null;
                this.saveSettings();
                UI.showToast("GitHub token cleared.", "info");
            }
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * Opens a single, transient file from the local filesystem. This file exists outside of any
     * formal workspace, a fleeting thought given form. It is a temporary visitor, a guest in the
     * editor's house, not a permanent resident.
     * @returns {Promise<void>}
     */
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


    /**
     * An invocation that either expands the editor to fill the entire screen, achieving a state of
     * total focus, or returns it to its normal, windowed state. It is a command over the very
     * boundaries of the application's physical form.
     */
    toggleFullscreen() {
        const element = document.documentElement; // Target the entire <html> element

        // Check if the document is currently in full screen mode
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
            // --- EXIT FULL SCREEN ---
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                /* IE/Edge */
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                /* Chrome, Safari, Opera */
                document.webkitExitFullscreen();
            }
            console.log("Exited full screen mode.");
        } else {
            // --- ENTER FULL SCREEN ---
            if (element.requestFullscreen) {
                element.requestFullscreen()
                    .then(() => console.log("Entered full screen mode."))
                    .catch(err => console.error(`Error entering full screen: ${err.message}`));
            } else if (element.msRequestFullscreen) {
                /* IE/Edge */
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                /* Firefox */
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                /* Chrome, Safari, Opera */
                element.webkitRequestFullscreen();
            } else {
                console.log("Fullscreen API not supported by this browser.");
            }
        }
    },

    /**
     * Reveals the sacred settings dialog, a place where the user can offer their credentials (like the
     * GitHub token) and define the fundamental laws of the editor's behavior (like the use of tabs).
     * This is the chamber of covenants, where the user's will is made known.
     * @returns {Promise<void>}
     */
    async showSettings() {
        const contentHTML = `
            <label for="github-token-input" style="font-weight: 600; margin-bottom: -8px;">GitHub Personal Access Token</label>
            <input type="password" id="github-token-input" value="${State.githubToken || ''}" placeholder="ghp_...">
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
                <input type="checkbox" id="use-tabs-checkbox" ${State.useTabs ? 'checked' : ''} style="width: auto;">
                <label for="use-tabs-checkbox">Use Tab Characters (instead of spaces)</label>
            </div>
        `;
        const result = await UI.showDialog({
            title: 'Settings',
            contentHTML,
            okText: 'Save',
            cancelText: 'Cancel'
        });

        if (result) {
            const token = document.getElementById('github-token-input').value;
            State.githubToken = token || null;
            State.useTabs = document.getElementById('use-tabs-checkbox').checked;
            this.saveSettings();
            UI.showToast('Settings saved.', 'success');
        }
    },
};
