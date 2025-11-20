// B"H
// FILE: js/app.js
// B"H - IN: js/app.js
import { SelectionManager } from './selection-manager.js';
import { Console } from './Console.js'; 
import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';
import { StatusBar } from './statusbar.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { Workspaces } from './workspaces.js';
import { Menus } from './menus.js';
import { FindReplace } from './find-replace.js';
import { CustomMenu } from './custom-menu.js';

import { HexEditor } from './hex-editor.js';


export const App = {
    getTabString: () => State.useTabs ? '\t' : '    ',
activeConsole: null, // B"H 
	
    saveSession() {
        const persistableWorkspaces = State.workspaces
            .filter(
	            ws => ws.type === 'github' 
	            || ws.type === 'indexeddb'
	            || ws.type === 'ssh'
            )
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

/*B"H*/
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
                // The new 'false' argument at the end tells create() NOT to activate the tab.
                Tabs.create(item, false, false, false);
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

/*B"H*/
async initialize() {
    // This log should ALWAYS appear. If it doesn't, the problem is with the script loading itself.
    console.log('[INIT_DEBUG] Awtsmoos Editor is starting the initialization sequence.');
    UI.showLoading("Awtsmoos Editor Initializing...");

    try {
        // STEP 1: Database Initialization with Timeout
        console.log('[INIT_DEBUG] Step 1: Initializing Browser Storage (IndexedDB)...');
        const dbInitialization = FileSystemProvider.IndexedDB.init();
        const dbTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timed out after 5 seconds.')), 5000)
        );
        
        // This will either resolve with the DB connection or reject with the timeout error.
        await Promise.race([dbInitialization, dbTimeout]);
        console.log('[INIT_DEBUG] Step 1 COMPLETE: Database connected successfully.');

        // STEP 2: Load Settings
        console.log('[INIT_DEBUG] Step 2: Loading settings...');
        this.loadSettings();
        console.log('[INIT_DEBUG] Step 2 COMPLETE: Settings loaded.');

        // STEP 3: Load Session
        console.log('[INIT_DEBUG] Step 3: Loading session...');
        const isEmbedded = new URLSearchParams(window.location.search).get('embedded') === 'true';
        if (!isEmbedded) {
            this.loadSession();
        }
        console.log('[INIT_DEBUG] Step 3 COMPLETE: Session loaded.');

        // STEP 4: Initialize UI Modules
        console.log('[INIT_DEBUG] Step 4: Initializing UI modules...');
        SelectionManager.initialize();
        CustomMenu.init();
        this.setupEventListeners();
        FindReplace.init();
        Editor.init();
        State.hexEditorInstance = new HexEditor(DOM.hexEditorWrapper, DOM.hexNavPad);
        console.log('[INIT_DEBUG] Step 4 COMPLETE: UI modules initialized.');

        // STEP 5: Render UI from State
        console.log('[INIT_DEBUG] Step 5: Rendering workspaces...');
        Workspaces.render();
        console.log('[INIT_DEBUG] Step 5 COMPLETE: Workspaces rendered.');

        // STEP 6: Activate the correct tab
        console.log('[INIT_DEBUG] Step 6: Activating primary tab...');
        await Tabs.activate(State.activeTabId || null);
        console.log('[INIT_DEBUG] Step 6 COMPLETE: Primary tab activated.');

        // FINAL STEP: Hide loading and show welcome
        console.log('[INIT_DEBUG] Initialization sequence finished successfully. B"H');
        UI.hideLoading();
        UI.showToast("Welcome to the Awtsmoos Code Editor", 'success');

    } catch (e) {
        // This is the crucial catch block. If any step fails, this will now execute.
        console.error('[INIT_FATAL] A critical error occurred during initialization:', e);
        UI.hideLoading();
        const errorMessage = e.message || "An unknown critical error occurred during startup. The application cannot continue. Please check the console for details.";
        UI.showToast(errorMessage, 'error', 15000); // Show toast for 15 seconds
        
        // Display a message directly on the page as a fallback
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #ffc8c8; background: #280000; height: 100vh; font-family: monospace; font-size: 16px;">
                    <h1>B"H - Application Failed to Start</h1>
                    <p>A fatal error prevented the editor from loading:</p>
                    <p style="background: #111; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: left; white-space: pre-wrap;">${errorMessage}</p>
                    <p style="margin-top: 30px; color: #aaa;">Please try clearing your browser's cache for this site or opening it in a private/incognito window. Check the developer console for more technical details.</p>
                </div>
            `;
        }
        return; // Halt execution
    }
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
    
    
    /*B"H*/
/**
 * Gathers all locally saved (uncommitted) changes for the active GitHub workspace,
 * prompts the user for a commit message, and then transmits them to the remote repository.
 * This is the bridge between the local vessel and the celestial realm of the git history.
 */
async commitAllChanges() {
    const activeTab = State.tabs.find(t => t.id === State.activeTabId);
    if (!activeTab || activeTab.item.type !== 'github') {
        UI.showToast("An active GitHub file is required to commit.", "warning");
        return;
    }
    const workspaceId = activeTab.item.workspaceId;
    const workspace = State.workspaces.find(ws => ws.id === workspaceId);

    UI.showLoading("Gathering local changes...");
    const uncommittedFiles = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);

    if (uncommittedFiles.length === 0) {
        UI.hideLoading();
        UI.showToast("No locally saved changes to commit.", "info");
        return;
    }

    const commitMessage = await UI.showDialog({
        title: `Commit to "${workspace.name}"`,
        message: `Found ${uncommittedFiles.length} file(s) with local changes. Enter a commit message:`,
        hasTextarea: true,
        textareaContent: `B"H\nUpdate ${uncommittedFiles.length} file(s)`,
        okText: 'Commit & Push',
        cancelText: 'Cancel'
    });

    if (!commitMessage) {
        UI.hideLoading();
        return; // User cancelled the dialog.
    }

    UI.showLoading(`Committing ${uncommittedFiles.length} file(s)...`);

    try {
        // Committing files one-by-one is simpler and more robust than a complex multi-file commit API call.
        for (let i = 0; i < uncommittedFiles.length; i++) {
            const file = uncommittedFiles[i];
            UI.showLoading(`Committing ${i + 1}/${uncommittedFiles.length}: ${file.item.name}`);
            await FileSystemProvider.GitHub.write(file.item, file.content, commitMessage);
        }

        // Once all commits succeed, purge the local copies from IndexedDB.
        const deletionPromises = uncommittedFiles.map(file =>
            FileSystemProvider.IndexedDB.deleteUncommitted(file.uniquePath)
        );
        await Promise.all(deletionPromises);

        // Update the UI state for all affected tabs.
        uncommittedFiles.forEach(committedFile => {
            const tab = State.tabs.find(t => t.uniquePath === committedFile.uniquePath);
            if (tab) {
                tab.isUncommitted = false;
            }
        });

        Tabs.render();
        UI.hideLoading();
        UI.showToast("All changes successfully committed!", "success");

    } catch (e) {
        UI.hideLoading();
        UI.showToast(`Commit failed: ${e.message}`, 'error', 8000);
        console.error("COMMIT FAILED:", e);
    }
},

