// B"H
// FILE: js/git/index.js

import { GitInit } from './init.js';
import { GitStatusUI } from './status-ui.js';
import { GitBranches } from './branches.js';

/**
 * B"H - Git Manager
 * The central orchestrator for Git operations, now utilizing 
 * a fully modular internal architecture.
 */
export const GitManager = {
    initializeRepository: GitInit.initializeRepository,
    
    // B"H - Safe binding: Ensure GitStatusUI is fully loaded
    showGitUI: (item, scan) => GitStatusUI.showGitUI(item, scan),
    
    discardChanges: (item) => GitStatusUI.discardChanges(item),
    
    switchBranch: (item) => GitBranches.switchBranch(item)
};