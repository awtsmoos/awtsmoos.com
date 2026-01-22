// B"H
// FILE: js/vibe/vibe-controller.js

import { VibeView } from './vibe-view.js';
import { LogicController } from './controllers/logic.js';
import { IOController } from './controllers/io.js';
import { ExecutionController } from './controllers/execution.js';
import { StreamParser } from './modules/stream-parser.js';
import { State } from '../state.js';
import { ModelManager } from './model-manager.js';
import { SidebarUI } from './view/sidebar-ui.js';
import { ChatUI } from './view/chat-ui.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs.js';
import { FileSystemProvider } from '../fs-provider.js';
import { HistoryScribe } from './modules/HistoryScribe.js';

export const VibeController = {
    init() {
        ModelManager.init();
        VibeView.init();
        
        // Runtime Error Listener -> Delegates to ExecutionController
        window.addEventListener('message', (e) => {
            if (e.data.source === 'html-preview-console' && e.data.type === 'log') {
                if (e.data.payload.level === 'error') {
                    const errArgs = e.data.payload.args[0];
                    ExecutionController.handleRuntimeError(errArgs);
                }
            }
        });
    },

    async open(folderItem) {
        if (!folderItem || folderItem.kind !== 'directory') {
            UI.showToast("Vibe Code must be opened on a folder.", "warning");
            return;
        }

        UI.showLoading("Stabilizing Vibe Context...");

        try {
            const vibeItem = {
                ...folderItem,
                name: `Vibe: ${folderItem.name}`,
                type: 'vibe-session',
                originalType: folderItem.type,
                kind: 'file'
            };

            const history = await HistoryScribe.load(folderItem);

            const initialSession = {
                history: history, 
                rootPath: folderItem.path,
                isProcessing: false,
                iterationCount: 0,
                activeFiles: [],
                viewState: {
                    activeSidebarTab: 'tree',
                    isSidebarCollapsed: false,
                    currentStreamContent: ''
                }
            };

            await Tabs.create({ ...vibeItem, content: initialSession }, false, true, true);

        } catch(e) {
            console.error(e);
            UI.showToast("Failed to open Vibe: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    },

    async render(tab) {
        UI.switchView('vibe');
        if (!tab.vibeSession) tab.vibeSession = tab.content;
        VibeView.render(tab, this);
    },

    sendMessage(tab) {
        const input = document.getElementById('vibe-input');
        const text = input.value.trim();
        if (!text) return;
        
        if (!ModelManager.getKey()) {
            ModelManager.promptForKey();
            return;
        }

        input.value = '';
        tab.vibeSession.iterationCount = 0;
        State.isVibeStopRequested = false;
        tab.vibeSession.pendingErrors = []; 
        
        // 1. Update State
        tab.vibeSession.history.push({ role: 'user', content: text });
        
        // 2. Instant Feedback (Render immediately without waiting for logic)
        const hist = document.getElementById('vibe-chat-history');
        if(hist) ChatUI.appendMessage({ role: 'user', content: text }, hist, tab, this);

        // 3. Trigger Logic
        LogicController.runIteration(tab, this);
    },

    handleStreamChunk(fullText, tab) {
        const parsedFiles = StreamParser.parse(fullText);
        tab.vibeSession.activeFiles = parsedFiles.map(f => ({
            path: f.path,
            description: f.description,
            operation: f.operation,
            isComplete: f.isComplete,
            content: f.content 
        }));

        VibeView.updateStreamingMessage(tab, this);

        // Feed Sidebar Active Vessel
        const activeFile = parsedFiles.find(f => f.operation === 'write' && f.content && f.content.length > 0);
        if (activeFile) {
            const header = `// B"H - Manifesting: ${activeFile.path}\n// ----------------------------------------\n`;
            VibeView.updateStream(tab, header + activeFile.content);
        }
    },

    async previewFile(tab, filePath) {
        if (!tab) tab = State.tabs.find(t => t.id === State.activeTabId);
        if (!tab || tab.fileType !== 'vibe') return;

        // Force Sidebar Tab Switch to 'Stream'
        tab.vibeSession.viewState.activeSidebarTab = 'stream';
        
        // Load content
        const content = await IOController.loadFileContent(tab, filePath);
        
        // Render
        VibeView.updateStream(tab, content);
        VibeView.render(tab, this);
    },

    stopLoop() { State.isVibeStopRequested = true; },
    
    refreshView(tab) { this.render(tab); },
    
    refreshTree(tab) {
        const root = this.getRootItem(tab);
        const container = document.getElementById('vibe-editor-wrapper');
        if(container) SidebarUI.refreshTree(container, root, this);
    },
    
    resetChat(tab) { 
        tab.vibeSession.history = []; 
        this.refreshView(tab); 
    },

    openSettings() { 
        import('../app.js').then(m => m.App.showSettings()); 
    },

    getRootItem(tab) {
        return {
            ...tab.item,
            name: tab.item.name.replace('Vibe: ', ''),
            path: tab.vibeSession.rootPath,
            kind: 'directory',
            type: tab.item.originalType || 'local',
            workspaceId: tab.item.workspaceId
        };
    },

    async saveSessionToFile(tab) {
        await HistoryScribe.save(tab);
    }
};