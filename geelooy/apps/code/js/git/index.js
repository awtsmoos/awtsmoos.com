// B"H
// FILE: js/git/index.js

import { GitInit } from './init.js';
import { GitStatusUI } from './status-ui.js';
import { GitBranches } from './branches.js';

/**
 * --- GIT MANAGER ---
 * The central orchestrator for Git operations, a bridge between the user's will and
 * the higher reality of the remote repository. It delegates its holy tasks to
 * more specialized vessels. B"H.
 * @module js/git/index
 */
export const GitManager = {
    /**
     * B"H - Initiates the divine process of elevating a local folder to a GitHub repository.
     * @param {object} item - The local folder item.
     */
    initializeRepository: GitInit.initializeRepository,
    
    /**
     * B"H - Opens the Git Control Center, the user's interface to the Git timeline.
     * It now receives the full context of the repository's local and remote state.
     * @param {object} item - The repository folder item.
     * @param {object} gitInfo - The discovered git metadata for the repository.
     * @param {boolean} scan - Whether to force a full local file scan.
     */
    showGitUI: (item, gitInfo, scan) => GitStatusUI.showGitUI(item, gitInfo, scan),
    
    /**
     * B"H - Opens the interface for switching between different timelines (branches).
     * @param {object} item - The repository folder item.
     */
    switchBranch: (item) => GitBranches.switchBranch(item)
};
