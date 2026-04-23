
// B"H
import { State } from '../state.js';
import { TabPathRitual } from './path-ritual.js';
import { MimeUtil } from '../mime-util.js';

export const TabFactory = {
    create(item, isNewFile = false) {
        const uniquePath = TabPathRitual.getUniquePath(item);
        
        // Check for existing manifestation
        const existing = State.tabs.find(t => t.uniquePath === uniquePath);
        if (existing) return { tab: existing, isNew: false };

        let fileType = MimeUtil.getInfo(item.name || item.path).type;
        if (item.type === 'vibe-session') fileType = 'vibe';
        if (item.type === 'terminal') fileType = 'terminal';
        if (item.type === 'commander') fileType = 'commander';

        const newTab = {
            id: State.nextTabId++,
            uniquePath,
            item: { ...item },
            fileType,
            isDirty: isNewFile,
            isUncommitted: false,
            scrollPos: 0,
            content: item.content !== undefined ? item.content : (isNewFile ? '' : null),
            // Persistent states for specialized tabs
            terminalState: item.terminalState || null,
            commanderState: item.commanderState || null,
            vibeSession: item.vibeSession || null,
            isPreview: !!item.isPreview
        };

        State.tabs.push(newTab);
        return { tab: newTab, isNew: true };
    }
};
