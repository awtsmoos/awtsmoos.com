// B"H
// FILE: js/app.js

import { SelectionManager } from './selection-manager.js';
import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs/index.js';
import { Workspaces } from './workspaces.js';
import { FindReplace } from './find-replace.js';
import { CustomMenu } from './custom-menu.js';
import { GitManager } from "./git-manager.js";
import { HexEditor } from './hex-editor.js';
import { Session } from './session.js';
import { setupEventListeners } from './app/event-listeners.js';
import { TabManagerOverlay } from './tab-manager-overlay.js';

export const App = {
    getTabString: () => State.useTabs ? '\t' : '    ',
    activeConsole: null, 

    saveSessionDebounced() {
        Session.saveDebounced();
    },

    saveSession() {
        Session.save();
    },

    loadSession() {
        return Session.load();
    },

    async initialize() {
        console.log('[INIT] Awtsmoos Editor Initializing...');
        UI.showLoading("Initializing...");

        try {
            await Promise.race([
                FileSystemProvider.IndexedDB.init(),
                new Promise((_, r) => setTimeout(() => r(new Error('DB Timeout')), 5000))
            ]);

            this.loadSettings();

            const isEmbedded = new URLSearchParams(window.location.search).get('embedded') === 'true';
            if (!isEmbedded) {
                await this.loadSession(); 
            }

            SelectionManager.initialize();
            CustomMenu.init();
            TabManagerOverlay.init();
            
            setupEventListeners();
            
            FindReplace.init();
            Editor.init();
            State.hexEditorInstance = new HexEditor(DOM.hexEditorWrapper, DOM.hexNavPad);

            Workspaces.render();
            await Tabs.activate(State.activeTabId || null);

            UI.hideLoading();
            UI.showToast("Welcome to the Awtsmoos Code Editor", 'success');
            
            window.parent.postMessage({ type: 'editorReady' }, '*');

        } catch (e) {
            console.error('[INIT_FATAL]', e);
            UI.hideLoading();
            UI.showToast("Error loading editor: " + e.message, 'error', 10000);
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

    async commitAllChanges() {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (!activeTab) return;

        UI.showLoading("Finding Git context...");

        const findGitRoot = (item) => {
            if (!item || typeof item.path !== 'string') return null;
            let currentPath = item.path;
            while (true) {
                const uniquePath = `${item.workspaceId}::${currentPath}`;
                const entry = State.domItemMap.get(uniquePath);
                if (entry?.item.isGitClone) {
                    return entry.item;
                }
                if (currentPath === '/') break;
                const lastSlash = currentPath.lastIndexOf('/');
                currentPath = lastSlash <= 0 ? '/' : currentPath.substring(0, lastSlash);
            }
            return null; 
        };

        let gitContextItem;
        if (activeTab.item.type === 'github') {
            gitContextItem = State.workspaces.find(ws => ws.id === activeTab.item.workspaceId);
        } else {
            gitContextItem = findGitRoot(activeTab.item);
        }

        UI.hideLoading();

        if (gitContextItem) {
            GitManager.showGitUI(gitContextItem);
        } else {
            UI.showToast("The active file is not part of a Git repository.", "warning");
        }
    },

    async showAddWorkspaceDialog() {
        const contentHTML = /*html*/ `
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
            const wsId = State.nextWorkspaceId++;
            const wsData = {
                id: wsId,
                name: `💻 ${handle.name}`,
                type: 'local',
                handle: handle 
            };
            await FileSystemProvider.IndexedDB.saveHandle(wsId, handle);
            Workspaces.add(wsData, true);
            UI.showToast("Folder added and remembered.", "success");
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
            </div>`;

        const result = await UI.showDialog({
            title: 'New SSH Connection',
            contentHTML: dialogHTML,
            okText: 'Connect',
            cancelText: 'Cancel'
        });

        if (!result) return; 

        const authSelect = document.getElementById('ssh-auth-method');
        const passContainer = document.getElementById('ssh-password-container');
        const pemContainer = document.getElementById('ssh-pem-container');
        authSelect.onchange = () => {
            passContainer.style.display = authSelect.value === 'password' ? 'block' : 'none';
            pemContainer.style.display = authSelect.value === 'pem' ? 'block' : 'none';
        };

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
                wsData.sshInfo.password = btoa(password); 
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
                let repo = parts[1].replace(/\.git$/, '');

                UI.showLoading(`Gathering starlight from ${owner}/${repo}...`);
                const repoData = await FileSystemProvider.GitHub.api(`/repos/${owner}/${repo}`);
                Workspaces.add({
                    name: `📦 (Public) ${owner}/${repo}`,
                    type: 'github',
                    repoInfo: { owner, repo },
                    branch: repoData.default_branch,
                    readOnly: true
                });
            } catch (e) {
                UI.showToast(`Failed to add repo: ${e.message}`, 'error');
            } finally {
                UI.hideLoading();
            }
        };

        if (!State.githubToken) {
            const choice = await UI.showDialog({
                title: "GitHub Token Required",
                message: "A Personal Access Token is needed to access your private repositories. You can add a public repository without a token.",
                okText: "Enter Token",
                cancelText: "Add Public Repo by URL"
            });
            if (choice === true) { 
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
                    this.addGithubWorkspace(); 
                }
            } else if (choice === null) { 
                await addRepoFromUrl();
            }
            return;
        }

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
                        repoInfo: { owner, repo: repoName },
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
        const element = document.documentElement; 
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) { document.exitFullscreen(); } 
            else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
        } else {
            if (element.requestFullscreen) { element.requestFullscreen(); } 
            else if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen(); }
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