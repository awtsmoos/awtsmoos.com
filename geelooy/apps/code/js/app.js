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
import { GitManager } from "./git/index.js"; 
import { HexEditor } from './hex-editor.js';
import { Session } from './session.js';
import { setupEventListeners } from './app/event-listeners.js';
import { TabManagerOverlay } from './tab-manager-overlay.js';
import { ModelManager } from './vibe/model-manager.js';
import { GitMetaProvider } from './git/meta.js';

export const App = {
    getTabString: () => State.useTabs ? '\t' : '    ',
    activeConsole: null, 

    saveSessionDebounced() { Session.saveDebounced(); },
    saveSession() { Session.save(); },
    loadSession() { return Session.load(); },

    async initialize() {
        console.log('[INIT] Awtsmoos Editor Initializing...');
        UI.showLoading("Initializing...");

        try {
            await Promise.race([
                FileSystemProvider.IndexedDB.init(),
                new Promise((_, r) => setTimeout(() => r(new Error('DB Timeout')), 5000))
            ]);

            this.loadSettings();
            ModelManager.init();

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

    /**
     * B"H - The ritual for committing all changes. It now uses the profound discovery
     * method to find the true root of the repository.
     */
    async commitAllChanges() {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (!activeTab || !activeTab.item) {
            UI.showToast("No active file to commit.", "warning");
            return;
        }

        UI.showLoading("Searching for Git anchor...");

        try {
            const targetRepoItem = await GitMetaProvider.getGitInfoForFolder(activeTab.item);
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(targetRepoItem);

            UI.hideLoading();

            if (targetRepoItem && gitInfo) {
                GitManager.showGitUI(targetRepoItem, gitInfo);
            } else {
                UI.showToast("This file is not part of a recognized Git repository.", "warning");
            }
        } catch (err) {
            UI.hideLoading();
            UI.showToast("Git discovery failed: " + err.message, "error");
            console.error(err);
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
                name: file.name, path: '/' + file.name, kind: 'file',
                type: 'local', workspaceId: wsId, content: file 
            };
            Tabs.create(item);
        } catch(e) {
            if (e.name !== 'AbortError') UI.showToast("Error opening file: " + e.message, "error");
        }
    },

    toggleFullscreen() {
        const element = document.documentElement; 
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen();
        }
    },

    async showSettings() {
        const contentHTML = `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-top:0; color:var(--neon-cyan);">General</h4>
                <div style="margin-bottom: 10px;">
                    <label for="github-token-input" style="font-weight: 600; font-size:0.9em;">GitHub Personal Access Token</label>
                    <input type="password" id="github-token-input" value="${State.githubToken || ''}" placeholder="ghp_..." style="margin-top:5px;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="use-tabs-checkbox" ${State.useTabs ? 'checked' : ''} style="width: auto;">
                    <label for="use-tabs-checkbox">Use Tab Characters</label>
                </div>
            </div>
            
            <hr style="border:0; border-top:1px solid var(--color-border); margin:20px 0;">
            ${ModelManager.getSettingsPanelHTML()}
        `;

        const dialogPromise = UI.showDialog({
            title: 'Settings', contentHTML, okText: 'Save', cancelText: 'Cancel'
        });

        const dialogEl = document.getElementById('generic-dialog');
        const contentContainer = dialogEl.querySelector('.dialog-content');
        
        const refreshSettingsUI = () => {
            const vibePanel = contentContainer.querySelector('.vibe-settings-panel');
            if(vibePanel) {
                vibePanel.outerHTML = ModelManager.getSettingsPanelHTML();
                ModelManager.bindSettingsEvents(contentContainer, refreshSettingsUI);
            }
        };

        ModelManager.bindSettingsEvents(contentContainer, refreshSettingsUI);

        const result = await dialogPromise;

        if (result) {
            const token = document.getElementById('github-token-input').value;
            State.githubToken = token || null;
            State.useTabs = document.getElementById('use-tabs-checkbox').checked;
            this.saveSettings();
            UI.showToast('Settings saved.', 'success');
        }
    },
};
