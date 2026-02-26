
// B"H
/**
 * @file registry.js
 * @brief THE LEDGER OF THE INFINITE.
 */

import { ViewActions } from './view.js';
import { FileActions } from './files.js';
import { TextActions } from './text.js';
import { FileOperations } from '../file-operations.js';
import { App } from '../app.js';
import { Tabs } from '../tabs/index.js';
import { FileCommander } from '../file-commander.js';
import { Terminal } from '../terminal/index.js';
import { DevToolsOpener } from '../devtools/open.js';
import { State } from '../state.js'; 
import { PathResolver } from '../html-preview/resolver.js';
import { FileSystemProvider } from '../fs-provider.js';
import { MessageBridge } from '../html-preview/message-bridge.js';

const COMMAND_CACHE = new Map();

const FALLBACK_ACTIONS = {
    'save': (ctx) => FileActions.save(),
    'new-temp-file': () => FileActions.newTempFile(),
    'open-file': () => FileActions.openLocalFile(),
    'open-file-tab': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) Tabs.create(item);
    },
    'open-file-commander-tab': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileCommander.open(item);
    },
    'open-terminal-tab': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) Terminal.open(item);
    },
    'refresh': async () => {
        const { Workspaces } = await import('../workspaces/index.js');
        Workspaces.render();
    },
    'open-devtools': (ctx) => DevToolsOpener.open(ctx?.item || ctx),
    'beautify': () => {},
    'select-all': () => TextActions.selectAll(),
    'copy-all': () => TextActions.copyAll(),
    'copy-all-contents': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.copyAllContents([item]);
    },
    'download-all-contents': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.downloadAllContents([item]);
    },
    'download-file': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.downloadFile(item);
    },
    'copy-zip-single': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.copyAsZip([item]);
    },
    'download-zip-single': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.downloadAsZip([item]);
    },
    'copy-single': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) {
            await navigator.clipboard.writeText(item.name);
            const { UI } = await import('../ui.js');
            UI.showToast("Copied Name", "success");
        }
    },
    // B"H - NEW COPY RITUAL
    'copy-item': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) {
            const { UI } = await import('../ui.js');
            // If in selection mode, handle the whole group
            if (State.isSelectionModeActive && State.selectedItems.size > 0) {
                FileOperations.copySelected();
            } else {
                // Otherwise, copy the specific targeted item
                State.fileClipboard = [item];
                State.clipboardZip = null;
                UI.showToast(`Copied: ${item.name}`, "success");
            }
        }
    },
    'copy-relative-path': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) {
            await navigator.clipboard.writeText(item.path);
            const { UI } = await import('../ui.js');
            UI.showToast("Copied Path", "success");
        }
    },
    'paste': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.paste(item);
    },
    'find-replace': () => ViewActions.findReplace(),
    'visual-settings': () => ViewActions.visualSettings(),
    'settings': () => ViewActions.showSettings(),
    'show-docs': () => ViewActions.showDocs(),
    'toggle-line-comment': () => ViewActions.toggleLineComment(),
    'insert-line-before': () => ViewActions.insertLineBefore(),
    'insert-line-after': () => ViewActions.insertLineAfter(),
    'delete-line': () => ViewActions.deleteLine(),
    'go-to-line': () => ViewActions.goToLine(),
    'toggle-word-wrap': () => ViewActions.toggleWordWrap(),
    'increase-font-size': () => ViewActions.increaseFontSize(),
    'decrease-font-size': () => ViewActions.decreaseFontSize(),
    'toggle-theme': () => ViewActions.toggleTheme(),
    'close-other-tabs': () => ViewActions.closeOtherTabs(),
    'close-all-tabs': () => ViewActions.closeAllTabs(),
    'reopen-closed-tab': () => ViewActions.reopenClosedTab(),
    'file-properties': (ctx) => ViewActions.fileProperties(ctx?.item || ctx?.payload?.item || ctx),
    'toggle-keyboard-helper': () => ViewActions.toggleKeyboardHelper(),
    'toggle-fullscreen': () => ViewActions.toggleFullscreen(),
    'zen-mode': () => ViewActions.zenMode(),
    'start-selection': (ctx) => {
        import('../selection-manager.js').then(m => m.SelectionManager.start(ctx?.item || ctx?.payload?.item || ctx));
    },
    'delete-workspace': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) {
            const { Workspaces } = await import('../workspaces/index.js');
            Workspaces.remove(item.workspaceId);
        }
    },
    'git-actions': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) {
            const { GitManager } = await import('../git/index.js');
            GitManager.showGitUI(item);
        }
    },
    'switch-branch': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) {
            const { GitManager } = await import('../git/index.js');
            GitManager.switchBranch(item);
        }
    },
    'commit-changes': async () => {
        App.commitAllChanges();
    },
    
    // B"H - HTML PREVIEW CONTEXT ACTIONS
    'preview-nav-link': async () => {
        const p = State.contextPayload;
        if(!p) return;
        const absPath = PathResolver.resolve(p.referrer, p.href);
        const ws = State.workspaces.find(w => w.id === p.workspaceId);
        if(ws) Tabs.updatePreviewContext(p.previewTabId, { ...ws, path: absPath, kind: 'file', workspaceId: ws.id, type: ws.originalType || ws.type, name: absPath.split('/').pop() });
    },
    'preview-new-tab': async () => {
        const p = State.contextPayload;
        if(!p) return;
        const absPath = PathResolver.resolve(p.referrer, p.href);
        const ws = State.workspaces.find(w => w.id === p.workspaceId);
        if(ws) {
            const newItem = { ...ws, path: absPath, kind: 'file', workspaceId: ws.id, type: ws.originalType || ws.type, name: absPath.split('/').pop() };
            const content = await FileSystemProvider.read(newItem);
            Tabs.createPreview(newItem, content instanceof Blob ? await content.text() : String(content));
        }
    },
    'preview-copy': async () => {
        const p = State.contextPayload;
        if (p && p.selectionText) {
            await navigator.clipboard.writeText(p.selectionText);
            import('../ui.js').then(m => m.UI.showToast("Copied from Preview", "success"));
        }
    },
    'preview-select-all': async () => {
        MessageBridge.sendCommandToIframe(State.contextPayload.previewTabId, 'selectAll');
    },
    'preview-view-source': async () => {
        const p = State.contextPayload;
        if(!p) return;
        const tab = State.tabs.find(t => t.id === p.previewTabId);
        if(tab) {
            const originalItem = { 
                ...tab.item, 
                name: tab.item.name.replace('Preview: ', ''), 
                type: tab.item.originalType 
            };
            Tabs.create(originalItem);
        }
    },
    'preview-back': async () => {
        const p = State.contextPayload;
        if(!p) return;
        Tabs.goBackPreview(p.previewTabId);
    },

    // TEXT ACTIONS
    'insert-cyber-ipsum': () => TextActions.insertCyberIpsum(),
    'zalgo-text': () => TextActions.zalgoText(),
    'text-binary': () => TextActions.textBinary(),
    'text-reverse': () => TextActions.textReverse(),
    'transform-upper': () => TextActions.transformUpper(),
    'transform-lower': () => TextActions.transformLower(),
    'transform-title': () => TextActions.transformTitle(),
    'transform-base64-encode': () => TextActions.base64Encode(),
    'transform-base64-decode': () => TextActions.base64Decode(),
    'transform-url-encode': () => TextActions.urlEncode(),
    'transform-url-decode': () => TextActions.urlDecode(),
    'sort-lines': () => TextActions.sortLines(),
    'insert-date': () => TextActions.insertDate(),
    'insert-uuid': () => TextActions.insertUUID()
};

export const ActionRegistry = {
    async resolve(actionId) {
        if (COMMAND_CACHE.has(actionId)) {
            return COMMAND_CACHE.get(actionId);
        }
        
        // B"H - Priority Check: If it's a known synchronous UI action or fallback, 
        // return it IMMEDIATELY to prevent 404 MIME type errors in the browser console.
        if (FALLBACK_ACTIONS[actionId]) {
            const handler = FALLBACK_ACTIONS[actionId];
            COMMAND_CACHE.set(actionId, handler);
            return handler;
        }

        try {
            const module = await import(`./commands/${actionId}.js`);
            let executor = module.default;
            
            if (!executor) {
                for (const key in module) {
                    const exp = module[key];
                    if (typeof exp === 'function' || (exp && typeof exp.run === 'function')) {
                        executor = exp;
                        break;
                    }
                }
            }

            if (executor) {
                COMMAND_CACHE.set(actionId, executor);
                return executor;
            }
        } catch(e) {
            console.error(`B"H - Registry Error: Could not locate the file or load the script for[${actionId}]. Check spelling!`, e);
            return null;
        }
    },
    
    register(actionId, handlerFn) {
        COMMAND_CACHE.set(actionId, handlerFn);
    }
};
