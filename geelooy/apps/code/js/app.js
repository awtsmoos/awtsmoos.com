
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
import { ModelManager } from './vibe/model-manager.js'; // B"H - Import Model Manager
// B"H - Internal helper for Git discovery within the App module
const findGitRoot = async (item) => {
    if (!item) return null;
    
    // 1. Direct GitHub connections are always their own Git root
    if (item.type === 'github') {
        const ws = State.workspaces.find(w => w.id === (item.workspaceId || item.id));
        return ws ? { ...ws, path: '/', kind: 'directory' } : null;
    }

    const wsId = item.workspaceId || item.id;
    const workspace = State.workspaces.find(w => w.id === wsId);
    if (!workspace) return null;

    let currPath = item.path || '/';

    // Start climb from parent if the item is a file
    if (item.kind === 'file') {
        currPath = currPath.substring(0, currPath.lastIndexOf('/')) || '/';
    }

    let limit = 15; // Safety depth
    while (limit-- > 0) {
        // First, check the fast way (UI cache)
        const uniquePath = `${wsId}::${currPath}`;
        const entry = State.domItemMap.get(uniquePath);
        if (entry?.item?.isGitClone) return entry.item;

        // Second, perform the physical "Peek" ritual
        try {
            const checkItem = { ...workspace, path: currPath, kind: 'directory', workspaceId: wsId };
            const { FileSystemProvider } = await import('./fs-provider.js');
            const result = await FileSystemProvider.list(checkItem);
            
            // Check if result is the new {entries, isGitRoot} format or standard array
            const entries = Array.isArray(result) ? result : result.entries;
            const isRoot = Array.isArray(result) ? result.some(c => c.name === '.awtsmoos-repo') : result.isGitRoot;

            if (isRoot) {
                // Found it physically! Mark it and return.
                checkItem.isGitClone = true;
                if (entry) entry.item.isGitClone = true;
                return checkItem;
            }
        } catch(e) {
            console.warn("[Git Discovery] Peek failed at " + currPath, e);
        }
        
        if (currPath === '/' || currPath === '') break;
        const lastSlash = currPath.lastIndexOf('/');
        currPath = lastSlash <= 0 ? '/' : currPath.substring(0, lastSlash);
    }
    
    // Final check for workspace root
    if (workspace?.isGitClone) return { ...workspace, path: '/', kind: 'directory', workspaceId: wsId };

    return null;
};
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
            ModelManager.init(); // B"H - Init Vibe Model Manager

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

    // B"H
    async commitAllChanges() {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (!activeTab || !activeTab.item) {
            UI.showToast("No active file to commit.", "warning");
            return;
        }

        UI.showLoading("Searching for Git anchor...");

        try {
            // B"H - Now awaiting the deep discovery
            const targetRepo = await findGitRoot(activeTab.item);

            UI.hideLoading();

            if (targetRepo) {
                const { GitManager } = await import("./git/index.js"); 
                GitManager.showGitUI(targetRepo);
            } else {
                UI.showToast("This file is not inside a recognized Git repository.", "warning");
            }
        } catch (err) {
            UI.hideLoading();
            UI.showToast("Discovery error: " + err.message, "error");
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
        // B"H - Combined Settings HTML
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
            
            <!-- B"H - Injected Vibe Settings -->
            ${ModelManager.getSettingsPanelHTML()}
        `;

        // We use the Promise wrapper but also attach listeners immediately after display
        const dialogPromise = UI.showDialog({
            title: 'Settings',
            contentHTML,
            okText: 'Save',
            cancelText: 'Cancel'
        });

        // B"H - Attach Model Manager Listeners to the open dialog
        // We need a slight delay or synchronous access to the DOM which is now active
        const dialogEl = document.getElementById('generic-dialog');
        const contentContainer = dialogEl.querySelector('.dialog-content');
        
        // Helper to refresh the dialog content without closing it
        const refreshSettingsUI = () => {
            // Find the Vibe panel and replace it
            const vibePanel = contentContainer.querySelector('.vibe-settings-panel');
            if(vibePanel) {
                vibePanel.outerHTML = ModelManager.getSettingsPanelHTML();
                // Re-bind
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
            
            // ModelManager saves itself during interaction, so no explicit save needed here
            UI.showToast('Settings saved.', 'success');
        }
    },
};
