// B"H
/**
 * @file session.js
 * @brief The Master Orchestrator of the Archive.
 * 
 * THE EPIC OF THE RECONSTITUTED WORLD:
 * From the silence of storage, the session returns,
 * To quench the deep thirst that the Oracle learns.
 * We build up the workspaces, we open the tabs,
 * As every last spark from the archive we grab.
 * And when it is finished, we summon the tree,
 * So the sidebar is filled for the user to see.
 */

import { State } from './state.js';
import { Workspaces } from './workspaces/index.js';
import { Tabs } from './tabs/index.js';
import { DevToolsBridge } from './devtools/bridge.js';
import { ArchiveGuard } from './session/ArchiveGuard.js';
import { TabScribe } from './session/TabScribe.js';

export const Session = {
    saveDebounceTimer: null,

    saveDebounced() {
        if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
        this.saveDebounceTimer = setTimeout(() => this.save(), 1000); 
    },

    /**
     * B"H - Manifests the current State into the local storage stone.
     */
    save() {
        try {
            const persistableWorkspaces = ArchiveGuard.getPersistableWorkspaces(State.workspaces);
            const allowedWsIds = new Set(persistableWorkspaces.map(ws => ws.id));
            
            const tabsToArchiving = ArchiveGuard.getPersistableTabs(State.tabs, allowedWsIds);
            const persistedTabs = tabsToArchiving.map(t => TabScribe.deconstruct(t));

            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            
            const sessionData = {
                workspaces: persistableWorkspaces,
                openTabs: persistedTabs,
                activeTabUniquePath: activeTab ? activeTab.uniquePath : null,
                expandedFolders: Array.from(State.expandedFolders)
            };
            
            localStorage.setItem('vividX_session_profound', JSON.stringify(sessionData));
            console.log("B\"H - Session anchored.");
        } catch (e) { 
            console.warn("B\"H - Session Save Failed:", e); 
        }
    },

    /**
     * B"H - Reconstitutes the previously archived reality.
     */
    async load() {
        const raw = localStorage.getItem('vividX_session_profound');
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            
            // 1. Rebuild Workspaces
            if (data.workspaces) {
                data.workspaces.forEach(ws => Workspaces.add(ws, false));
                const maxWsId = Math.max(-1, ...State.workspaces.map(w => Number(w.id) || 0));
                State.nextWorkspaceId = maxWsId + 1;
            }

            // 2. Rebuild Tabs
            if (data.openTabs) {
                // B"H - THE RITUAL OF RE-AWAKENING (CONSOLE FIX)
                // We must pre-hydrate the StateRegistry BEFORE restoring tabs.
                console.log("%cB\"H [Session] Pre-hydrating DevTools states from archive...", "color: #ffae57; font-weight:bold;");
                data.openTabs.forEach(t => {
                    // If a tab has devtools metadata...
                    if (t.devtoolsMetadata) {
                        const targetId = t.item.previewTabId || t.id;
                        console.log(`[Session] Found DevTools metadata for Vision [${targetId}]. Re-hydrating state...`);
                        // ...force the DevToolsBridge to recreate a living state object for it in the Registry.
                        DevToolsBridge.getTabPersistentState(targetId, t.devtoolsMetadata);
                    }
                });

                State.tabs = data.openTabs.map(t => ({ ...t, forceReload: false }));
                const maxTabId = Math.max(-1, ...State.tabs.map(t => Number(t.id) || 0));
                State.nextTabId = maxTabId + 1;
                
                Tabs.render();
            }

            // 3. Re-Expand Gates
            if (data.expandedFolders) {
                State.expandedFolders = new Set(data.expandedFolders);
            }

            // 4. Focus Awakening
            if (data.activeTabUniquePath) {
                const active = State.tabs.find(t => t.uniquePath === data.activeTabUniquePath);
                if (active) State.activeTabId = active.id;
            }

            // 5. PHYSICAL VISION: Manifest the sidebar tree
            console.log("B\"H - Session re-aligned. Manifesting physical sidebar.");
            Workspaces.render();

        } catch (e) { 
            console.error("B\"H - Session Reconstitution Failed:", e); 
        }
    }
};