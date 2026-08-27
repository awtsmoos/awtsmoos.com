
// B"H
import { Session } from '../session.js';
import { SettingsManager } from './settings.js';
import { WorkspaceOptimisticActivator } from '../workspaces/manager/WorkspaceOptimisticActivator.js';

export const StorageOrchestrator = {
    async recallPreviousReality() {
        // Load session structure (workspaces/tabs)
        await Session.load();

        // Perform the optimistic binding of physical handles
        await WorkspaceOptimisticActivator.ignite();
    },

    preserveMoment() {
        SettingsManager.save(document);
    }
};
