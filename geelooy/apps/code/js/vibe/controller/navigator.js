
// B"H
import { VibeDB } from '../db.js';
import { Tabs } from '../../tabs/index.js';
import { UI } from '../../ui.js';
import { State } from '../../state.js';
import { WorkspaceIdentity } from '../../core/identity/WorkspaceIdentity.js';

export const VibeNavigator = {
    async openSession(folderItem) {
        UI.showLoading("Resonating timestream attributes...");
        try {
            // Unification metric (The precise fingerprint to separate same-named paths between OPFS/IDB)
            const idKey = WorkspaceIdentity.getUniquePath(folderItem);
            
            let storedSession = await VibeDB.getSession(idKey);
            if (!storedSession) {
                storedSession = { 
                    id: idKey, 
                    name: `Vibe: ${folderItem.name}`, 
                    path: folderItem.path, 
                    workspaceId: folderItem.workspaceId, 
                    originalType: folderItem.originalType || folderItem.type, 
                    history: [], 
                    viewState: { activeSidebarTab: 'tree', isSidebarCollapsed: false } 
                };
                await VibeDB.saveSession(idKey, storedSession);
            }
            
            const creationModel = { 
                ...folderItem, 
                name: storedSession.name, 
                type: 'vibe-session', 
                originalType: folderItem.originalType || folderItem.type 
            };
            
            await Tabs.create({ ...creationModel, content: storedSession }, false, true, true);
        } catch (error) { 
            UI.showToast(`B"H Divergence: ${error.message}`, "error"); 
        } finally { 
            UI.hideLoading(); 
        }
    },

    async openManager() {
        const itemTemplate = { name: "Global Sentience Controls", type: 'vibe-manager', kind: 'file', path: 'settings-root', content: "{}" };
        await Tabs.create(itemTemplate, false, false, true);
    },

    async previewFile(tabObjContext, physicalPathTarget) {
        const primaryRef = tabObjContext || State.tabs.find(t => t.id === State.activeTabId);
        if (!primaryRef) return;

        const dynamicTargetModel = { 
            name: physicalPathTarget.split("/").pop(), 
            path: physicalPathTarget, 
            kind: 'file', 
            workspaceId: primaryRef.item.workspaceId, 
            type: primaryRef.item.originalType || primaryRef.item.type 
        };
        await Tabs.create(dynamicTargetModel);
    },

    getRootItem(vesselParamTab) { 
        // B"H Ensures absolute alignment so External Manifest tree won't lose object definition and scream 'ERR' 
        const structuralMemory = vesselParamTab.vibeSession || vesselParamTab.content || {};
        const safeRootPath = structuralMemory.path || structuralMemory.rootPath || vesselParamTab.item?.path || "/";
        const extractedId = structuralMemory.workspaceId || vesselParamTab.item?.workspaceId;
        const matchedWS = State.workspaces.find(w => String(w?.id) === String(extractedId));
        
        return { 
            ...matchedWS,
            name: (vesselParamTab.item?.name || "Target System").replace("Vibe: ", ""), 
            path: safeRootPath, 
            workspaceId: extractedId, 
            type: structuralMemory.originalType || vesselParamTab.item?.originalType, 
            originalType: structuralMemory.originalType || vesselParamTab.item?.originalType, 
            kind: 'directory' 
        }; 
    }
};
