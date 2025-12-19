
// B"H
// FILE: js/session.js
import { State } from './state.js';
import { Workspaces } from './workspaces.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';

export const Session = {
    saveDebounceTimer: null,

    saveDebounced() {
        if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
        this.saveDebounceTimer = setTimeout(() => {
            this.save();
        }, 1000); 
    },

    save() {
        try {
            const persistableWorkspaces = State.workspaces
                .filter(ws => ['github', 'indexeddb', 'ssh', 'local'].includes(ws.type))
                .map(ws => {
                    const { handle, _treeCache, isLocked, ...safeWs } = ws;
                    return safeWs;
                });

            const allowedWsIds = new Set(persistableWorkspaces.map(ws => ws.id));

            const persistableTabs = State.tabs
                .filter(tab => {
                    // B"H - Explicitly allow 'vibe-session' item types
                    return (tab.item.workspaceId !== undefined && allowedWsIds.has(tab.item.workspaceId)) || tab.item.type === 'temp' || tab.item.type === 'vibe-session';
                })
                .map(tab => {
                    const safeItem = {
                        name: tab.item.name,
                        path: tab.item.path,
                        kind: tab.item.kind,
                        type: tab.item.type,
                        workspaceId: tab.item.workspaceId, 
                        repoInfo: tab.item.repoInfo,       
                        branch: tab.item.branch,           
                        sha: tab.item.sha,
                        originalType: tab.item.originalType // Persist original type for Vibe
                    };

                    // B"H - For Vibe tabs, 'content' is the session object.
                    const contentToSave = (tab.isDirty || tab.item.type === 'temp' || tab.fileType === 'vibe') ? tab.content : null;

                    return { 
                        id: tab.id,
                        uniquePath: tab.uniquePath,
                        isDirty: tab.isDirty,
                        isUncommitted: tab.isUncommitted,
                        scrollPos: tab.scrollPos || 0,
                        fileType: tab.fileType,
                        item: safeItem,
                        content: contentToSave
                    };
                });

            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            const activeTabUniquePath = activeTab ? activeTab.uniquePath : null;

            const session = {
                workspaces: persistableWorkspaces,
                openTabs: persistableTabs,
                activeTabUniquePath: activeTabUniquePath,
                expandedFolders: Array.from(State.expandedFolders)
            };

            localStorage.setItem('vividX_session_profound', JSON.stringify(session));
        } catch (e) {
            console.error("Save Session Failed:", e);
        }
    },

    async load() {
        const savedSession = localStorage.getItem('vividX_session_profound');
        if (!savedSession) return;

        try {
            const session = JSON.parse(savedSession);

            if (session.workspaces && Array.isArray(session.workspaces)) {
                let maxId = 0;
                for (const wsData of session.workspaces) {
                    if (wsData.id >= maxId) maxId = wsData.id + 1;

                    if (wsData.type === 'local') {
                        try {
                            const handle = await FileSystemProvider.IndexedDB.getHandle(wsData.id);
                            if (handle) {
                                wsData.handle = handle;
                                const perm = await handle.queryPermission({ mode: 'readwrite' });
                                wsData.isLocked = (perm !== 'granted');
                            } else {
                                wsData.isLocked = true;
                                wsData.isLost = true;
                            }
                        } catch (e) { wsData.isLocked = true; }
                    }
                    Workspaces.add(wsData, false);
                }
                State.nextWorkspaceId = maxId;
            }

            if (session.openTabs && Array.isArray(session.openTabs)) {
                let maxTabId = 0;
                State.tabs = session.openTabs.map(t => {
                    if (t.id >= maxTabId) maxTabId = t.id + 1;
                    
                    // B"H - Vibe Hydration Logic
                    if (t.fileType === 'vibe' && t.content) {
                        t.vibeSession = t.content; // Restore session object
                    }

                    return {
                        ...t,
                        forceReload: true, 
                        scrollPos: typeof t.scrollPos === 'number' ? t.scrollPos : 0
                    };
                });
                State.nextTabId = maxTabId;
                Tabs.render();
            }

            if (session.expandedFolders) {
                State.expandedFolders = new Set(session.expandedFolders);
                Workspaces.render();
            }

            if (session.activeTabUniquePath) {
                const activeTab = State.tabs.find(t => t.uniquePath === session.activeTabUniquePath);
                if (activeTab) {
                    State.activeTabId = activeTab.id;
                }
            }
        } catch (e) {
            console.error("Session Load Failed:", e);
        }
    }
};
