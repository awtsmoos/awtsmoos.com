
// B"H
import { State } from '../state.js';
import { MimeUtil } from '../mime-util.js';
import { App } from '../app.js';
import { Tabs } from './index.js';

export const TabsCreation = {
    async create(item, isNewFile = false, shouldSave = true, activate = true) {
        if (!item) return;

        if (item.type === 'commander') {
            const newTab = { id: State.nextTabId++, item, content: item.commanderState, isDirty: false, uniquePath: `commander::${Date.now()}`, fileType: 'commander' };
            State.tabs.push(newTab);
            if (activate) await Tabs.activate(newTab.id);
            return;
        }

        if (item.type === 'terminal') {
            const newTab = { id: State.nextTabId++, item, content: null, isDirty: false, uniquePath: `terminal::${Date.now()}`, fileType: 'terminal' };
            State.tabs.push(newTab);
            if (activate) await Tabs.activate(newTab.id);
            return;
        }
        
        if (item.type === 'devtools') {
            const newTab = { 
                id: State.nextTabId++, item, isDirty: false, uniquePath: `devtools::${item.previewTabId}`, 
                fileType: 'devtools', devtoolsState: { previewTabId: item.previewTabId, logs:[], networkReqs:[], domString:'', activePanel: 'console' } 
            };
            State.tabs.push(newTab);
            if (activate) await Tabs.activate(newTab.id);
            return;
        }

        const uniquePath = Tabs.getUniquePath(item);
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existingTab) {
            if (activate) await Tabs.activate(existingTab.id);
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
        if (activate) await Tabs.activate(newTab.id);
    },

    async createPreview(item, content) {
        const uniquePreviewPath = `preview::${item.workspaceId}::${item.path}`;
        const existingTab = State.tabs.find(t => t.uniquePath === uniquePreviewPath);
        
        if (existingTab) {
            existingTab.content = content; existingTab.rawContent = content; existingTab.forceReload = true;
            existingTab.previewHistory =[]; 
            await Tabs.activate(existingTab.id, true);
            return;
        }

        const previewItem = { ...item, name: `Preview: ${item.name}`, originalType: item.originalType || item.type, type: 'html-preview-file' };
        const newTab = {
            id: State.nextTabId++, item: previewItem, content, rawContent: content,
            isDirty: false, isUncommitted: false, uniquePath: uniquePreviewPath, scrollPos: 0, fileType: 'html-preview', isPreview: true, previewHistory:[]
        };
        State.tabs.push(newTab);
        App.saveSession();
        await Tabs.activate(newTab.id);
    }
};
