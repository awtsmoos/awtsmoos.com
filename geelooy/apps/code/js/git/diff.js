// B"H
// FILE: js/git/diff.js
import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { calculateGitBlobSha } from '../git-sha-calculator.js';
import { UI } from '../ui.js';

export const GitDiff = {
    async calculateDiff(gitContextItem, gitInfo, options = { checkUntracked: false }) {
        const changeSet = { creations: [], updates: [], deletions: [], dirtyFiles: [], conflicts: [] };
        const remoteFileMap = new Map((gitInfo.remoteTree || []).filter(f => f.type === 'blob').map(f => [f.path, f]));
        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

        const getRelativePath = (fullPath) => {
            if (gitContextItem.type === 'github') return fullPath.replace(/^\//, '');
            const root = gitContextItem.path.replace(/\/+$/, "");
            if (root === "" || root === "/") return fullPath.replace(/^\//, '');
            if (fullPath.startsWith(root + '/')) return fullPath.substring(root.length + 1);
            return null;
        };

        const handledPaths = new Set();
        const uncommitted = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
        
        for (const change of uncommitted) {
            const rel = change.item.path;
            handledPaths.add(rel);
            if (change.content === null) {
                if (remoteFileMap.has(rel)) changeSet.deletions.push({ path: rel });
                continue;
            }
            if (!remoteFileMap.has(rel)) changeSet.creations.push({ path: rel, content: change.content });
            else changeSet.updates.push({ path: rel, content: change.content });
        }

        if (options.checkUntracked && gitContextItem.type !== 'github') {
            const taskId = `scan-${Date.now()}`;
            UI.startTask(taskId, "Scanning vessels...");
            const localFiles = await FileSystemProvider.listAllFiles(gitContextItem);
            const localPaths = new Set();

            for (let i = 0; i < localFiles.length; i++) {
                const file = localFiles[i];
                const rel = getRelativePath(file.path);
                if (!rel || rel.startsWith('.awtsmoos-repo')) continue;
                localPaths.add(rel);
                
                UI.updateTask(taskId, (i / localFiles.length) * 100, `Checking: ${file.name}`);

                if (handledPaths.has(rel)) continue;

                const raw = await FileSystemProvider.read({ ...gitContextItem, path: file.path });
                const content = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : raw);

                if (!remoteFileMap.has(rel)) {
                    changeSet.creations.push({ path: rel, content });
                } else {
                    const remoteSha = remoteFileMap.get(rel).sha;
                    const localSha = await calculateGitBlobSha(content);
                    if (localSha !== remoteSha) changeSet.updates.push({ path: rel, content });
                }
            }

            for (const remotePath of remoteFileMap.keys()) {
                if (!localPaths.has(remotePath) && !handledPaths.has(remotePath)) {
                    changeSet.deletions.push({ path: remotePath });
                }
            }
            UI.endTask(taskId, 'success', 'Scan finished.');
        }
        return changeSet;
    }
};