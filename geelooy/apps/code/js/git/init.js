// B"H
// FILE: js/git/init.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { App } from '../app.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';
import { GitCommit } from './git-commit.js';

export const GitInit = {
    async initializeRepository(folderItem) {
        if (!State.githubToken) {
            const token = await UI.showDialog({
                title: "GitHub Token Required",
                message: "Enter a GitHub Personal Access Token with 'repo' scope to create a repository.",
                hasInput: true,
                inputType: 'password',
                placeholder: "ghp_...",
                okText: "Continue"
            });
            if (token) {
                State.githubToken = token;
                App.saveSettings();
            } else return;
        }

        const detailsHTML = `<p>Create a new repository on GitHub from the contents of <strong>'${folderItem.name}'</strong>.</p><label for="repo-name">New Repository Name</label><input type="text" id="repo-name" value="${folderItem.name.replace(/[^a-zA-Z0-9-.]/g, '-').toLowerCase()}"><label for="repo-desc">Description (optional)</label><textarea id="repo-desc"></textarea><div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;"><input type="checkbox" id="repo-private" style="width: auto;"><label for="repo-private">Private repository</label></div>`;
        const result = await UI.showDialog({
            title: 'Initialize GitHub Repository',
            contentHTML: detailsHTML,
            okText: 'Create & Push'
        });
        if (!result) return;

        const repoName = document.getElementById('repo-name').value;
        const description = document.getElementById('repo-desc').value;
        const isPrivate = document.getElementById('repo-private').checked;
        if (!repoName) {
            UI.showToast("Repository name is required.", "error");
            return;
        }

        const taskId = `git-init-${Date.now()}`;
        UI.startTask(taskId, `Creating repository '${repoName}'...`);

        try {
            const newRepoData = await FileSystemProvider.GitHub.api('/user/repos', {
                method: 'POST',
                body: JSON.stringify({
                    name: repoName,
                    description,
                    private: isPrivate,
                    auto_init: false
                })
            });

            UI.updateTask(taskId, 30, "Gathering local files...");
            const allFiles = await FileSystemProvider.listAllFiles(folderItem);
            const changeSet = { creations: [] };

            if (allFiles.length === 0) {
                changeSet.creations.push({ path: '.gitkeep', content: '' });
            } else {
                const basePath = folderItem.path === '/' ? '' : folderItem.path;
                for (const file of allFiles) {
                    const relativePath = file.path.startsWith(basePath + '/') ? file.path.substring(basePath.length + 1) : file.path;
                    if (relativePath && !relativePath.startsWith('.awtsmoos-repo')) {
                        const rawContent = await FileSystemProvider.read({ ...folderItem, path: file.path });
                        const stringContent = (rawContent instanceof Blob) ? await rawContent.text() : (rawContent || '');
                        changeSet.creations.push({ path: relativePath, content: stringContent });
                    }
                }
            }

            if (changeSet.creations.length === 0) changeSet.creations.push({ path: '.gitkeep', content: '' });

            UI.updateTask(taskId, 60, "Performing initial commit...");
            const repoInfo = { owner: newRepoData.owner.login, repo: newRepoData.name };

            const initialCommitSHA = await GitCommit.performCommit({ 
                repoInfo,
                branch: newRepoData.default_branch,
                type: 'github', 
                id: folderItem.id || State.nextWorkspaceId 
            }, { 
                repoInfo, 
                branch: newRepoData.default_branch,
                remoteTree: [] 
            }, changeSet, 'B"H: Initial Commit');

            UI.updateTask(taskId, 90, "Linking folder...");
            const newTree = await FileSystemProvider.GitHub.getFullTree({ repoInfo, branch: newRepoData.default_branch });
            
            if(folderItem.type !== 'github') {
                const gitInfo = {
                    isClone: true,
                    repoInfo,
                    branch: newRepoData.default_branch,
                    baseCommitSHA: initialCommitSHA,
                    remoteTree: newTree.tree
                };

                const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`;
                await FileSystemProvider.create(folderItem, '.awtsmoos-repo', 'directory');
                const metaDirItem = { ...folderItem, path: `${folderItem.path}/.awtsmoos-repo` };
                const ikarFileItem = { ...metaDirItem, name: 'ikar.js', path: `${metaDirItem.path}/ikar.js` };
                await FileSystemProvider.write(ikarFileItem, ikarFileContent);
                
                const parentOfItem = { ...folderItem, path: folderItem.path.substring(0, folderItem.path.lastIndexOf('/')) || '/' };
                await Workspaces.refreshNode(parentOfItem);
            }
 
            UI.endTask(taskId, 'success', `'${repoName}' created successfully!`);

        } catch (e) {
            let errorMessage = e.message;
            if (e.message && e.message.toLowerCase().includes("name already exists")) {
                errorMessage = "Repository name already exists.";
            }
            UI.endTask(taskId, 'error', `Init failed: ${errorMessage}`);
            console.error("GIT INIT FAILED:", e);
        }
    }
};