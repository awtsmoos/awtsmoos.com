
// B"H
// FILE: js/terminal/commands/git.js
import { GitManager } from '../../git/index.js';
import { GitMetaProvider } from '../../git/meta.js';
import { GitDiff } from '../../git/git-diff.js';

export const GitCommands = {
    async git(shell, args) {
        const sub = args.shift();
        const gitInfo = await GitMetaProvider.getGitInfoForFolder(shell.cwd);
        
        if (!gitInfo && sub !== 'init') throw new Error("fatal: not a git repository");

        switch(sub) {
            case 'init': 
                GitManager.initializeRepository(shell.cwd); 
                return "Initializing repo via UI...";
            case 'status':
                const diff = await GitDiff.calculateDiff(shell.cwd, gitInfo, { checkUntracked: true });
                return `On branch ${gitInfo.branch}\n` + 
                       (diff.updates.length ? `Modified: ${diff.updates.length}\n` : '') +
                       (diff.creations.length ? `New files: ${diff.creations.length}\n` : '') +
                       (diff.deletions.length ? `Deleted: ${diff.deletions.length}\n` : '') +
                       (!diff.updates.length && !diff.creations.length ? "nothing to commit, working tree clean" : "");
            case 'commit':
                GitManager.showGitUI(shell.cwd, gitInfo);
                return "Opening Git Manifest via UI...";
            default:
                throw new Error(`git: '${sub}' is not a recognized internal command.`);
        }
    }
};
