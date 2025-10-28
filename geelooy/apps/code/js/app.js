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

export const App = {
    getTabString: () => State.useTabs ? '\t' : '    ',
activeConsole: null, // B"H 
	
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
        
        SelectionManager.initialize(); 

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


setupEventListeners() {
    // --- Element References (Using YOUR DOM object variable names) ---
    if (DOM.viewConsoleBtn) {
        DOM.viewConsoleBtn.onclick = () => {
            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (activeTab && activeTab.fileType === 'html-preview') {
                Tabs.createConsole(activeTab); // Use the new Tabs function
            } else {
                UI.showToast("No active preview to attach console.", "error");
            }
        };
    }
    
    
    
    
    const appContainer = document.querySelector('.app-container');
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');

    
    
    
    
    
    // --- 1. Main Menu Button (FIXED) ---
    // Now that DOM.hamburgerMenuBtn is correctly finding the element, this will work.
    
    
    
    if (DOM.hamburgerMenuBtn) {
        DOM.hamburgerMenuBtn.onclick = (e) => {
            // Stop the click from being caught by any other listeners.
            e.stopPropagation();
            Menus.showMainMenu(e);
        };
    }

    // --- 2. Sidebar Toggle Button (FIXED) ---
    // Now that DOM.mobileSidebarToggle is correctly finding the element, this will work.
   if (DOM.mobileSidebarToggle) {
    DOM.mobileSidebarToggle.onclick = (e) => {
        e.stopPropagation(); // Prevent interference.
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (isMobile) {
            // On mobile, toggle the slide-out panel.
            DOM.sidebar.classList.toggle('is-open');
            DOM.sidebarOverlay.classList.toggle('is-visible');
        } else {
	        
            // On desktop, toggle the collapsed state.
            appContainer.classList.toggle('sidebar-collapsed');
		if(!appContainer.classList.contains("sidebar-collapsed")) {
			var sidebarW = localStorage.awtsmoosSidebarWidth;
			if(!isNaN(sidebarW)) {
				
			        appContainer.style.gridTemplateColumns = 
			        `${sidebarW}px 1fr`;
			}
		} else {
			appContainer.style.gridTemplateColumns = '';
		}
        }
    };
}

    // --- 3. Internal Sidebar Collapse Button ---
    // This button provides a second way to collapse the sidebar on desktop.
    if (sidebarCollapseBtn) {
    sidebarCollapseBtn.onclick = (e) => {
        e.stopPropagation();
        appContainer.classList.toggle('sidebar-collapsed');
    };
}
    
    // PASTE THIS SNIPPET inside the App.setupEventListeners() function

	// --- B"H - SIDEBAR DRAG-TO-RESIZE LOGIC (for desktop) ---
	const resizer = document.getElementById('sidebar-resizer');
	
	
	
	// First, check if the resizer element exists and if we are on a desktop screen
	if (resizer && !window.matchMedia('(max-width: 768px)').matches) {
	    
	    const minWidth = 2; // Minimum sidebar width in pixels
	    const maxWidth = 800; // Maximum sidebar width in pixels
		
		var sidebarW = localStorage.awtsmoosSidebarWidth;
		if(!isNaN(sidebarW)) {
			
		        appContainer.style.gridTemplateColumns = `${sidebarW}px 1fr`;
		}
	    // This function is called whenever the mouse moves during a drag
	    const handleMouseMove = (e) => {
	        // Calculate the new width, but keep it within our min/max bounds
	        let newWidth = Math.max(minWidth, Math.min(e.clientX, maxWidth));
	        // Directly update the CSS grid layout of the app container
	        appContainer.style.gridTemplateColumns = `${newWidth}px 1fr`;
	        localStorage.awtsmoosSidebarWidth = newWidth;
	    };
	
	    // This function is called when the user lets go of the mouse button
	    const handleMouseUp = () => {
	        // Stop resizing by removing the global listeners and the body class
	        document.body.classList.remove('is-resizing');
	        document.removeEventListener('mousemove', handleMouseMove);
	        document.removeEventListener('mouseup', handleMouseUp);
	    };
	
	    // This is where it all starts: when the user presses the mouse down on the resizer
	    resizer.addEventListener('mousedown', (e) => {
	        e.preventDefault(); // Prevent browser's default drag behavior
	        document.body.classList.add('is-resizing');
	        
	        // Add listeners to the *entire document* to track mouse movement everywhere
	        document.addEventListener('mousemove', handleMouseMove);
	        document.addEventListener('mouseup', handleMouseUp);
	    });
}

    // --- 4. Mobile "Click Outside to Close" Logic ---
    // This logic is safe and will not interfere with the buttons.
    document.addEventListener('click', (e) => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!isMobile || !DOM.sidebar.classList.contains('is-open')) {
            return; // Only runs on mobile when sidebar is open.
        }

        const isClickInsideSidebar = DOM.sidebar.contains(e.target);
        const isClickOnToggleButton = DOM.mobileSidebarToggle && DOM.mobileSidebarToggle.contains(e.target);

        if (!isClickInsideSidebar && !isClickOnToggleButton) {
            DOM.sidebar.classList.remove('is-open');
            DOM.sidebarOverlay.classList.remove('is-visible');
        }
        
        if (State.isSelectionModeActive) {
        
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
        e.stopPropagation()
        
        
        const button = e.target.closest('button');
        
        
        if (button)  {
        
        
        Menus
        .handleAction(button.dataset.action);
        
        }
    
    });
    DOM.mainMenu.addEventListener('click', (e) => {
        e.stopPropagation()
        
        const button = e.target.closest('button');
        if (button && !button.disabled) Menus.handleAction(button.dataset.action);
    });

    DOM.addWorkspaceBtn.onclick = () => this.showAddWorkspaceDialog();

    window.addEventListener('keydown', (e) => {
        const hasModifier = e.ctrlKey || e.metaKey;
        if (hasModifier && e.key.toLowerCase() === 's') { e.preventDefault(); Tabs.saveActive(); }
        if (hasModifier && e.key.toLowerCase() === 'f') { e.preventDefault(); FindReplace.show(); }
        if (e.key === 'Escape') {
        if (State.isSelectionModeActive) {
            e.preventDefault();
            SelectionManager.end();
        } else
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
            editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

   // IN: js/app.js -> App.setupEventListeners()
// REPLACE the existing keyboardHelper listener with this one.

DOM.keyboardHelper.addEventListener('click', (e) => {
    const button = e.target.closest('button.kh-btn');
    if (!button) return;

    // Get the active pnimi instance from the Editor module
    const activeEditorInstance = Editor.currentHighlighter;
    if (!activeEditorInstance) return; // Safety check

    const editor = DOM.editor; // The textarea element
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
        // --- THIS IS THE KEY CHANGE ---
        // Instead of just inserting a character, we call the powerful method
        activeEditorInstance.indentSelection();
    }
    // NOTE: The simple event dispatch is no longer needed because our new
    // methods already call _update() internally.

    editor.focus();
});
    window.addEventListener('beforeunload', () => {
    State.consoleInstances.forEach(instance => instance.destroy());
        
        
    this.saveSession()
    })
},

    
    
    

    async showAddWorkspaceDialog() {
        const contentHTML = /*html*/`
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
