
// B"H
/**
 * @file GitCloudScribe.js
 * @brief THE SCRIBE OF THE CELESTIAL REPOSITORY.
 */

import { UI } from '../../../../ui.js';
import { GitCommit } from '../../../../git/git-commit.js';

export const GitCloudScribe = {
    /**
     * @async
     * @function push
     * @description Synchronizes a Vibe changeset with a remote GitHub repository.
     */
    async push(workspace, changes) {
        if (!workspace || workspace.type !== 'github') return false;
        
        try {
            console.log(`[GitScribe] B"H - Synchronizing Cloud Workspace: ${workspace.name}`);
            
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
                `B"H - Vibe Autonomous Manifestation: ${changes.length} files.`
            );
            return true;
        } catch (e) {
            UI.showToast(`Cloud Sync Failed: ${e.message}`, "error");
            return false;
        }
    }
};
