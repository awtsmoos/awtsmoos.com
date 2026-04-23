
// B"H
/**
 * @file LoopGitPusher.js
 * @brief Automates GitHub Commits for Vibe Manifestations.
 */

import { State } from '../../state.js';
import { UI } from '../../ui.js';
import { GitCommit } from '../../git/git-commit.js';

export const LoopGitPusher = {
    /**
     * @async
     * @function autoCommit
     * @description If the workspace is a direct GitHub repo, commit changes automatically.
     */
    async autoCommit(workspace, changes) {
        if (workspace.type !== 'github') return false;
        
        try {
            UI.showToast("B\"H - Initiating Auto-Commit to GitHub...", "info");
            
            const gitInfo = {
                repoInfo: workspace.repoInfo,
                branch: workspace.branch || 'main',
                remoteTree: workspace._treeCache ? Array.from(workspace._treeCache.values()).flat() : []
            };

            const changeSet = {
                creations: [],
                updates: [],
                deletions: []
            };

            // Map changes to Git operations
            changes.forEach(c => {
                const gitPath = c.path.startsWith('/') ? c.path.substring(1) : c.path;
                if (c.operation === 'delete') {
                    changeSet.deletions.push({ path: gitPath });
                } else {
                    // We treat everything as an update; GitCommit handles creations vs updates smoothly
                    changeSet.updates.push({ path: gitPath, content: c.content });
                }
            });

            await GitCommit.performCommit(
                { ...workspace, kind: 'directory', path: '/' },
                gitInfo,
                changeSet,
                `B"H - Vibe Autonomous Manifestation: ${changes.length} files modified.`
            );
            
            return true;
        } catch (e) {
            console.error(`[LoopGitPusher] B"H - GitHub Auto-Commit Failed:`, e);
            UI.showToast(`Auto-Commit Failed: ${e.message}`, "error");
            return false;
        }
    }
};
