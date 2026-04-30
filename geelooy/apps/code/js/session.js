
// B"H
// FILE: js/session.js

import { State } from './state.js';
import { Workspaces } from './workspaces/index.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs/index.js';
import { DevToolsBridge } from './devtools/bridge.js';

export const Session = {
    saveDebounceTimer: null,

    saveDebounced() {
        if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
        this.saveDebounceTimer = setTimeout(() => this.save(), 1000); 
    },

    save() {
        try {
            const persistableWorkspaces = State.workspaces
                .filter(ws =>['github', 'indexeddb', 'ssh', 'local', 'opfs'].includes(ws.type))
                .map(ws => { const { handle, _treeCache, isLocked, ...safeWs } = ws; return safeWs; });

            const allowedWsIds = new Set(persistableWorkspaces.map(ws => ws.id));

            const persistableTabs = State.tabs
                .filter(tab => (tab.item.workspaceId !== undefined && allowedWsIds.has(tab.item.workspaceId)) ||['temp', 'vibe-session', 'terminal', 'commander', 'html-preview-file', 'devtools'].includes(tab.item.type))
                .map(tab => {
                    const safeItem = { ...tab.item };
                    let contentToSave = null;
                    if (['temp', 'vibe-session', 'html-preview'].includes(tab.fileType)) contentToSave = tab.content;
                    else if (typeof tab.content === 'object') contentToSave = tab.content;

                    let devtoolsMetadata = null;
                    const bridgeState = DevToolsBridge.getTabPersistentState(tab.fileType === 'devtools' ? tab.item.previewTabId : tab.id);
                    if (bridgeState && (bridgeState.logs.length > 0 || bridgeState.networkReqs.length > 0)) {
                        devtoolsMetadata = {
                            activePanel: bridgeState.activePanel,
                            selectedPath: bridgeState.selectedPath,
                            expandedPaths: Array.from(bridgeState.expandedPaths ||[]),
                            logs: bridgeState.logs.slice(-100), 
                            networkReqs: bridgeState.networkReqs.slice(-100)
                        };
                    }

                    return { 
                        id: tab.id, uniquePath: tab.uniquePath, isDirty: tab.isDirty, isUncommitted: tab.isUncommitted,
                        pinned: tab.pinned || false, scrollPos: tab.scrollPos || 0, fileType: tab.fileType,
                        isPreview: tab.isPreview, item: safeItem, content: contentToSave, devtoolsMetadata 
                    };
                });

            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            const session = {
                workspaces: persistableWorkspaces,
                openTabs: persistableTabs,
                activeTabUniquePath: activeTab ? activeTab.uniquePath : null,
                expandedFolders: Array.from(State.expandedFolders)
            };
            localStorage.setItem('vividX_session_profound', JSON.stringify(session));
        } catch (e) { console.warn("B\"H - Session Save Failed:", e); }
    },

    async load() {
        const savedSession = localStorage.getItem('vividX_session_profound');
        if (!savedSession) return;
        try {
            const session = JSON.parse(savedSession);
            if (session.workspaces) {
                session.workspaces.forEach(wsData => Workspaces.add(wsData, false));
                
                // B"H - Rectify workspace ID counter to prevent collisions
                const maxWsId = Math.max(-1, ...State.workspaces.map(ws => Number(ws.id) || 0));
                if (maxWsId >= State.nextWorkspaceId) {
                    State.nextWorkspaceId = maxWsId + 1;
                }
            }
            if (session.openTabs) {
                State.tabs = session.openTabs.map(t => {
                    if (t.devtoolsMetadata) {
                        DevToolsBridge.getTabPersistentState(t.item.previewTabId || t.id, t.devtoolsMetadata);
                    }
                    return { ...t, forceReload: true };
                });
                
                // B"H - Rectify tab ID counter to prevent massive UI multi-select/closure bugs
                const maxTabId = Math.max(-1, ...State.tabs.map(t => Number(t.id) || 0));
                if (maxTabId >= State.nextTabId) {
                    State.nextTabId = maxTabId + 1;
                }
                
                Tabs.render();
            }
            if (session.expandedFolders) State.expandedFolders = new Set(session.expandedFolders);
            if (session.activeTabUniquePath) {
                const active = State.tabs.find(t => t.uniquePath === session.activeTabUniquePath);
                if (active) State.activeTabId = active.id;
            }
            Workspaces.render();
        } catch (e) { console.error("Session Load Failed:", e); }
    }
};
