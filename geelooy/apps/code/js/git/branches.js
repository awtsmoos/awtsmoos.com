// B"H
// FILE: js/git/branches.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';
import { GitMetaProvider } from './meta.js';
import { FileOperations } from '../file-operations.js';

export const GitBranches = {
    async switchBranch(item) {
        // 1. Get Repo Info & Current Branch
        let repoInfo, currentBranch;
        
        if (item.type === 'github') {
            repoInfo = item.repoInfo;
            currentBranch = item.branch;
        } else {
            // Clone
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            if (!gitInfo) {
                UI.showToast("Not a git repository.", "error");
                return;
            }
            repoInfo = gitInfo.repoInfo;
            currentBranch = gitInfo.branch;
        }

        const taskId = `git-branches-${Date.now()}`;
        UI.startTask(taskId, "Fetching branches...");

        try {
            // 2. Fetch Branches
            const branchesData = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/branches`);
            const branches = branchesData.map(b => b.name);
            UI.endTask(taskId, 'success', 'Branches loaded.');
            
            // 3. Show Branch Selection Dialog
            const branchListHTML = branches.map(b => {
                const isActive = b === currentBranch;
                return `
                    <button class="menu-button ${isActive ? 'active-branch' : ''}" data-branch="${b}" style="${isActive ? 'border-color: var(--neon-lime); color: var(--neon-lime);' : ''}">
                        <svg class="svg-icon"><use href="#icon-git-branch"></use></svg>
                        <span>${b}</span> ${isActive ? '(Current)' : ''}
                    </button>
                `;
            }).join('');

            const contentHTML = `
                <div style="max-height: 250px; overflow-y: auto; display:flex; flex-direction:column; gap:5px; margin-bottom: 10px;">
                    ${branchListHTML}
                </div>
                <div style="border-top: 1px solid var(--color-border); padding-top: 10px;">
                    <label>Create New Branch:</label>
                    <div style="display:flex; gap:5px;">
                        <input type="text" id="new-branch-name" placeholder="new-branch-name">
                        <button id="create-branch-btn" class="primary-btn">Create</button>
                    </div>
                </div>
            `;

            const dialog = document.getElementById('generic-dialog');
            // We use a custom flow, so we don't await showDialog directly for value
            UI.showDialog({
                title: `Switch Branch (${repoInfo.repo})`,
                contentHTML,
                okText: "", // Hide default OK
                cancelText: "Close"
            });

            // Attach Listeners
            const container = dialog.querySelector('.dialog-content');
            
            // Handle Clicking existing branch
            const branchBtns = container.querySelectorAll('button[data-branch]');
            branchBtns.forEach(btn => {
                btn.onclick = () => {
                    const branchName = btn.dataset.branch;
                    if (branchName === currentBranch) return;
                    this._performSwitch(item, repoInfo, branchName);
                    dialog.querySelector('#dialog-cancel-btn').click(); // Close dialog
                };
            });

            // Handle Creating new branch
            container.querySelector('#create-branch-btn').onclick = async () => {
                const newName = container.querySelector('#new-branch-name').value.trim();
                if(!newName) return;
                
                const createTaskId = `git-create-branch-${Date.now()}`;
                UI.startTask(createTaskId, "Creating branch...");
                
                try {
                    // 1. Get SHA of current branch (or main)
                    const refData = await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${currentBranch}`);
                    const sha = refData.object.sha;
                    
                    // 2. Create Ref
                    await FileSystemProvider.GitHub.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
                        method: 'POST',
                        body: JSON.stringify({
                            ref: `refs/heads/${newName}`,
                            sha: sha
                        })
                    });
                    
                    UI.endTask(createTaskId, 'success', `Branch '${newName}' created!`);
                    this._performSwitch(item, repoInfo, newName);
                    dialog.querySelector('#dialog-cancel-btn').click();
                    
                } catch(e) {
                    console.error(e);
                    UI.endTask(createTaskId, 'error', "Failed to create branch: " + e.message);
                }
            };

        } catch(e) {
            UI.endTask(taskId, 'error', "Failed to fetch branches: " + e.message);
        }
    },

    async _performSwitch(item, repoInfo, newBranch) {
        const taskId = `git-switch-${Date.now()}`;
        UI.startTask(taskId, `Switching to '${newBranch}'...`);
        
        try {
            if (item.type === 'github') {
                // Direct GitHub Workspace: Easy, just update state and refresh
                item.branch = newBranch;
                item._treeCache = null; // Clear cache
                await Workspaces.refreshNode(item);
                UI.endTask(taskId, 'success', `Switched to branch '${newBranch}'`);
            } else {
                // Local Clone: Needs logic
                const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
                if (!gitInfo) throw new Error("Metadata missing.");
                
                // 1. Update ikar.js
                gitInfo.branch = newBranch;
                
                // 2. Write updated ikar.js
                const ikarContent = `// B"H\n\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`;
                const ikarItem = { ...item, path: `${item.path}/.awtsmoos-repo/ikar.js` };
                await FileSystemProvider.write(ikarItem, ikarContent);
                
                UI.endTask(taskId, 'success', 'Metadata updated.');

                // 3. Prompt for Pull
                const pullNow = await UI.showDialog({
                    title: "Branch Switched (Metadata)",
                    message: `Local metadata updated to '${newBranch}'.\nDo you want to download the files from this branch now? (This will overwrite local files)`,
                    okText: "Download & Overwrite",
                    cancelText: "Later (Manual Pull)"
                });
                
                if (pullNow) {
                    await FileOperations.pullAndOverwrite(item, gitInfo);
                } else {
                    UI.showToast(`Switched to '${newBranch}'. Don't forget to Pull!`, "info");
                }
            }
        } catch(e) {
            console.error(e);
            UI.endTask(taskId, 'error', "Switch failed: " + e.message);
        }
    }
};