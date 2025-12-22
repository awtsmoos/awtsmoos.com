// B"H
// FILE: js/vibe/vibe-controller.js

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
```xml
<changes>
<change>
<file>[path_relative_to_context_root]</file>
<description>[brief description]</description>
<content><![CDATA[Full contents of the file]]]]><![CDATA[></content>
</change>
</changes>
```
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
     * Called by Tabs.activate()
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
     * @param {object} tab - The tab to extract root info from.
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
     * @param {object} tab - The tab to refresh.
     * @param {boolean} forceTreeRefresh - Whether to force the visual tree to rebuild.
     */
    async refreshContext(tab, forceTreeRefresh = true) {
        if (!tab || !tab.vibeSession) return;
        
        UI.showLoading("Scanning context...");
        try {
            const rootItem = this.getRootItem(tab);
            const files = await FileSystemProvider.listAllFiles(rootItem);
            
            tab.vibeSession.contextPaths = files
                .filter(f => !f.name.match(/\.(png|jpg|mp4|zip|pdf|exe|bin|iso|tar|gz)$/i))
                .map(f => f.path);
            
            tab.content = tab.vibeSession;
            await Tabs.save(tab); 
            
            VibeView.render(tab, this, forceTreeRefresh);
            UI.showToast(`Context updated: ${tab.vibeSession.contextPaths.length} files.`, "success");
        } catch(e) {
            UI.showToast("Scan failed: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * Sends a message for the active tab's session.
     * @param {object} tab - The vibe tab sending the message.
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
        
        const rootItem = this.getRootItem(tab);
        
        if (!tab.vibeSession.contextPaths || tab.vibeSession.contextPaths.length === 0) {
             await this.refreshContext(tab, false); 
        }

        let fileContext = `CURRENT FILE STATE (Relative to ${tab.vibeSession.rootPath}):\n`;
        
        try {
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
                if (error.message === 'QUOTA_EXCEEDED') {
                    if (ModelManager.rotateKey()) this.sendMessage(tab); 
                    else if (ModelManager.downgradeModel()) this.sendMessage(tab);
                    else UI.showToast("All quotas exhausted.", "error");
                }
            }
        );
    },

    /**
     * Processes the model response for XML changes and triggers the review UI.
     * @param {string} text - The raw AI response text.
     * @param {object} tab - The current vibe session tab.
     */
    processResponse(text, tab) {
        // Robust XML Extraction: Find the block within potential commentary.
        const match = text.match(/<changes>([\s\S]*?)<\/changes>/i);
        if (!match) return;

        const xmlContent = match[0];
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
        
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
            console.error("Vibe XML Parse Error:", parseError[0].textContent);
            UI.showToast("The AI returned malformed changes. Try rephrasing.", "error");
            return;
        }

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
                    const relFile = file.startsWith('/') ? file.substring(1) : file;
                    const targetPath = rootPath.endsWith('/') ? rootPath + relFile : rootPath + '/' + relFile;

                    changeList.push({ file: targetPath, content, originalName: file });
                    
                    const escapedSnippet = content.substring(0, 300)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');

                    diffHtml += `<div style="margin-bottom: 15px; border-left: 2px solid var(--neon-cyan); padding-left: 10px;">
                        <div class="diff-info" style="font-weight:bold; color:var(--neon-cyan);">File: ${targetPath}</div>
                        <div style="font-size:0.85em; opacity:0.8; margin-bottom:5px;">${desc || 'Updating code...'}</div>
                        <pre class="diff-add" style="font-size:0.8em; max-height:100px; overflow:hidden; margin:0;"><code>${escapedSnippet}${content.length > 300 ? '\n...' : ''}</code></pre>
                    </div>`;
                }
            }
            
            VibeView.showReviewDialog(diffHtml, async () => {
                UI.showLoading("Applying changes...");
                try {
                    const parentsToRefresh = new Set();
                    
                    for (const change of changeList) {
                        try {
                            const targetItem = { ...rootItem, path: change.file, kind: 'file' };
                            await FileSystemProvider.write(targetItem, change.content);
                            
                            // Collect affected parent directories for Main Explorer refresh.
                            const lastSlash = change.file.lastIndexOf('/');
                            const parentPath = lastSlash === -1 ? '/' : (change.file.substring(0, lastSlash) || '/');
                            parentsToRefresh.add(parentPath);
                            
                            const openTab = State.tabs.find(t => t.item.path === change.file && t.item.workspaceId === rootItem.workspaceId);
                            if (openTab) {
                                openTab.forceReload = true;
                                if (State.activeTabId === openTab.id) await Tabs.activate(openTab.id);
                            }
                        } catch(e) {
                            UI.showToast(`Failed to update ${change.file}: ${e.message}`, "error");
                        }
                    }

                    // Refresh Main Tree (Left) instantly
                    for (const p of parentsToRefresh) {
                        const parentItem = { ...rootItem, path: p, kind: 'directory' };
                        await Workspaces.refreshNode(parentItem);
                    }

                    // Refresh Vibe Session context & View (Right) instantly
                    await this.refreshContext(tab, true);

                    UI.showToast(`Successfully updated ${changeList.length} file(s).`, "success");
                } finally {
                    UI.hideLoading();
                }
            }, () => {
                UI.showToast("Changes discarded.", "info");
            });
        }
    },

    /**
     * Opens the global settings dialog.
     */
    async openSettings() {
        import('../app.js').then(m => m.App.showSettings());
    }
};
]]></content>
  </change>
  <change>
    <file>js/vibe/vibe-view.js</file>
    <description>Update render method to support forcing a tree refresh for visual consistency after changes.</description>
    <content><![CDATA[// B"H
// FILE: js/vibe/vibe-view.js

import { DOM } from '../state.js';
import { ModelManager } from './model-manager.js';
import { WorkspaceTreeRenderer } from '../workspaces/tree-rendering.js';

export const VibeView = {
    container: null,
    
    /**
     * Initializes the view container reference.
     */
    init() {
        this.container = document.getElementById('vibe-editor-wrapper');
    },

    /**
     * Renders the Vibe UI for a specific tab instance.
     * @param {object} tab - The vibe tab to render.
     * @param {object} controller - The vibe controller instance.
     * @param {boolean} forceTreeRefresh - Whether to clear and rebuild the context tree.
     */
    async render(tab, controller, forceTreeRefresh = false) {
        if (!this.container) this.init();
        
        const session = tab.vibeSession;
        if (!session) return; 

        const isSameTab = this.container.dataset.tabId === String(tab.id);
        const shouldRefreshTree = !isSameTab || forceTreeRefresh;

        if (!isSameTab) {
            this.container.dataset.tabId = tab.id;
            
            // Build Main Layout Shell
            this.container.innerHTML = `
                <div class="vibe-container">
                    <div class="vibe-chat-panel">
                        <div class="vibe-chat-history" id="vibe-chat-history">
                            <!-- Messages go here -->
                        </div>
                        <div class="vibe-input-area">
                            <div class="vibe-input-wrapper">
                                <textarea id="vibe-input" class="vibe-textarea" placeholder="Describe the changes you want..."></textarea>
                                <button id="vibe-send-btn" class="primary-btn" style="height:60px; width:60px;">➤</button>
                            </div>
                        </div>
                    </div>
                    <div class="vibe-side-panel">
                        <div class="vibe-panel-header">
                            <span>Vibe Context</span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span id="vibe-file-count" style="font-size:0.8em; opacity:0.7;">0 files</span>
                                <button id="vibe-refresh-context" class="icon-button" style="width:24px; height:24px; padding:0;" title="Refresh Context">
                                    <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-brain"></use></svg>
                                </button>
                            </div>
                        </div>
                        <div class="vibe-context-list" style="padding:0; overflow-y:auto;">
                            <!-- Tree will be rendered here -->
                        </div>
                        <div class="vibe-settings-area">
                            <div class="vibe-model-badge" id="vibe-config-btn">${ModelManager.currentModel}</div>
                            <div style="font-size:0.8em; color:gray;">
                                Keys: ${ModelManager.keys.length} | Quota Safe
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Bind Events
            document.getElementById('vibe-send-btn').onclick = () => controller.sendMessage(tab);
            document.getElementById('vibe-input').onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    controller.sendMessage(tab);
                }
            };
            document.getElementById('vibe-config-btn').onclick = () => controller.openSettings();
            document.getElementById('vibe-refresh-context').onclick = () => controller.refreshContext(tab);
        }

        // --- DYNAMIC REFRESHES (Run on every relevant render) ---

        // 1. Refresh Context Tree (Right Side Panel)
        if (shouldRefreshTree) {
            const treeContainer = this.container.querySelector('.vibe-context-list');
            if (treeContainer) {
                treeContainer.innerHTML = '';
                const rootUl = document.createElement('ul');
                rootUl.className = 'workspace-tree';
                rootUl.style.paddingLeft = '0';
                treeContainer.appendChild(rootUl);
                
                const rootItem = controller.getRootItem(tab);
                // Use the shared Tree Renderer with registerDom=false
                // This ensures "Reveal in Workspace" still targets the Main Explorer, not this panel.
                await WorkspaceTreeRenderer.renderTree(rootUl, rootItem, 0, false);
            }
        }

        // 2. Update Stats
        const countEl = document.getElementById('vibe-file-count');
        if(countEl) countEl.textContent = `${session.contextPaths ? session.contextPaths.length : 0} files`;
        
        const modelBadge = document.getElementById('vibe-config-btn');
        if(modelBadge) modelBadge.textContent = ModelManager.currentModel;

        // 3. Sync History
        const historyContainer = document.getElementById('vibe-chat-history');
        if (historyContainer) {
            const renderedCount = historyContainer.querySelectorAll('.vibe-message').length;
            const messagesToRender = session.history.filter(m => m.role !== 'system');
            
            if (messagesToRender.length > renderedCount) {
                const newMessages = messagesToRender.slice(renderedCount);
                newMessages.forEach(msg => {
                    this.appendMessage(msg.role, msg.content, historyContainer);
                });
            } else if (renderedCount === 0 && messagesToRender.length > 0) {
                messagesToRender.forEach(msg => {
                    this.appendMessage(msg.role, msg.content, historyContainer);
                });
            }
        }
    },

    /**
     * Appends a message to the chat history UI.
     */
    appendMessage(role, content, container) {
        const div = document.createElement('div');
        div.className = `vibe-message ${role}`;
        
        let html = content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            
        div.innerHTML = html;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    },

    /**
     * Shows a temporary streaming message shell.
     */
    showStreamingMessage(container) {
        const div = document.createElement('div');
        div.className = 'vibe-message model';
        div.innerHTML = '<span class="vibe-typing-indicator">...</span>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    },

    /**
     * Displays the review/diff overlay for suggested changes.
     */
    showReviewDialog(diffHtml, onApply, onCancel) {
        let overlay = document.querySelector('.vibe-review-overlay');
        if(overlay) overlay.remove();
        
        overlay = document.createElement('div');
        overlay.className = 'vibe-review-overlay';
        overlay.innerHTML = `
            <div class="vibe-review-header">
                <h3 style="color:var(--neon-lime); margin:0;">Review Suggested Changes</h3>
                <button id="vibe-review-cancel" class="icon-button"><svg class="svg-icon"><use href="#icon-x"></use></svg></button>
            </div>
            <div class="vibe-diff-container">
                ${diffHtml}
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;">
                <button id="vibe-review-apply" class="primary-btn">Apply Changes</button>
            </div>
        `;
        
        const mainVibeContainer = this.container.querySelector('.vibe-container');
        if (mainVibeContainer) mainVibeContainer.appendChild(overlay);
        
        document.getElementById('vibe-review-apply').onclick = () => {
            overlay.remove();
            onApply();
        };
        document.getElementById('vibe-review-cancel').onclick = () => {
            overlay.remove();
            onCancel();
        };
    }
};
]]></content>
  </change>
</changes>
```