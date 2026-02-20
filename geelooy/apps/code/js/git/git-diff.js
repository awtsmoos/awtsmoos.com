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
        // B"H
		const getRelativePath = (fullPath) => {
		    // If it's a direct GitHub workspace, paths are already relative
		    if (gitContextItem.type === 'github') {
		        return fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
		    }
		
		    // For Local Clones (Nested or Root):
		    // Root is localRootPath (from gitContextItem.path)
		    const cloneRoot = gitContextItem.path.replace(/\/+$/, "");
		    
		    // Case 1: Repo is the workspace root
		    if (cloneRoot === "" || cloneRoot === "/") {
		        return fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
		    }
		    
		    // Case 2: Repo is a subfolder
		    if (fullPath.startsWith(cloneRoot + '/')) {
		        return fullPath.substring(cloneRoot.length + 1);
		    }
		    
		    // Case 3: Exact match (the folder itself)
		    if (fullPath === cloneRoot) return "";
		
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
            
            // B"H - Check for Deletion Marker (null content)
            if (change.content === null) {
                // If it exists in remote, it's a pending deletion
                if (remoteFileMap.has(relativePath)) {
                    changeSet.deletions.push({ path: relativePath });
                }
                // If not in remote, it was a creation that was cancelled/deleted locally before push
                continue;
            }

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
    },

    // B"H - Compute Line Diff
    // Simple line-based diff algorithm for the UI
    computeLineDiff(oldText, newText) {
        const oldLines = oldText ? oldText.split(/\r?\n/) : [];
        const newLines = newText ? newText.split(/\r?\n/) : [];
        const diff = [];

        // Very basic LCS-like approximation for UI speed (not a full Myers Diff)
        // Ideally, we'd use a library, but we want zero deps.
        // We will do a simple match scan.
        
        let i = 0, j = 0;
        
        while (i < oldLines.length || j < newLines.length) {
            if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
                diff.push({ type: 'same', content: oldLines[i], line: j + 1 });
                i++; j++;
            } else {
                // Look ahead to see if it's an insertion or deletion
                let foundMatch = false;
                
                // Try to find current oldLine in future newLines (Deletion check)
                // Limit lookahead to keep it fast
                const lookahead = 20; 
                
                // Check if new lines were inserted
                let k = 1;
                while (j + k < newLines.length && k < lookahead) {
                    if (i < oldLines.length && oldLines[i] === newLines[j + k]) {
                        // Found match later in new -> Everything in between is inserted
                        while (k > 0) {
                            diff.push({ type: 'added', content: newLines[j], line: j + 1 });
                            j++; k--;
                        }
                        foundMatch = true;
                        break;
                    }
                    k++;
                }
                
                if (!foundMatch) {
                    // Check if old lines were deleted
                    k = 1;
                    while (i + k < oldLines.length && k < lookahead) {
                        if (j < newLines.length && oldLines[i + k] === newLines[j]) {
                            // Found match later in old -> Everything in between is deleted
                            while (k > 0) {
                                diff.push({ type: 'removed', content: oldLines[i], line: i + 1 }); // Use i for removed
                                i++; k--;
                            }
                            foundMatch = true;
                            break;
                        }
                        k++;
                    }
                }

                if (!foundMatch) {
                    // No obvious match, assume strict modification (remove then add)
                    // Or end of one file
                    if (i < oldLines.length) {
                        diff.push({ type: 'removed', content: oldLines[i], line: i + 1 });
                        i++;
                    }
                    if (j < newLines.length) {
                        diff.push({ type: 'added', content: newLines[j], line: j + 1 });
                        j++;
                    }
                }
            }
        }
        
        return diff;
    }
};