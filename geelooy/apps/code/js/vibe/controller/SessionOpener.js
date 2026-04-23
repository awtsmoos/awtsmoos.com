// B"H
/**
 * @file SessionOpener.js
 * @brief THE GATEKEEPER OF VIBE DIMENSIONS.
 */

import { VibeDB } from '../db.js';
import { Tabs } from '../../tabs/index.js';
import { UI } from '../../ui.js';
import { MultidimensionalSeal } from '../../core/identity/MultidimensionalSeal.js';
import { VesselValidator } from '../../core/validation/VesselValidator.js';

export const SessionOpener = {
    async open(folderItem) {
        UI.showLoading("Establishing resonance...");
        
        const isPhysical = await VesselValidator.exists(folderItem);
        if (!isPhysical) {
            UI.hideLoading();
            UI.showToast(`B"H - Location lost: ${folderItem.path}`, "error");
            return;
        }

        try {
            const idKey = MultidimensionalSeal.cast(folderItem);
            let session = await VibeDB.getSession(idKey);
            if (!session) {
                session = { 
                    id: idKey, 
                    name: `Vibe: ${folderItem.name}`, 
                    path: folderItem.path, 
                    workspaceId: folderItem.workspaceId, 
                    originalType: folderItem.originalType || folderItem.type, 
                    history: [], 
                    viewState: { activeSidebarTab: 'tree', isSidebarCollapsed: false } 
                };
                await VibeDB.saveSession(idKey, session);
            }
            
            const tabItem = { 
                ...folderItem, 
                name: session.name, 
                type: 'vibe-session', 
                originalType: folderItem.originalType || folderItem.type 
            };
            
            await Tabs.create({ ...tabItem, vibeSession: session }, false, true, true);
        } catch(e) { 
            UI.showToast(`B"H - Resonance Error: ${e.message}`, "error"); 
        } finally { 
            UI.hideLoading(); 
        }
    }
};