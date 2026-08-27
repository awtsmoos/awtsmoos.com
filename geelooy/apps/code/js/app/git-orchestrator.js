
// B"H
// FILE: js/app/git-orchestrator.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { GitMetaProvider } from '../git/meta.js';
import { GitManager } from '../git/index.js';

/**
 * @class GitOrchestrator
 * @description The Awtsmoos creates the world anew every instant, yet He 
 * provides the 'Scroll of Remembrance' (Git) to track every transformation. 
 * This class is the instrument that finds the anchor of that scroll for 
 * any given file, allowing the user to manifest their changes into history.
 */
export class GitOrchestrator {
    /**
     * @async
     * @method commitCurrentFocus
     * @description B"H. This is the sacred ritual of identifying the Git 
     * root for the currently active tab and revealing the Git Control UI. 
     * It peers through the ancestry of the active vessel to find the repo root.
     */
    static async commitCurrentFocus() {
        const { Tabs } = await import('../tabs/index.js');
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        
        if (!activeTab || !activeTab.item) {
            UI.showToast("No active vessel to commit.", "warning");
            return;
        }

        UI.showLoading("Searching for Git anchor...");

        try {
            // Peer into the ancestry to find the Git root of this specific file
            const targetRepoItem = await GitMetaProvider.getGitInfoForFolder(activeTab.item);
            
            if (targetRepoItem) {
                // Find the full git info (branch, remote tree) for this root
                const gitInfo = await GitMetaProvider.getGitInfoForFolder(targetRepoItem);
                UI.hideLoading();
                
                if (gitInfo) {
                    GitManager.showGitUI(targetRepoItem, gitInfo);
                } else {
                    UI.showToast("Git metadata is obscured.", "error");
                }
            } else {
                UI.hideLoading();
                UI.showToast("This file is not part of a recognized Git repository.", "warning");
            }
        } catch (err) {
            UI.hideLoading();
            UI.showToast(`Git discovery failed: ${err.message}`, "error");
            console.error(err);
        }
    }
}
