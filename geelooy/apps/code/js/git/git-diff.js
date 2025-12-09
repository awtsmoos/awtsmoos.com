// B"H
// FILE: js/git/git-diff.js
import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { calculateGitBlobSha } from '../git-sha-calculator.js';

export const GitDiff = {
    async calculateDiff(gitContextItem, gitInfo) {
        const changeSet = {
            creations: [],
            updates: [], 
            deletions: [],
            dirtyFiles: []
        };

        const remoteFileMap = new Map(
            (gitInfo.remoteTree || [])
            .filter(f => f.type === 'blob') 
            .map(f => [f.path, f])
        );
        
        const workspaceId = gitContextItem.workspaceId || gitContextItem.id;

        const getRelativePath = (fullPath) => {
            if (gitContextItem.type === 'github') return fullPath; 
            const cloneRoot = gitContextItem.path;
            if (cloneRoot === '/') return fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
            if (fullPath.startsWith(cloneRoot + '/')) return fullPath.substring(cloneRoot.length + 1);
            return null;
        };

        // 1. Check open tabs for unsaved changes
        State.tabs.forEach(tab => {
            if (!tab.isDirty || tab.item.workspaceId !== workspaceId) return;
            const relPath = getRelativePath(tab.item.path);
            if (relPath) {
                changeSet.dirtyFiles.push({ tabItem: tab.item, relativePath: relPath });
            }
        });

        // 2. Check staged/uncommitted changes in IndexedDB
        const uncommittedChanges = await FileSystemProvider.IndexedDB.listUncommittedForWorkspace(workspaceId);
        const handledPaths = new Set(); 
        
        for (const change of uncommittedChanges) {
            const relativePath = change.item.path; 
            handledPaths.add(relativePath);
            
            if (!remoteFileMap.has(relativePath)) {
                changeSet.creations.push({ path: relativePath, content: change.content });
            } else {
                changeSet.updates.push({ path: relativePath, content: change.content });
            }
        }

        // 3. Scan local files for external modifications
        if (gitContextItem.type !== 'github') {
            const localFiles = await FileSystemProvider.listAllFiles(gitContextItem);
            const localFilePaths = new Set(); 

            for (const file of localFiles) {
                const relPath = getRelativePath(file.path);
                if (!relPath || relPath.startsWith('.awtsmoos-repo')) continue;

                localFilePaths.add(relPath);

                if (handledPaths.has(relPath)) continue;

                // Read file content to check against remote
                try {
                    const rawContent = await FileSystemProvider.read({ ...gitContextItem, path: file.path });
                    let stringContent = '';
                    
                    // Normalize content for SHA calculation
                    if (rawContent instanceof Blob) {
                        stringContent = await rawContent.text();
                    } else if (typeof rawContent === 'string') {
                        stringContent = rawContent;
                    } else if (rawContent && rawContent.base64Content) {
                         stringContent = atob(rawContent.base64Content);
                    }

                    if (!remoteFileMap.has(relPath)) {
                        // File exists locally but not remote -> Created
                        changeSet.creations.push({ path: relPath, content: stringContent });
                    } else {
                        // File exists in both. Check if modified.
                        const remoteSha = remoteFileMap.get(relPath).sha;
                        const localSha = await calculateGitBlobSha(stringContent);
                        
                        if (localSha !== remoteSha) {
                            changeSet.updates.push({ path: relPath, content: stringContent });
                        }
                    }
                } catch (readErr) {
                    console.warn(`Could not read ${relPath} for diff`, readErr);
                }
            }

            // 4. Check for deletions (Remote has it, Local doesn't)
            for (const remoteFilePath of remoteFileMap.keys()) {
                if (!localFilePaths.has(remoteFilePath)) {
                    changeSet.deletions.push({ path: remoteFilePath });
                }
            }
        }

        return changeSet;
    }
};