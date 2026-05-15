// B"H
// FILE: js/git/git-diff.js

import { FileSystemProvider } from '../fs-provider.js';
import { calculateGitBlobSha } from '../git-sha-calculator.js';
import { UI } from '../ui.js';

/**
 * B"H - The lens of comparison.
 *
 * Scans can now be scoped to any subdirectory inside a local Git repo while all
 * paths are still normalized against the repository root. Any detected local
 * additions, edits, or deletions are also written into the persistent
 * uncommitted_files store, so the next fast Git Control open remembers them.
 */
export const GitDiff = {
    async calculateDiff(gitContextItem, gitInfo, options = { checkUntracked: false }) {
        const changeSet = { creations: [], updates: [], deletions: [], dirtyFiles: [], conflicts: [] };
        const remoteFileMap = new Map((gitInfo.remoteTree || []).filter(f => f.type === 'blob').map(f => [f.path, f]));
        const workspaceId = gitContextItem.workspaceId || gitInfo.workspaceId || gitContextItem.id || gitInfo.id;
        const scanRootItem = options.scanRoot || gitContextItem;

        const repoRootPath = this._normalizeDirPath(gitInfo.path || gitContextItem.path || '/');
        const scanRootPath = this._normalizeDirPath(scanRootItem.path || repoRootPath);
        const scanScopePrefix = this._relativeToRepo(scanRootPath, repoRootPath);

        const getRelativePath = (fullPath) => this._relativeToRepo(fullPath, repoRootPath);

        const handledPaths = new Set();
        const uncommittedChanges = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);

        // 1. Persistent fast path.
        for (const change of uncommittedChanges) {
            const relPath = change.item.path;
            if (!this._isWithinScope(relPath, scanScopePrefix)) continue;

            handledPaths.add(relPath);

            if (change.content === null) {
                if (remoteFileMap.has(relPath)) changeSet.deletions.push({ path: relPath });
                continue;
            }

            if (!remoteFileMap.has(relPath)) {
                changeSet.creations.push({ path: relPath, content: change.content });
            } else {
                changeSet.updates.push({ path: relPath, content: change.content });
            }
        }

        // 2. Disk scan, scoped to the clicked repo subdirectory when requested.
        if (options.checkUntracked && gitContextItem.type !== 'github') {
            const taskId = `scan-${Date.now()}`;
            UI.startTask(taskId, scanScopePrefix ? `Scanning ${scanScopePrefix}...` : 'Scanning repository...');

            const localFiles = await FileSystemProvider.listAllFiles(scanRootItem);
            const localPaths = new Set();

            for (let i = 0; i < localFiles.length; i++) {
                const file = localFiles[i];
                const relPath = getRelativePath(file.path);
                if (!relPath || relPath.startsWith('.awtsmoos-repo/') || relPath === '.awtsmoos-repo') continue;
                if (!this._isWithinScope(relPath, scanScopePrefix)) continue;

                localPaths.add(relPath);
                UI.updateTask(taskId, (i / Math.max(localFiles.length, 1)) * 100, `Checking: ${file.name || relPath}`);

                if (handledPaths.has(relPath)) continue;

                try {
                    const raw = await FileSystemProvider.read(file);
                    const content = await this._rawToText(raw);

                    if (!remoteFileMap.has(relPath)) {
                        const change = { path: relPath, content };
                        changeSet.creations.push(change);
                        await this._persistDetectedChange(workspaceId, change, content, file);
                    } else {
                        const remoteSha = remoteFileMap.get(relPath).sha;
                        const localSha = await calculateGitBlobSha(content);
                        if (localSha !== remoteSha) {
                            const change = { path: relPath, content };
                            changeSet.updates.push(change);
                            await this._persistDetectedChange(workspaceId, change, content, file);
                        }
                    }
                } catch (e) {
                    console.warn('[GitDiff] Skipped file during scan:', relPath, e);
                }
            }

            for (const remotePath of remoteFileMap.keys()) {
                if (!this._isWithinScope(remotePath, scanScopePrefix)) continue;
                if (!localPaths.has(remotePath) && !handledPaths.has(remotePath)) {
                    const change = { path: remotePath };
                    changeSet.deletions.push(change);
                    await this._persistDetectedChange(workspaceId, change, null, {
                        ...scanRootItem,
                        path: `${repoRootPath === '/' ? '' : repoRootPath}/${remotePath}`,
                        name: remotePath.split('/').pop(),
                        kind: 'file'
                    });
                }
            }

            UI.endTask(taskId, 'success', scanScopePrefix ? `Scan finished: ${scanScopePrefix}` : 'Repository scan finished.');
        }

        return changeSet;
    },

    _normalizeDirPath(path) {
        const normalized = String(path || '/').replace(/\\/g, '/').replace(/\/+$/, '');
        return normalized || '/';
    },

    _relativeToRepo(fullPath, repoRootPath) {
        const path = String(fullPath || '').replace(/\\/g, '/');
        const root = this._normalizeDirPath(repoRootPath);

        if (root === '/' || root === '') return path.replace(/^\//, '');
        if (path === root) return '';
        if (path.startsWith(root + '/')) return path.substring(root.length + 1);
        return null;
    },

    _isWithinScope(relPath, scopePrefix) {
        if (!scopePrefix) return true;
        return relPath === scopePrefix || relPath.startsWith(scopePrefix + '/');
    },

    async _rawToText(raw) {
        if (raw instanceof Blob) return await raw.text();
        if (raw && raw.base64Content) return atob(raw.base64Content);
        return String(raw ?? '');
    },

    async _persistDetectedChange(workspaceId, change, content, file) {
        if (!workspaceId || !change.path) return;

        const uniquePath = `${workspaceId}::${change.path}`;
        const item = {
            ...file,
            path: change.path,
            name: change.path.split('/').pop(),
            kind: 'file',
            workspaceId
        };

        await FileSystemProvider.IndexedDB.writeUncommitted(uniquePath, content, item);
    }
};