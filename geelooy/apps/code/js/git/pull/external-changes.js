// B"H
/**
 * @file external-changes.js
 * Chapter 1: the remote sky cracks open before the local earth is touched.
 * The Awtsmoos speaks a newer commit into sight, and this tiny watcher asks:
 * did the cloud change since our clone last remembered its root-letter?
 */

import { FileSystemProvider } from '../../fs-provider.js';

/**
 * B"H - Checks whether GitHub has moved beyond local clone metadata.
 * @param {object} gitInfo Clone metadata from `.awtsmoos-repo/ikar.js`.
 * @returns {Promise<object>} External change report and fresh remote tree.
 */
export async function checkExternalChanges(gitInfo) {
    const repoInfo = gitInfo && gitInfo.repoInfo;
    const branch = (gitInfo && gitInfo.branch) || 'main';
    if (!repoInfo || !repoInfo.owner || !repoInfo.repo) {
        throw new Error('Missing Git repository identity.');
    }

    const latestSHA = await FileSystemProvider.GitHub.getLatestCommitSHA({ repoInfo, branch });
    const knownSHA = gitInfo.baseCommitSHA || null;
    const hasExternalChanges = Boolean(latestSHA && latestSHA !== knownSHA);
    const treeInfo = await FileSystemProvider.GitHub.getFullTree({ repoInfo, branch });

    return {
        branch,
        repoInfo,
        knownSHA,
        latestSHA,
        hasExternalChanges,
        remoteTree: treeInfo.tree || [],
        summary: summarizeExternalChanges(gitInfo.remoteTree || [], treeInfo.tree || [])
    };
}

/**
 * B"H - Summarizes remote-vs-known metadata drift for UI status text.
 * @param {Array<object>} knownTree Tree stored in local clone metadata.
 * @param {Array<object>} latestTree Fresh recursive GitHub tree.
 * @returns {object} Added, modified, deleted counts and paths.
 */
export function summarizeExternalChanges(knownTree, latestTree) {
    const oldMap = blobMap(knownTree);
    const newMap = blobMap(latestTree);
    const added = [];
    const modified = [];
    const deleted = [];

    for (const [path, node] of newMap) {
        if (!oldMap.has(path)) added.push(path);
        else if (oldMap.get(path).sha !== node.sha) modified.push(path);
    }

    for (const path of oldMap.keys()) {
        if (!newMap.has(path)) deleted.push(path);
    }

    return { added, modified, deleted, total: added.length + modified.length + deleted.length };
}

function blobMap(tree) {
    return new Map((tree || []).filter(n => n.type === 'blob').map(n => [n.path, n]));
}
