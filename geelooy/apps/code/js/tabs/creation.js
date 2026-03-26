
// B"H
import { State } from '../state.js';
import { MimeUtil } from '../mime-util.js';
import { App } from '../app.js';
import { Tabs } from './index.js';

export const TabsCreation = {
    async create(item, isNewFile = false, shouldSave = true, activate = true) {
        if (!item) return;

        // B"H - Immediate duplication check before any async yields
        const uniquePath = item.type === 'commander' ? `commander::${item.workspaceId||'global'}::${item.path}` : 
                           item.type === 'terminal' ? `terminal::${item.workspaceId||'global'}::${item.path}` :
                           item.type === 'devtools' ? `devtools::${item.previewTabId}` :
                           Tabs.getUniquePath(item);

        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            if (activate) Tabs.activate(existingTab.id); // Non-blocking trigger
            return;
        }

        if (item.type === 'commander') {
            const newTab = { id: State.nextTabId++, item, content: item.commanderState, isDirty: false, uniquePath, fileType: 'commander' };
            State.tabs.push(newTab);
            if (activate) Tabs.activate(newTab.id);
            return;
        }

        if (item.type === 'terminal') {
            const newTab = { id: State.nextTabId++, item, content: null, isDirty: false, uniquePath, fileType: 'terminal' };
            State.tabs.push(newTab);
            if (activate) Tabs.activate(newTab.id);
            return;
        }
        
        if (item.type === 'devtools') {
            const newTab = { 
                id: State.nextTabId++, item, isDirty: false, uniquePath, 
                fileType: 'devtools', devtoolsState: { previewTabId: item.previewTabId, logs:[], networkReqs:[], domString:'', activePanel: 'console' } 
            };
            State.tabs.push(newTab);
            if (activate) Tabs.activate(newTab.id);
            return;
        }
        
        let fileType = MimeUtil.getInfo(item.name).type;
        if (item.type === 'vibe-session') fileType = 'vibe';

        const newTab = {
            id: State.nextTabId++, item, content: item.content !== undefined ? item.content : (isNewFile ? '' : null),
            isDirty: isNewFile || (item.content !== undefined && item.type !== 'zip-entry'),
            isUncommitted: false, uniquePath, scrollPos: 0, fileType: fileType,
        };
        State.tabs.push(newTab);
        if (shouldSave) App.saveSession();
        if (activate) Tabs.activate(newTab.id);
    },

    async createPreview(item, content) {
        const uniquePreviewPath = `preview::${item.workspaceId}::${item.path}`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePreviewPath);
        
        if (existingTab) {
            existingTab.content = content; existingTab.rawContent = content; existingTab.forceReload = true;
            existingTab.previewHistory =[]; 
            Tabs.activate(existingTab.id, true);
            return;
        }

        const previewItem = { ...item, name: `Preview: ${item.name}`, originalType: item.originalType || item.type, type: 'html-preview-file' };
        const newTab = {
            id: State.nextTabId++, item: previewItem, content, rawContent: content,
            isDirty: false, isUncommitted: false, uniquePath: uniquePreviewPath, scrollPos: 0, fileType: 'html-preview', isPreview: true, previewHistory:[]
        };
        State.tabs.push(newTab);
        App.saveSession();
        Tabs.activate(newTab.id);
    }
};
