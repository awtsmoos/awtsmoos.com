
// B"H
/**
 * @file WorkspaceAdder.js
 * @brief The ritual of adding new worlds to the digital cosmos.
 * 
 * CHAPTER I: THE EXPANDING HORIZON
 * From the infinite potential of the Awtsmoos's thought,
 * A new world is willed, a new vessel is sought!
 * We take the raw data, the name and the type,
 * And wait till the moment for creation is ripe.
 * With an ID of light, the workspace is sealed,
 * Into the State where the Truth is revealed.
 * Every workspace is a new dimension of Malchus, 
 * a kingdom of files brought forth from the absolute Ayin (Nothingness)
 * of the unallocated disk space, sustained every second by His Speech.
 */

import { State } from '../../state.js';
import { App } from '../../app.js';
import { SidebarOrchestrator } from './SidebarOrchestrator.js';

/**
 * @class WorkspaceAdder
 * @description Manages the infusion of new workspace definitions into the application.
 */
export class WorkspaceAdder {
    /**
     * B"H - Adds a workspace vessel to the State and manifests its visual form.
     * @param {Object} ws - The blueprint of the workspace containing name, type, and handles.
     * @param {boolean} [shouldSave=true] - Whether to record this deed in the eternal localStorage archive.
     */
    static add(ws, shouldSave = true) {
        if (!ws) return;

        // B"H - ID Manifestation: If the world is new, we bestow a fresh identity.
        // Identity is the first garment of existence.
        const isNew = ws.id === undefined;
        const newWs = { 
            ...ws,
            id: isNew ? State.nextWorkspaceId++ : ws.id 
        };

        State.workspaces.push(newWs);
        
        console.log("B\"H [WorkspaceAdder] New World anchored: " + newWs.name + " (" + newWs.id + ")");

        if (shouldSave) {
            // Manifest the visual change in the Sidebar
            SidebarOrchestrator.rebuild();
            // Inscribe into the eternal scroll of the Session
            App.saveSession();
        }
    }
}
