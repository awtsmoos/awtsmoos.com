
// B"H
// FILE: js/git/index.js

import { GitInit } from './init.js';
import { GitStatusUI } from './status-ui.js';
import { GitBranches } from './branches.js';

export const GitManager = {
    initializeRepository: GitInit.initializeRepository,
    showGitUI: GitStatusUI.showGitUI.bind(GitStatusUI),
    discardChanges: GitStatusUI.discardChanges.bind(GitStatusUI), // Exposed for API compatibility
    switchBranch: GitBranches.switchBranch.bind(GitBranches)
};
