
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
import { GitManager } from "./git/index.js"; // B"H - Updated Import
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
        if (!activeTab) {
            UI.showToast("No active file.", "warning");
            return;
        }

        UI.showLoading("Finding Git contexts...");

        const gitContexts = [];
        let item = activeTab.item;
        
        // B"H - Loop upwards to find ALL nested git repos
        if (item.type === 'github') {
            const ws = State.workspaces.find(w => w.id === item.workspaceId);
            if (ws) gitContexts.push(ws);
        } else {
            let currentPath = item.path;
            let safety = 0;
            while (safety++ < 50) {
                const uniquePath = `${item.workspaceId}::${currentPath}`;
                const entry = State.domItemMap.get(uniquePath);
                
                if (entry && entry.item && entry.item.isGitClone) {
                    gitContexts.push(entry.item);
                }
                
                if (currentPath === '/') break;
                const lastSlash = currentPath.lastIndexOf('/');
                currentPath = lastSlash <= 0 ? '/' : currentPath.substring(0, lastSlash);
            }
        }

        UI.hideLoading();

        if (gitContexts.length === 0) {
            UI.showToast("The active file is not part of a Git repository.", "warning");
        } else if (gitContexts.length === 1) {
            GitManager.showGitUI(gitContexts[0]);
        } else {
            const buttonsHtml = gitContexts.map((ctx, idx) => `
                <button class="menu-button" data-index="${idx}">
                    <svg class="svg-icon"><use href="#icon-git-branch"></use></svg>
                    ${ctx.name} (${ctx.path})
                </button>
            `).join('');
            
            const choice = await UI.showDialog({
                title: "Multiple Git Repositories Detected",
                message: "This file exists inside nested repositories. Which one do you want to manage?",
                contentHTML: buttonsHtml,
                okText: "", 
                cancelText: "Cancel"
            });
            
            const dialogEl = document.getElementById('generic-dialog');
            const btnContainer = dialogEl.querySelector('.dialog-content'); 
            if(btnContainer) {
                const clickHandler = (e) => {
                    const btn = e.target.closest('button[data-index]');
                    if (btn) {
                        const idx = parseInt(btn.dataset.index);
                        GitManager.showGitUI(gitContexts[idx]);
                        dialogEl.classList.remove('visible');
                    }
                };
                btnContainer.addEventListener('click', clickHandler);
            }
        }
    },

    async openLocalFile() {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{ description: 'Files', accept: { '*/*': [] } }],
            });
            const file = await fileHandle.getFile();
            const wsId = State.nextWorkspaceId++;
            Workspaces.add({ id: wsId, name: 'Temp Workspace', type: 'local', handle: null }, false); 
            
            const item = {
                name: file.name,
                path: '/' + file.name,
                kind: 'file',
                type: 'local',
                workspaceId: wsId,
                content: file 
            };
            Tabs.create(item);
        } catch(e) {
            if (e.name !== 'AbortError') UI.showToast("Error opening file: " + e.message, "error");
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
