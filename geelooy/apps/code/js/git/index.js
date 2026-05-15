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
     * @param {object} item - The repository folder item, or a folder inside the repo.
     * @param {object|boolean}gitInfo - Optional discovered Git metadata, or a legacy scan boolean.
     * @param {boolean|object} scan - Whether to force a disk scan, or a scan options object.
     * @param {object} options - Additional options such as `scanRoot`.
     */
    showGitUI: (item, gitInfo, scan, options) => GitStatusUI.showGitUI(item, gitInfo, scan, options),
    
    /**
     * B"H - Opens the interface for switching between different timelines (branches).
     * @param {object} item - The repository folder item.
     */
    switchBranch: (item) => GitBranches.switchBranch(item)
};
