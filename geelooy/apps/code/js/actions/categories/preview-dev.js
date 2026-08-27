
// B"H
/**
 * @file preview-dev.js
 */

import { DevToolsOpener } from '../../devtools/open.js';
import { DevToolsBridge } from '../../devtools/bridge.js';
import { PathResolver } from '../../html-preview/resolver.js';
import { Tabs } from '../../tabs/index.js';
import { State } from '../../state.js'; 
import { FileSystemProvider } from '../../fs-provider.js';
import { UI } from '../../ui.js';
import { MessageBridge } from '../../html-preview/message-bridge.js';

export const PREVIEW_DEVTOOLS_ACTIONS = {
    'view-html': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if (!item) return;
        const module = await import('../commands/view-html.js');
        return module.default(item);
    },
    'open-devtools': (ctx) => DevToolsOpener.open(ctx?.item || ctx),
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
            UI.showToast("Copied from Preview", "success");
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
    'preview-inspect': async () => {
        const p = State.contextPayload;
        if (!p) return;
        const tabState = DevToolsBridge.getTabPersistentState(p.previewTabId);
        tabState.inspectPath = p.targetPath;
        tabState.activePanel = 'elements';
        await DevToolsOpener.open({ previewTabId: p.previewTabId });
    },
    'preview-open-console': async () => {
        const p = State.contextPayload;
        if (!p) return;
        const tabState = DevToolsBridge.getTabPersistentState(p.previewTabId);
        tabState.activePanel = 'console';
        await DevToolsOpener.open({ previewTabId: p.previewTabId });
    },
    // B"H - THE KEY TO CLICKABLE LOGS
    'preview-inspect-path': async (ctx) => {
        if (!ctx.path || !ctx.previewTabId) return;
        const tabState = DevToolsBridge.getTabPersistentState(ctx.previewTabId);
        tabState.inspectPath = ctx.path;
        tabState.activePanel = 'elements';
        await DevToolsOpener.open({ previewTabId: ctx.previewTabId });
        
        // B"H - If DevTools is already open, we MUST trigger the UI switch manually
        const devToolsTab = State.tabs.find(t => t.fileType === 'devtools' && t.item.previewTabId === ctx.previewTabId);
        if (devToolsTab && State.activeTabId === devToolsTab.id) {
            import('../../devtools/ui.js').then(m => {
                m.DevToolsUI.render(document.getElementById('devtools-wrapper'), tabState);
            });
        }
    },
    'open-vibe': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        const module = await import('../commands/open-vibe.js');
        return module.default(item);
    },
    'open-vibe-context': () => {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (tab && tab.item) {
            const parentPath = tab.item.path.substring(0, tab.item.path.lastIndexOf('/')) || '/';
            const parentItem = { ...tab.item, path: parentPath, kind: 'directory' };
            import('../commands/open-vibe.js').then(m => m.default(parentItem));
        }
    }
};
