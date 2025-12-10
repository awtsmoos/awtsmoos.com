
// B"H
// FILE: js/git/git-diff.js
import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { calculateGitBlobSha } from '../git-sha-calculator.js';

export const GitDiff = {
    /**
     * Calculates the difference between local state and remote git state.
     * PERFORMANCE UPDATE: Only scans the file system if checkUntracked is true.
     * @param {object} gitContextItem - The root item of the repo.
     * @param {object} gitInfo - The git metadata including remoteTree.
     * @param {object} options - { checkUntracked: boolean }
     */
    async calculateDiff(gitContextItem, gitInfo, options = { checkUntracked: false }) {
        const changeSet = {
            creations: [],
            updates: [],
            deletions: [],
            dirtyFiles: [],
            conflicts: []
        };

        const remoteFileMap = new Map(
            (gitInfo.remoteTree || [])
            .filter(f => f.type === 'blob') 
            .map(f => [f.path, f])
        );
        
        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

        // Helper to normalize paths
        const getRelativePath = (fullPath) => {
            if (gitContextItem.type === 'github') return fullPath; 
            const cloneRoot = gitContextItem.path;
            if (cloneRoot === '/') return fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
            if (fullPath.startsWith(cloneRoot + '/')) return fullPath.substring(cloneRoot.length + 1);
            return null;
        };

        const handledPaths = new Set(); 

        // 1. Check open tabs for unsaved changes (Fast & Critical)
        State.tabs.forEach(tab => {
            if (!tab.isDirty || tab.item.workspaceId !== workspaceId) return;
            const relPath = getRelativePath(tab.item.path);
            if (relPath) {
                changeSet.dirtyFiles.push({ tabItem: tab.item, relativePath: relPath });
                handledPaths.add(relPath);
                
                // Conflict Detection
                if (remoteFileMap.has(relPath)) {
                    const remoteFile = remoteFileMap.get(relPath);
                    if (tab.item.sha && tab.item.sha !== remoteFile.sha) {
                        changeSet.conflicts.push({
                            path: relPath,
                            reason: "Remote file has changed since you opened it.",
                            remoteSha: remoteFile.sha,
                            localBaseSha: tab.item.sha
                        });
                    }
                }
            }
        });

        // 2. Check staged/uncommitted changes in IndexedDB (Fast & Critical)
        const uncommittedChanges = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
        
        for (const change of uncommittedChanges) {
            const relativePath = change.item.path; 
            handledPaths.add(relativePath);
            
            if (!remoteFileMap.has(relativePath)) {
                changeSet.creations.push({ path: relativePath, content: change.content });
            } else {
                changeSet.updates.push({ path: relativePath, content: change.content });
                
                // Check conflicts for staged files
                if (change.item && change.item.sha) {
                     const remoteFile = remoteFileMap.get(relativePath);
                     if (remoteFile && remoteFile.sha !== change.item.sha) {
                         changeSet.conflicts.push({
                            path: relativePath,
                            reason: "Remote file changed after you staged this edit.",
                            remoteSha: remoteFile.sha,
                            localBaseSha: change.item.sha
                        });
                     }
                }
            }
        }

        // 3. Scan local file system (Slow - Only if requested)
        // B"H - Optimization: We only walk the disk if options.checkUntracked is true.
        // This prevents "HUGE AMOUNT OF TIME" delays on large repos unless explicitly refreshed.
        if (options.checkUntracked && gitContextItem.type !== 'github') {
            const localFiles = await FileSystemProvider.listAllFiles(gitContextItem);
            const localFilePaths = new Set(); 

            for (const file of localFiles) {
                const relPath = getRelativePath(file.path);
                if (!relPath || relPath.startsWith('.awtsmoos-repo')) continue;

                localFilePaths.add(relPath);

                if (handledPaths.has(relPath)) continue;

                // Case A: File is NOT in remote -> It's a Creation (Add)
                if (!remoteFileMap.has(relPath)) {
                    // We must read the content to commit it
                    try {
                        const content = await this._readContent(gitContextItem, file.path);
                        changeSet.creations.push({ path: relPath, content: content });
                    } catch (e) { console.warn(`Failed to read new file ${relPath}`, e); }
                } 
                // Case B: File IS in remote -> Check modification (SHA calculation)
                else {
                    try {
                        const content = await this._readContent(gitContextItem, file.path);
                        const remoteSha = remoteFileMap.get(relPath).sha;
                        const localSha = await calculateGitBlobSha(content);
                        
                        if (localSha !== remoteSha) {
                            changeSet.updates.push({ path: relPath, content: content });
                        }
                    } catch (readErr) {
                        console.warn(`Could not read ${relPath} for diff`, readErr);
                    }
                }
            }

            // 4. Check for deletions (Remote has it, Local doesn't)
            // Only valid if we scanned the full list
            for (const remoteFilePath of remoteFileMap.keys()) {
                if (!localFilePaths.has(remoteFilePath) && !handledPaths.has(remoteFilePath)) {
                    changeSet.deletions.push({ path: remoteFilePath });
                }
            }
        }

        return changeSet;
    },

    async _readContent(contextItem, filePath) {
        const rawContent = await FileSystemProvider.read({ ...contextItem, path: filePath });
        if (rawContent instanceof Blob) {
            return await rawContent.text();
        } else if (typeof rawContent === 'string') {
            return rawContent;
        } else if (rawContent && rawContent.base64Content) {
             return atob(rawContent.base64Content);
        }
        return '';
    }
};