setupEventListeners() {
    window.addEventListener('message', async (event) => {
        const { type, payload, requestId, error } = event.data;
        if (State.postMessagePendingRequests.has(requestId)) {
            const { resolve, reject } = State.postMessagePendingRequests.get(requestId);
            State.postMessagePendingRequests.delete(requestId);
            if (error) { reject(new Error(error)); } else { resolve(payload); }
            return;
        }
	if (type === 'loadFile') {
    //--- START of added code ---

    // 1. UI Modifications: Collapse sidebar and hide controls.
    // This is done every time a file is loaded in this mode to ensure the state.
    const appContainer = document.querySelector('.app-container');
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
    const resizer = document.getElementById('sidebar-resizer');
    var tb = document?.querySelector(".tab-bar");
    if(tb) tb.style.display = "none";
    if (appContainer) appContainer.classList.add('sidebar-collapsed');
    if (sidebarCollapseBtn) sidebarCollapseBtn.style.display = 'none';
    if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.style.display = 'none';
    if (resizer) resizer.style.display = 'none';
    //if (DOM.tabBar) DOM.tabBar.style.display = 'none';

    // 2. State Reset: Clear previous state to ensure only the new file is shown.
    
    // --- END of added code ---


    // --- THIS IS THE ORIGINAL, UNTOUCHED, WORKING LOGIC ---
    const { fileName, content, saveContext } = payload;
    const externalWorkspace = { name: `OS File`, type: 'postmessage' };
    Workspaces.add(externalWorkspace, false);
    const wsId = State.workspaces[State.workspaces.length - 1].id;
    const fileItem = { name: fileName, path: fileName, kind: 'file', type: 'postmessage', workspaceId: wsId, saveContext, content };
    
    
	   await Tabs.create(fileItem, false, false);  
	   const newTab = State.tabs[State.tabs.length - 1];
    if (newTab) {
        // Forcefully activate it to ensure the editor view updates.
        Tabs.activate(newTab.id);
    }

    return;
}
        if (type === 'loadFolderAsWorkspace') {
            const { folderName, folderPath } = payload;
            State.workspaces = [];
            DOM.workspacesContainer.innerHTML = '';
            State.domItemMap.clear();
            const osWorkspace = { name: folderName, type: 'osfolder', path: folderPath };
            Workspaces.add(osWorkspace, false);
            return;
        }
        if (type === 'registerMenus') {
            CustomMenu.createFromConfig(payload);
            return;
        }
        if (type === 'requestContent') {
            const content = Editor.getContent();
            window.parent.postMessage({ type: 'responseContent', payload: { content: content } }, '*');
            return;
        }
        if(type == "osResponse") {
	        if(payload.saved) { }
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
            
            // THIS IS THE CRITICAL FIX:
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
        resizer.addEventListener('touchstart', handleStart, { passive: false });
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
        if (hasModifier && e.key.toLowerCase() === 's') { e.preventDefault(); Tabs.saveActive(); }
        if (hasModifier && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
            FindReplace.show(selectedText); 
        }
        if (e.key === 'Escape') {
            if (State.isSelectionModeActive) { e.preventDefault(); SelectionManager.end(); }
            else if (DOM.genericDialog.classList.contains('visible')) {
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
	    if (FindReplace.isFindSelectionActive) { return; }
	    if (e.key === 'Tab') { return; }
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
    window.addEventListener('beforeunload', () => {
        State.consoleInstances.forEach(instance => instance.destroy());
        this.saveSession();
    });
},

    
    
    

    async showAddWorkspaceDialog() {
        const contentHTML = /*html*/`
            <div id="workspace-options">
                <button class="menu-button" data-action="local"><svg class="svg-icon"><use href="#icon-laptop"></use></svg> Local Folder</button>
                <!--<button class="menu-button" data-action="ssh"><svg class="svg-icon"><use href="#icon-ssh"></use></svg> SSH Connection</button>-->
                
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
                case 'ssh': this.addSshWorkspace(); break;
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
	        sshInfo: { host, user, authMethod, initialPath: path }
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
    
    
    toggleFullscreen() {
    const element = document.documentElement; // Target the entire <html> element

    // Check if the document is currently in full screen mode
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        // --- EXIT FULL SCREEN ---
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari, Opera */
            document.webkitExitFullscreen();
        }
        console.log("Exited full screen mode.");
    } else {
        // --- ENTER FULL SCREEN ---
        if (element.requestFullscreen) {
            element.requestFullscreen()
                .then(() => console.log("Entered full screen mode."))
                .catch(err => console.error(`Error entering full screen: ${err.message}`));
        } else if (element.msRequestFullscreen) { /* IE/Edge */
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { /* Chrome, Safari, Opera */
            element.webkitRequestFullscreen();
        } else {
            console.log("Fullscreen API not supported by this browser.");
        }
    }
},

    async showSettings() {
        const contentHTML =`
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
