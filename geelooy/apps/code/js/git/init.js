
// B"H
// FILE: js/git/init.js
import { State } from '../state.js';
import { UI } from '../ui.js';
import { App } from '../app.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';
import { CommitAPI } from './commit/api.js';
import { GitCommit } from './commit/core.js';

export const GitInit = {
	async initializeRepository(folderItem) {
	    if (!State.githubToken) {
	        const token = await UI.showDialog({ title: "GitHub Token Required", hasInput: true, inputType: 'password', okText: "Save" });
	        if (token) { State.githubToken = token; App.saveSettings(); } else return;
	    }
        
        const defaultRepoName = folderItem.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();

	    const result = await UI.showDialog({
	        title: 'Initialize GitHub Repository', 
	        contentHTML: `
                <p style="margin-bottom:10px;">Creating repository from <strong>'${folderItem.name}'</strong>.</p>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <label style="font-size:0.8em; opacity:0.7;">Repository Name:</label>
                        <input type="text" id="repo-name" value="${defaultRepoName}" style="margin-top:5px;">
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" id="repo-private" checked style="width:auto;">
                        <label for="repo-private" style="user-select:none;">Private Repository</label>
                    </div>
                </div>`,
	        okText: 'Create & Push',
            cancelText: 'Cancel'
	    });
	    if (!result) return;

	    const repoName = document.getElementById('repo-name').value.trim();
        const isPrivate = document.getElementById('repo-private').checked;

	    const taskId = `git-init-${Date.now()}`;
	    UI.startTask(taskId, `Creating '${repoName}'...`);

	    try {
	        const repoData = await FileSystemProvider.GitHub.api('/user/repos', { 
                method: 'POST', 
                body: JSON.stringify({ 
                    name: repoName, 
                    private: isPrivate 
                }) 
            });
            
	        const repoInfo = { owner: repoData.owner.login, repo: repoData.name };
	        const branch = repoData.default_branch || 'main';

	        const allFiles = await FileSystemProvider.listAllFiles(folderItem);
	        const creations = [];
	        const basePath = folderItem.path === '/' ? '' : folderItem.path;
	        for (const file of allFiles) {
	            if (file.path.includes('.awtsmoos-repo')) continue;
	            const rel = file.path.startsWith(basePath + '/') ? file.path.substring(basePath.length + 1) : file.path;
	            const raw = await FileSystemProvider.read({ ...folderItem, path: file.path });
	            creations.push({ path: rel, content: (raw instanceof Blob ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : raw)) });
	        }

	        UI.updateTask(taskId, 50, "Genesis sequence...");
	        const genesisFile = creations.shift() || { path: 'README.md', content: 'B"H\nInitialized.' };
            
            // Correctly calling executeGenesisCommit
	        await CommitAPI.executeGenesisCommit(repoInfo, branch, [genesisFile], 'B"H: Genesis');
            
            UI.updateTask(taskId, 75, "Pushing files...");
            await new Promise(r => setTimeout(r, 2000)); 

	        await GitCommit.performCommit({ ...folderItem, type: 'github' }, { repoInfo, branch, remoteTree: [] }, { creations }, 'B"H: Full Manifestation');

	        const tree = await FileSystemProvider.GitHub.getFullTree({ repoInfo, branch });
	        const ikar = { isClone: true, repoInfo, branch, baseCommitSHA: tree.sha, remoteTree: tree.tree };
	        await FileSystemProvider.create(folderItem, '.awtsmoos-repo', 'directory');
	        await FileSystemProvider.write({ ...folderItem, path: `${folderItem.path}/.awtsmoos-repo/ikar.js` }, `// B"H\nconst ikar = ${JSON.stringify(ikar, null, 4)};`);
	        
	        UI.endTask(taskId, 'success', 'Manifested!');
	        await Workspaces.refreshNode(folderItem);
	    } catch (e) {
	        UI.endTask(taskId, 'error', e.message);
	    }
	}
};
