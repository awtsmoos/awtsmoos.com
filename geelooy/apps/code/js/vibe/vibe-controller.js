
// B"H
// FILE: js/vibe/vibe-controller.js

import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { VibeAPI } from './api-client.js';
import { ModelManager } from './model-manager.js';
import { VibeView } from './vibe-view.js';
import { Tabs } from '../tabs/index.js';

export const VibeController = {
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
            // B"H - Perform initial scan so list isn't empty
            let contextPaths = [];
            try {
                const files = await FileSystemProvider.listAllFiles(folderItem);
                contextPaths = files
                    .filter(f => !f.name.match(/\.(png|jpg|mp4|zip|pdf|exe|bin|iso|tar|gz)$/i))
                    .map(f => f.path);
            } catch(e) {
                console.warn("Vibe initial scan failed", e);
            }

            // Create a new Vibe Tab
            const vibeItem = {
                ...folderItem,
                name: `Vibe: ${folderItem.name}`,
                type: 'vibe-session', // Item type
                originalType: folderItem.type, // Keep track of FS type (local, github, etc)
                kind: 'file' // Treated as a file for tab purposes (it's a leaf node in tabs)
            };

            // Initialize Session Data
            const initialSession = {
                history: [{
                    role: 'system',
                    content: `You are an elite coding engine. You have access to the user's files in "${folderItem.path}". 
When asked to modify code, you MUST output the response in the following XML format:
<changes>
  <change>
    <file>[path_to_file]</file>
    <description>[brief description]</description>
    <content><![CDATA[FULL_NEW_CONTENT_OF_FILE]]></content>
  </change>
</changes>
Do not use diffs. Return the FULL content of the file. 
Keep your commentary concise. Be vivid, extreme, and precise.`
                }],
                contextPaths: contextPaths, 
                rootPath: folderItem.path
            };

            // Create the tab
            await Tabs.create({
                ...vibeItem,
                content: initialSession // Passed as content for persistence
            }, false, true, true);

        } catch(e) {
            UI.showToast("Failed to open Vibe: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * Renders the Vibe UI for a specific tab.
     * Called by Tabs.activate()
     */
    async render(tab) {
        UI.switchView('vibe');
        
        // Ensure session structure exists on the tab
        if (!tab.vibeSession) {
            // Restore from tab content if available (loaded from session.js)
            if (tab.content && typeof tab.content === 'object') {
                tab.vibeSession = tab.content;
            } else {
                // Fallback init
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
            type: tab.item.originalType || 'local' // Fallback
        };
    },

    /**
     * Re-scans the folder to update the context list.
     */
    async refreshContext(tab) {
        if (!tab || !tab.vibeSession) return;
        
        UI.showLoading("Scanning context...");
        try {
            const rootItem = this.getRootItem(tab);
            const files = await FileSystemProvider.listAllFiles(rootItem);
            
            tab.vibeSession.contextPaths = files
                .filter(f => !f.name.match(/\.(png|jpg|mp4|zip|pdf|exe|bin|iso|tar|gz)$/i))
                .map(f => f.path);
            
            // Save state
            tab.content = tab.vibeSession;
            // Tabs.save handles vibe type
            await Tabs.save(tab); 
            
            VibeView.render(tab, this);
            UI.showToast(`Context updated: ${tab.vibeSession.contextPaths.length} files.`, "success");
        } catch(e) {
            UI.showToast("Scan failed: " + e.message, "error");
        } finally {
            UI.hideLoading();
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
            if (!hasKey) {
                UI.showToast("API Key required to proceed.", "warning");
                return;
            }
        }

        input.value = '';
        tab.vibeSession.isProcessing = true;
        
        // 1. Build Context
        // We re-scan the folder to get fresh file content for the paths we know.
        // We do NOT perform a full listAllFiles scan here to save latency, 
        // unless contextPaths is empty.
        
        const rootItem = this.getRootItem(tab);
        
        if (!tab.vibeSession.contextPaths || tab.vibeSession.contextPaths.length === 0) {
             await this.refreshContext(tab); // Auto-scan if empty
        }

        let fileContext = "CURRENT FILE STATE:\n";
        
        try {
            // Iterate known paths and read content
            for (const path of tab.vibeSession.contextPaths) {
                try {
                    const content = await FileSystemProvider.read({ ...rootItem, path: path });
                    if (typeof content === 'string' && content.length < 50000) {
                        fileContext += `--- FILE: ${path} ---\n${content}\n\n`;
                    }
                } catch(e) {}
            }
        } catch(e) {
            console.error("Context build error", e);
        }
        
        // 2. Update History
        tab.vibeSession.history.push({ role: 'user', content: text });
        
        // Force save of session
        tab.content = tab.vibeSession;
        tab.isDirty = true; 
        
        VibeView.render(tab, this); // Re-render to show user message
        
        // 3. Prepare API Payload
        const apiMessages = [
            tab.vibeSession.history[0], // System Prompt
            // Collapse previous history? Or send all?
            // For "Flash Lite", context window is large. Let's send last few turns + big context.
            ...tab.vibeSession.history.slice(1, -1), 
            { role: 'user', content: `${fileContext}\n\nUSER REQUEST: ${text}` }
        ];
        
        // 4. Stream Response
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
                
                // Save again
                tab.content = tab.vibeSession;
                Tabs.save(tab); // Persist
                
                this.processResponse(finalText, rootItem);
            },
            (error) => {
                tab.vibeSession.isProcessing = false;
                msgDiv.textContent += `\n[ERROR: ${error.message}]`;
                if (error.message === 'QUOTA_EXCEEDED') {
                    if (ModelManager.rotateKey()) this.sendMessage(tab); 
                    else if (ModelManager.downgradeModel()) this.sendMessage(tab);
                    else UI.showToast("All quotas exhausted.", "error");
                }
            }
        );
    },

    processResponse(text, rootItem) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(`<root>${text}</root>`, "text/xml");
        const changes = xmlDoc.getElementsByTagName('change');
        
        if (changes.length > 0) {
            let diffHtml = "";
            const changeList = [];
            
            for (let i = 0; i < changes.length; i++) {
                const file = changes[i].getElementsByTagName('file')[0]?.textContent;
                const desc = changes[i].getElementsByTagName('description')[0]?.textContent;
                const content = changes[i].getElementsByTagName('content')[0]?.textContent;
                
                if (file && content) {
                    changeList.push({ file, content });
                    diffHtml += `<span class="diff-info">File: ${file} (${desc})</span>`;
                    diffHtml += `<span class="diff-add">${content.substring(0, 200)}...</span><br>`;
                }
            }
            
            VibeView.showReviewDialog(diffHtml, async () => {
                for (const change of changeList) {
                    let targetPath = change.file;
                    if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
                    
                    try {
                        const targetItem = { ...rootItem, path: targetPath, kind: 'file' };
                        await FileSystemProvider.write(targetItem, change.content);
                        UI.showToast(`Updated ${change.file}`, "success");
                        
                        // Check if tab is open and reload it
                        const openTab = State.tabs.find(t => t.item.path === targetPath && t.item.workspaceId === rootItem.workspaceId);
                        if (openTab) {
                            openTab.forceReload = true;
                            if (State.activeTabId === openTab.id) Tabs.activate(openTab.id);
                        }
                    } catch(e) {
                        UI.showToast(`Failed to write ${change.file}: ${e.message}`, "error");
                    }
                }
            }, () => {
                UI.showToast("Changes discarded.", "info");
            });
        }
    },

    async openSettings() {
        import('../app.js').then(m => m.App.showSettings());
    }
};
