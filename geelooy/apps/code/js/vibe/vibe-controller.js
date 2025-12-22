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
import { AutoRefine } from './auto-refine.js'; // B"H

export const VibeController = {
    init() {
        ModelManager.init();
        VibeView.init();
    },

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
                rootPath: folderItem.path,
                autoRefine: true,
                maxIterations: 5,
                iterationCount: 0
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

    async render(tab) {
        UI.switchView('vibe');
        if (!tab.vibeSession) {
            if (tab.content && typeof tab.content === 'object') {
                tab.vibeSession = tab.content;
            } else {
                tab.vibeSession = { 
                    history: [], 
                    contextPaths: [], 
                    rootPath: tab.item.path, 
                    autoRefine: true, 
                    iterationCount: 0,
                    maxIterations: 5
                };
            }
        }
        VibeView.render(tab, this);
    },

    getRootItem(tab) {
        return {
            ...tab.item,
            name: tab.item.name.replace('Vibe: ', ''),
            path: tab.vibeSession.rootPath,
            kind: 'directory',
            type: tab.item.originalType || 'local'
        };
    },

    async refreshContext(tab, forceTreeRefresh = true) {
        if (!tab || !tab.vibeSession) return;
        UI.showLoading("Scanning context...");
        try {
            const rootItem = this.getRootItem(tab);
            const files = await FileSystemProvider.listAllFiles(rootItem);
            tab.vibeSession.contextPaths = files.filter(f => !f.name.match(/\.(png|jpg|mp4|zip|pdf|exe|bin|iso|tar|gz)$/i)).map(f => f.path);
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

    async sendMessage(tab, forcedText = null, isAutoRefine = false) {
        if (!tab || !tab.vibeSession) return;
        if (tab.vibeSession.isProcessing) return;
        
        const input = document.getElementById('vibe-input');
        const text = forcedText || input.value.trim();
        if (!text) return;
        
        if (!ModelManager.getKey()) {
            const hasKey = await ModelManager.promptForKey();
            if (!hasKey) {
                UI.showToast("API Key required to proceed.", "warning");
                return;
            }
        }

        if (!isAutoRefine) {
            input.value = '';
            tab.vibeSession.iterationCount = 0; // Reset loop on user input
        }
        
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
        } catch(e) { console.error("Context build error", e); }
        
        tab.vibeSession.history.push({ role: 'user', content: text });
        tab.content = tab.vibeSession;
        tab.isDirty = true; 
        
        VibeView.render(tab, this); 
        
        const apiMessages = [
            tab.vibeSession.history[0], 
            ...tab.vibeSession.history.slice(1, -1), 
            { role: 'user', content: `${fileContext}\n\n${isAutoRefine ? 'AUTO-REFINE INSTRUCTION' : 'USER REQUEST'}: ${text}` }
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
            async (finalText) => {
                tab.vibeSession.history.push({ role: 'model', content: finalText });
                tab.vibeSession.isProcessing = false;
                tab.content = tab.vibeSession;
                Tabs.save(tab); 
                
                await this.processResponse(finalText, tab);
            },
            (error) => {
                tab.vibeSession.isProcessing = false;
                msgDiv.textContent += `\n[ERROR: ${error.message}]`;
                if (error.message === 'QUOTA_EXCEEDED') {
                    if (ModelManager.rotateKey()) this.sendMessage(tab, text, isAutoRefine); 
                    else if (ModelManager.downgradeModel()) this.sendMessage(tab, text, isAutoRefine);
                    else UI.showToast("All quotas exhausted.", "error");
                }
            }
        );
    },

    async processResponse(text, tab) {
        let xmlContent = text;
        const codeBlockMatch = text.match(/```xml([\s\S]*?)```/i);
        if (codeBlockMatch) xmlContent = codeBlockMatch[1];
        else {
            const rawXmlMatch = text.match(/<changes>([\s\S]*?)<\/changes>/i);
            if (rawXmlMatch) xmlContent = rawXmlMatch[0];
            else return; // No code to process
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
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
                    const escapedSnippet = content.substring(0, 300).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    diffHtml += `<div style="margin-bottom: 15px; border-left: 2px solid var(--neon-cyan); padding-left: 10px;">
                        <div class="diff-info" style="font-weight:bold; color:var(--neon-cyan);">File: ${targetPath}</div>
                        <div style="font-size:0.85em; opacity:0.8; margin-bottom:5px;">${desc || 'Updating code...'}</div>
                        <pre class="diff-add" style="font-size:0.8em; max-height:100px; overflow:hidden; margin:0;"><code>${escapedSnippet}${content.length > 300 ? '\n...' : ''}</code></pre>
                    </div>`;
                }
            }
            
            // Check loop limit
            const runAutoLoop = tab.vibeSession.autoRefine && tab.vibeSession.iterationCount < tab.vibeSession.maxIterations;

            if (runAutoLoop) {
                // --- THE TIKKUN LOOP ---
                
                // 1. APPLY CHANGES
                await this.applyChanges(changeList, rootItem, tab);
                
                // 2. VALIDATE (Linter/Static Check)
                let combinedErrors = "";
                for (const change of changeList) {
                    const err = await AutoRefine.validate(change.file, change.content);
                    if (err) combinedErrors += `\nFile: ${change.file}\n${err}\n`;
                }
                
                tab.vibeSession.iterationCount++;
                
                if (combinedErrors) {
                    // 3a. ERROR RECTIFICATION
                    UI.showToast(`Errors detected. Auto-Correcting (Attempt ${tab.vibeSession.iterationCount})...`, "warning");
                    const prompt = `B"H\nThe changes you made had the following critical errors:\n${combinedErrors}\n\nPlease fix them and rewrite the files. Make it 100% correct.`;
                    await this.sendMessage(tab, prompt, true);
                } else {
                    // 3b. RECURSIVE OPTIMIZATION ("Make it better")
                    UI.showToast(`Code is valid. Optimizing (Pass ${tab.vibeSession.iterationCount})...`, "success");
                    // B"H - The Requested "Extreme" Prompt
                    const prompt = `B"H\nThe code is valid. Now, make it significantly better. Optimize performance, enhance aesthetics, and refine logic. Refactor to be cleaner and stronger. Do this 12893812039123 times better. Go.`;
                    await this.sendMessage(tab, prompt, true);
                }
            } else {
                if (tab.vibeSession.autoRefine) {
                    UI.showToast("Optimization loop complete.", "success");
                }
                
                // Manual Review Mode (Fallback)
                VibeView.showReviewDialog(diffHtml, async () => {
                    await this.applyChanges(changeList, rootItem, tab);
                    UI.showToast(`Successfully updated ${changeList.length} file(s).`, "success");
                }, () => {
                    UI.showToast("Changes discarded.", "info");
                });
            }
        }
    },
    
    async applyChanges(changeList, rootItem, tab) {
        // Don't block UI with loading overlay during recursion, it flickers too much.
        try {
            const parentsToRefresh = new Set();
            for (const change of changeList) {
                try {
                    const targetItem = { ...rootItem, path: change.file, kind: 'file' };
                    await FileSystemProvider.write(targetItem, change.content);
                    const lastSlash = change.file.lastIndexOf('/');
                    const parentPath = lastSlash === -1 ? '/' : (change.file.substring(0, lastSlash) || '/');
                    parentsToRefresh.add(parentPath);
                    
                    // Refresh open tab if exists
                    const openTab = State.tabs.find(t => t.item.path === change.file && t.item.workspaceId === rootItem.workspaceId);
                    if (openTab) {
                        openTab.forceReload = true;
                        // Reload content silently
                        if (State.activeTabId === openTab.id) await Tabs.activate(openTab.id);
                    }
                } catch(e) {
                    UI.showToast(`Failed to update ${change.file}: ${e.message}`, "error");
                }
            }
            for (const p of parentsToRefresh) {
                const parentItem = { ...rootItem, path: p, kind: 'directory' };
                await Workspaces.refreshNode(parentItem);
            }
            await this.refreshContext(tab, true);
        } finally {
            // UI.hideLoading();
        }
    },

    async openSettings() {
        import('../app.js').then(m => m.App.showSettings());
    },
    
    toggleAutoRefine(tab) {
        if(tab && tab.vibeSession) {
            tab.vibeSession.autoRefine = !tab.vibeSession.autoRefine;
            VibeView.render(tab, this);
        }
    }
}