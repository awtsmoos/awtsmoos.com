// B"H
// FILE: code/js/vibe/vibe-controller.js

import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { VibeAPI } from './api-client.js';
import { ModelManager } from './model-manager.js';
import { VibeView } from './vibe-view.js';
import { Tabs } from '../tabs/index.js';
import { Workspaces } from '../workspaces.js';

export const VibeController = {
    /**
     * Initializes the Vibe system.
     * The Awtsmoos creates the tools of perception.
     */
    init() {
        ModelManager.init();
        VibeView.init();
    },

    /**
     * Opens a new Vibe Tab for the given folder.
     * @param {object} folderItem - The directory to attach Vibe to.
     */
    async open(folderItem) {
        if (!folderItem || folderItem.kind !== 'directory') {
            UI.showToast("Vibe Code must be opened on a folder.", "warning");
            return;
        }

        UI.showLoading("Initializing Vibe Context...");

        try {
            let contextPaths = [];
            try {
                const files = await FileSystemProvider.listAllFiles(folderItem);
                contextPaths = files
                    .filter(f => !f.name.match(/\.(png|jpg|mp4|zip|pdf|exe|bin|iso|tar|gz)$/i))
                    .map(f => f.path);
            } catch(e) {
                console.warn("Vibe initial scan failed", e);
            }

            const vibeItem = {
                ...folderItem,
                name: `Vibe: ${folderItem.name}`,
                type: 'vibe-session',
                originalType: folderItem.type,
                kind: 'file'
            };

            const initialSession = {
                history: [{
                    role: 'system',
                    content: `You are an elite coding engine. You have access to the user's files in "${folderItem.path}". 
When asked to modify code, you MUST output the response in the following XML format:
<changes>
  <change>
    <file>[path_relative_to_context_root]</file>
    <description>[brief description]</description>
    <content><![CDATA[Full contents of the file]]]]><![CDATA[></content>
  </change>
</changes>
Do not use diffs. Return the FULL content of the file. 
Keep your commentary concise. Be vivid, extreme, and precise.`
                }],
                contextPaths: contextPaths, 
                rootPath: folderItem.path
            };

            await Tabs.create({
                ...vibeItem,
                content: initialSession 
            }, false, true, true);

        } catch(e) {
            UI.showToast("Failed to open Vibe: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * Renders the Vibe UI for a specific tab.
     * @param {object} tab - The vibe tab to render.
     */
    async render(tab) {
        UI.switchView('vibe');
        
        if (!tab.vibeSession) {
            if (tab.content && typeof tab.content === 'object') {
                tab.vibeSession = tab.content;
            } else {
                tab.vibeSession = {
                    history: [],
                    contextPaths: [],
                    rootPath: tab.item.path
                };
            }
        }
        
        VibeView.render(tab, this);
    },

    /**
     * Helper to reconstruct the root directory item from the tab.
     */
    getRootItem(tab) {
        return {
            ...tab.item,
            name: tab.item.name.replace('Vibe: ', ''),
            path: tab.vibeSession.rootPath,
            kind: 'directory',
            type: tab.item.originalType || 'local'
        };
    },

    /**
     * Re-scans the folder to update the context list and triggers a tree refresh.
     */
    async refreshContext(tab, forceTreeRefresh = true) {
        if (!tab || !tab.vibeSession) return;
        
        try {
            const rootItem = this.getRootItem(tab);
            const files = await FileSystemProvider.listAllFiles(rootItem);
            
            tab.vibeSession.contextPaths = files
                .filter(f => !f.name.match(/\.(png|jpg|mp4|zip|pdf|exe|bin|iso|tar|gz)$/i))
                .map(f => f.path);
            
            tab.content = tab.vibeSession;
            await Tabs.save(tab); 
            
            VibeView.render(tab, this, forceTreeRefresh);
        } catch(e) {
            console.error("Vibe Context Refresh failed", e);
        }
    },

    /**
     * Sends a message for the active tab's session.
     */
    async sendMessage(tab) {
        if (!tab || !tab.vibeSession) return;
        if (tab.vibeSession.isProcessing) return;
        
        const input = document.getElementById('vibe-input');
        const text = input.value.trim();
        if (!text) return;
        
        if (!ModelManager.getKey()) {
            const hasKey = await ModelManager.promptForKey();
            if (!hasKey) return;
        }

        input.value = '';
        tab.vibeSession.isProcessing = true;
        
        const rootItem = this.getRootItem(tab);
        
        if (!tab.vibeSession.contextPaths || tab.vibeSession.contextPaths.length === 0) {
             await this.refreshContext(tab, false); 
        }

        let fileContext = `CURRENT PROJECT STATE (Relative to ${tab.vibeSession.rootPath}):\n`;
        
        for (const path of tab.vibeSession.contextPaths) {
            try {
                const content = await FileSystemProvider.read({ ...rootItem, path: path });
                if (typeof content === 'string' && content.length < 100000) {
                    fileContext += `--- FILE: ${path} ---\n${content}\n\n`;
                }
            } catch(e) {}
        }
        
        tab.vibeSession.history.push({ role: 'user', content: text });
        tab.content = tab.vibeSession;
        tab.isDirty = true; 
        
        VibeView.render(tab, this); 
        
        const apiMessages = [
            tab.vibeSession.history[0], 
            ...tab.vibeSession.history.slice(1, -1), 
            { role: 'user', content: `${fileContext}\n\nUSER REQUEST: ${text}` }
        ];
        
        const historyContainer = document.getElementById('vibe-chat-history');
        const msgDiv = VibeView.showStreamingMessage(historyContainer);
        let fullResponse = "";

        await VibeAPI.streamChat(
            apiMessages, 
            ModelManager.getKey(),
            ModelManager.currentModel,
            (chunk) => {
                fullResponse += chunk;
                msgDiv.textContent = fullResponse; 
                historyContainer.scrollTop = historyContainer.scrollHeight;
            },
            (finalText) => {
                tab.vibeSession.history.push({ role: 'model', content: finalText });
                tab.vibeSession.isProcessing = false;
                tab.content = tab.vibeSession;
                Tabs.save(tab); 
                
                this.processResponse(finalText, tab);
            },
            (error) => {
                tab.vibeSession.isProcessing = false;
                msgDiv.textContent += `\n[ERROR: ${error.message}]`;
            }
        );
    },

    /**
     * Processes the model response for XML changes and triggers the review UI.
     */
    processResponse(text, tab) {
        const match = text.match(/<changes>([\s\S]*?)<\/changes>/i);
        if (!match) return;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(match[0], "text/xml");
        const changes = xmlDoc.getElementsByTagName('change');
        
        if (changes.length > 0) {
            let diffHtml = "";
            const changeList = [];
            const rootPath = tab.vibeSession.rootPath || '/';
            const rootItem = this.getRootItem(tab);
            
            for (let i = 0; i < changes.length; i++) {
                const file = changes[i].getElementsByTagName('file')[0]?.textContent?.trim();
                const desc = changes[i].getElementsByTagName('description')[0]?.textContent?.trim();
                const content = changes[i].getElementsByTagName('content')[0]?.textContent;
                
                if (file && content !== undefined) {
                    const cleanFile = file.startsWith('/') ? file.substring(1) : file;
                    const targetPath = rootPath.endsWith('/') ? rootPath + cleanFile : rootPath + '/' + cleanFile;
                    changeList.push({ file: targetPath, content, originalName: file });
                    
                    diffHtml += `<div style="margin-bottom: 10px; border-left: 2px solid var(--neon-cyan); padding-left: 10px;">
                        <div style="font-weight:bold; color:var(--neon-cyan); font-size:0.9em;">File: ${targetPath}</div>
                        <div style="font-size:0.8em; opacity:0.8;">${desc || 'Modifying...'}</div>
                    </div>`;
                }
            }
            
            VibeView.showReviewDialog(diffHtml, async () => {
                const taskId = `vibe-apply-${Date.now()}`;
                UI.startTask(taskId, "Universal Synchronizing...");
                try {
                    const parentsToRefresh = new Set();
                    for (const change of changeList) {
                        const targetItem = { ...rootItem, path: change.file, kind: 'file' };
                        await FileSystemProvider.write(targetItem, change.content);
                        
                        const lastSlash = change.file.lastIndexOf('/');
                        const parentPath = lastSlash === -1 ? '/' : (change.file.substring(0, lastSlash) || '/');
                        parentsToRefresh.add(parentPath);
                        
                        const openTab = State.tabs.find(t => t.item.path === change.file && t.item.workspaceId === rootItem.workspaceId);
                        if (openTab) {
                            openTab.forceReload = true;
                            if (State.activeTabId === openTab.id) await Tabs.activate(openTab.id);
                        }
                    }

                    // B"H - ABSOLUTE PANEL SYNC
                    // 1. Refresh Left Explorer (Workspaces)
                    for (const p of parentsToRefresh) {
                        const parentItem = { ...rootItem, path: p, kind: 'directory' };
                        await Workspaces.refreshNode(parentItem);
                    }
                    
                    // 2. Refresh Right Panel (Vibe Context)
                    await this.refreshContext(tab, true);

                    UI.endTask(taskId, 'success', `Updated ${changeList.length} files.`);
                } catch(e) {
                    UI.endTask(taskId, 'error', e.message);
                }
            }, () => {
                UI.showToast("Changes discarded.", "info");
            });
        }
    },

    async openSettings() {
        import('../app.js').then(m => m.App.showSettings());
    }
}