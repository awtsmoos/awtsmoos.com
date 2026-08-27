
// B"H
/**
 * @file CelestialScribe.js
 * @brief THE SCRIBE OF THE CLOUD REPOSITORY.
 */

import { UI } from '../../../../ui.js';
import { GitCommit } from '../../../../git/git-commit.js';

export const CelestialScribe = {
    /**
     * @async
     * @function push
     * @description Automatically commits AI changes to GitHub.
     */
    async push(workspace, changes) {
        if (!workspace || workspace.type !== 'github') return false;
        
        try {
            console.log(`[CelestialScribe] B"H - Updating Cloud Records: ${workspace.name}`);
            
            const gitInfo = {
                repoInfo: workspace.repoInfo,
                branch: workspace.branch || 'main',
                remoteTree: workspace._treeCache ? Array.from(workspace._treeCache.values()).flat() : []
            };

            const changeSet = { creations: [], updates: [], deletions: [] };

            changes.forEach(c => {
                const gp = c.path.startsWith('/') ? c.path.substring(1) : c.path;
                if (c.operation === 'delete') changeSet.deletions.push({ path: gp });
                else changeSet.updates.push({ path: gp, content: c.content });
            });

            await GitCommit.performCommit(
                { ...workspace, kind: 'directory', path: '/' },
                gitInfo,
                changeSet,
                `B"H - Vibe Autonomous Sync: ${changes.length} vessels.`
            );
            return true;
        } catch (e) {
            UI.showToast(`Celestial Sync Interrupted: ${e.message}`, "error");
            return false;
        }
    }
};
