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

    async initialize() {
        UI.showLoading("VIVID X Initializing...");
        this.setupEventListeners();
        this.loadSettings();
        
        try {
            await FileSystemProvider.IndexedDB.init();
        } catch (e) {
            UI.showToast("Browser Storage (IndexedDB) failed to initialize.", 'error');
        }
        
        Workspaces.render();
        Tabs.activate(null);
        FindReplace.init();
        
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
         State.useTabs = settings.useTabs ?? true; // Default to true for tabs
    },

    setupEventListeners() {
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
        DOM.hamburgerMenuBtn.onclick = (e) => Menus.showMainMenu(e);
        DOM.addWorkspaceBtn.onclick = () => this.showAddWorkspaceDialog();

        DOM.sidebar.addEventListener('click', (e) => e.stopPropagation());
        
        const closeMobileSidebar = () => {
            DOM.sidebar.classList.remove('is-open');
            DOM.sidebarOverlay.classList.remove('is-visible');
            document.removeEventListener('click', handleOutsideClick);
        };
        const handleOutsideClick = (e) => {
            if (!e.target.closest('#sidebar')) closeMobileSidebar();
        };
        DOM.mobileSidebarToggle.onclick = (e) => {
            e.stopPropagation(); 
            const isOpen = DOM.sidebar.classList.contains('is-open');
            if (isOpen) closeMobileSidebar();
            else {
                DOM.sidebar.classList.add('is-open');
                DOM.sidebarOverlay.classList.add('is-visible');
                document.addEventListener('click', handleOutsideClick);
            }
        };

        window.addEventListener('keydown', (e) => {
            const hasModifier = e.ctrlKey || e.metaKey;
            if (hasModifier && e.key.toLowerCase() === 's') { e.preventDefault(); Tabs.saveActive(); }
            if (hasModifier && e.key.toLowerCase() === 'f') { e.preventDefault(); FindReplace.show(); }
            if (e.key === 'Escape') {
                if (DOM.genericDialog.classList.contains('visible')) return;
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
            } else if (key) {
                switch (key) {
                    case 'tab':
                        editor.setRangeText(App.getTabString(), start, end, 'end');
                        break;
                    // Other key handlers can be added here
                }
            }
            editor.focus();
            editor.dispatchEvent(new Event('input', { bubbles: true }));
        });

        window.onbeforeunload = (e) => {
            if (State.tabs.some(t => t.isDirty)) {
                e.preventDefault(); e.returnValue = ''; return '';
            }
        };
    },

    async showAddWorkspaceDialog() {
        const contentHTML = `
            <div id="workspace-options">
                <button class="menu-button" data-action="local"><svg class="svg-icon"><use href="#icon-laptop"></use></svg> Local Folder</button>
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
            Workspaces.add({ name: `💻 ${handle.name}`, type: 'local', handle, kind: 'directory' });
        } catch (e) {
            if (e.name !== 'AbortError') UI.showToast(`Could not open directory: ${e.message}`, 'error');
        }
    },

    async addIdbWorkspace() {
        Workspaces.add({ name: '🧠 Browser Storage', type: 'indexeddb', kind: 'directory' });
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
                btn.onclick = () => {
                    const fullName = btn.dataset.repoFullName;
                    const [owner, repoName] = fullName.split('/');
                    const repoData = repos.find(r => r.full_name === fullName);
                    Workspaces.add({ name: `📦 ${fullName}`, type: 'github', repoInfo: { owner, repo: repoName }, kind: 'directory', branch: repoData.default_branch });
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
                // Fallback for browsers that don't support the API
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