// B"H
// FILE: js/git/init.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { App } from '../app.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';
import { CommitAPI } from './commit/api.js';

/**
 * --- GIT INIT ---
 * This vessel holds the sacred ritual for birthing a new GitHub repository
 * from the potential of a local folder. It is the act of elevation. B"H.
 */
export const GitInit = {
    /**
     * B"H - The grand ritual for initializing a repository.
     * @param {object} folderItem - The local folder, a vessel of potential waiting to be manifested.
     */
	async initializeRepository(folderItem) {
	    if (!State.githubToken) {
	        const token = await UI.showDialog({
	            title: "GitHub Token Required",
	            message: "Enter a GitHub Personal Access Token with 'repo' scope.",
	            hasInput: true, inputType: 'password', okText: "Continue"
	        });
	        if (token) { State.githubToken = token; App.saveSettings(); } 
	        else return;
	    }
	
	    const result = await UI.showDialog({
	        title: 'Initialize GitHub Repository',
	        hasTextarea: true,
	        textareaContent: "",
	        contentHTML: `<p>Create a new repository from <strong>'${folderItem.name}'</strong>.</p>
	                      <label>New Repository Name</label>
	                      <input type="text" id="repo-name" value="${folderItem.name.replace(/[^a-zA-Z0-9-.]/g, '-').toLowerCase()}">
	                      <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
	                          <input type="checkbox" id="repo-private" style="width: auto;" checked>
	                          <label for="repo-private">Private repository</label>
	                      </div>
	                      <label style="margin-top:10px; display:block;">Description (Ctrl+Enter to Finish)</label>`,
	        okText: 'Create & Push'
	    });
	    
	    if (result === null) return;
	
	    const repoName = document.getElementById('repo-name').value.trim();
	    const rawDescription = typeof result === 'string' ? result : "";
	    const cleanDescription = rawDescription.replace(/[\r\n\x00-\x1F\x7F]/g, " ").trim();
	    const isPrivate = document.getElementById('repo-private').checked;
	
	    if (!repoName) return UI.showToast("Repository name is required.", "error");
	
	    const taskId = `git-init-${Date.now()}`;
	    UI.startTask(taskId, `Creating '${repoName}' on GitHub...`);
	
	    try {
	        const newRepoData = await FileSystemProvider.GitHub.api('/user/repos', {
	            method: 'POST',
	            body: JSON.stringify({ name: repoName, description: cleanDescription, private: isPrivate })
	        });
	
	        const repoInfo = { owner: newRepoData.owner.login, repo: newRepoData.name };
	        const branch = newRepoData.default_branch || 'main';
	
	        UI.updateTask(taskId, 30, "Gathering local sparks...");
	        const allFiles = await FileSystemProvider.listAllFiles(folderItem);
	        const creations = [];
	        const basePath = folderItem.path === '/' ? '' : folderItem.path;
	        
	        for (const file of allFiles) {
	            if (file.path.includes('.awtsmoos-repo')) continue;
	            const relativePath = file.path.startsWith(basePath + '/') ? file.path.substring(basePath.length + 1) : file.path;
	            
	            const content = await FileSystemProvider.read({ ...folderItem, path: file.path });
	            const textContent = (content instanceof Blob) ? await content.text() : (content || '');
	            creations.push({ path: relativePath, content: textContent });
	        }
	
	        if (creations.length === 0) {
	            creations.push({ path: '.gitkeep', content: 'B"H' });
	        }
	
	        UI.updateTask(taskId, 60, "Performing Genesis Commit...");
	        const initialCommitSHA = await CommitAPI.executeGenesisCommit(repoInfo, branch, creations, 'B"H: Initial Manifestation');
	
	        const newTreeData = await FileSystemProvider.GitHub.getFullTree({ repoInfo, branch });
	        const gitInfo = { isClone: true, repoInfo, branch, baseCommitSHA: initialCommitSHA, remoteTree: newTreeData.tree };
	        
	        await FileSystemProvider.create(folderItem, '.awtsmoos-repo', 'directory');
	        await FileSystemProvider.write({ ...folderItem, path: `${folderItem.path}/.awtsmoos-repo/ikar.js` }, `// B"H\nconst ikar = ${JSON.stringify(gitInfo, null, 4)};`);
	        
	        UI.endTask(taskId, 'success', `'${repoName}' manifested!`);
	        const { Workspaces } = await import('../workspaces.js');
	        await Workspaces.refreshNode(folderItem);
	
	    } catch (e) {
	        let message = e.message;
	        if (message.includes('422')) {
	            message = `Repo creation failed. The name '${repoName}' might already exist on your GitHub account. (HTTP 422)`;
	        }
	        UI.endTask(taskId, 'error', `Init failed: ${message}`);
	        console.error("[Git Init] Error:", e);
	    }
	}
};
