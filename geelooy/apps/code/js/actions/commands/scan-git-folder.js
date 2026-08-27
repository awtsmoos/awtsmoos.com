// B"H
/**
 * @file scan-git-folder.js
 * @brief Right-click repo-subtree scan command.
 */

import { GitManager } from '../../git/index.js';
import { GitMetaProvider } from '../../git/meta.js';
import { ItemResolver } from '../utils/itemResolver.js';
import { UI } from '../../ui.js';

/**
 * B"H.
 * Opens Git Control with a disk scan scoped to the right-clicked directory.
 * The repo root remains the main context, so file paths stay permanently relative
 * to the repository root instead of to the clicked subdirectory.
 */
export default async function run(context) {
    const scanRoot = ItemResolver.resolve(context);
    if (!scanRoot) {
        UI.showToast("Could not resolve scan folder.", "error");
        return;
    }

    if (scanRoot.kind && scanRoot.kind !== 'directory') {
        UI.showToast("Scanning must start from a folder.", "warning");
        return;
    }

    const gitInfo = await GitMetaProvider.getGitInfoForFolder(scanRoot);
    if (!gitInfo || gitInfo === true) {
        UI.showToast("Not a git repository folder.", "error");
        return;
    }

    const repoRoot = {
        ...scanRoot,
        path: gitInfo.path || scanRoot.path,
        name: (gitInfo.path || '/').split('/').filter(Boolean).pop() || scanRoot.name || 'Repository',
        kind: 'directory',
        workspaceId: scanRoot.workspaceId || gitInfo.workspaceId || scanRoot.id
    };

    await GitManager.showGitUI(repoRoot, gitInfo, true, { scanRoot });
}
