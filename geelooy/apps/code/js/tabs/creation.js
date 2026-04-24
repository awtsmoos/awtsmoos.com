
// B"H
import { State } from '../state.js';
import { MimeUtil } from '../mime-util.js';
import { App } from '../app.js';
import { Tabs } from './index.js';
import { TabRegistrySentinel } from './logic/TabRegistrySentinel.js';

export const TabsCreation = {
    async create(item, isNewFile = false, shouldSave = true, activate = true) {
        if (!item) return;

        // B"H - ABSOLUTE DUPLICATE PREVENTION via Registry Sentinel
        const existing = TabRegistrySentinel.findExisting(item);
        if (existing) {
            console.log(`[TabsCreation] B"H - Redirecting vision to existing manifestation: ${existing.id}`);
            if (activate) Tabs.activate(existing.id, false); 
            return existing;
        }

        const uniquePath = TabRegistrySentinel.generateKey(item);
        let fileType = MimeUtil.getInfo(item.name || item.path).type;
        if (item.type === 'vibe-session' || item.type === 'vibe') fileType = 'vibe';

        const newTab = {
            id: State.nextTabId++, 
            item: { ...item }, 
            content: item.vibeSession || item.content || (isNewFile ? '' : null),
            isDirty: isNewFile,
            uniquePath, 
            fileType,
            vibeSession: item.vibeSession || null
        };

        State.tabs.push(newTab);
        Tabs.render();
        
        if (shouldSave) App.saveSession();
        if (activate) Tabs.activate(newTab.id, false);
        return newTab;
    },

    async createPreview(item, content) {
        const previewItem = { ...item, type: 'html-preview-file', isPreview: true };
        const existing = TabRegistrySentinel.findExisting(previewItem);
        
        if (existing) {
            existing.content = content; 
            existing.forceReload = true;
            Tabs.activate(existing.id, true);
            return;
        }

        const newTab = {
            id: State.nextTabId++, 
            item: { ...previewItem, name: `Preview: ${item.name}` },
            content, 
            uniquePath: TabRegistrySentinel.generateKey(previewItem),
            fileType: 'html-preview', 
            isPreview: true
        };
        
        State.tabs.push(newTab);
        Tabs.render();
        App.saveSession();
        Tabs.activate(newTab.id);
    }
};
