
// B"H
// FILE: js/git/init.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { CommitAPI } from './commit/api.js';
import { GitCommit } from './commit/core.js';

/**
 * @class GitInit
 * @description The moment of Genesis. This class brings a new repository 
 * into existence. It is designed with absolute resilience, handling both 
 * empty voids and directories full of existing light. It manifests 
 * the files into the repository in controlled chunks to ensure stability.
 */
export const GitInit = {
	async initializeRepository(folderItem) {
	    const repoName = await UI.showDialog({
	        title: 'Initialize Repository',
	        hasInput: true,
	        inputValue: folderItem.name.toLowerCase().replace(/\s+/g, '-'),
	        okText: 'Create'
	    });
	    if (!repoName) return;

	    const taskId = `git-init-${Date.now()}`;
	    UI.startTask(taskId, `Establishing ${repoName}...`);

	    try {
	        // 1. Create the remote world on GitHub
	        const repoData = await FileSystemProvider.GitHub.api('/user/repos', {
	            method: 'POST',
	            body: JSON.stringify({ name: repoName, private: true })
	        });

	        const repoInfo = { owner: repoData.owner.login, repo: repoData.name };
	        const branch = 'main';

	        // 2. Discover existing content
	        const allFiles = await FileSystemProvider.listAllFiles(folderItem);
	        
	        UI.updateTask(taskId, 30, "Genesis sequence starting...");

	        // 3. Genesis Commit (Initial File to establish branch)
	        const genesisFile = { path: 'README.md', content: `# ${repoName}\nB"H` };
	        const genesisSHA = await CommitAPI.executeGenesisCommit(repoInfo, branch, [genesisFile], 'B"H: Genesis');

	        // 4. Manifest existing local files into the repo in chunks
	        if (allFiles.length > 0) {
                const creations = [];
                for (const file of allFiles) {
                    if (file.path.includes('.awtsmoos-repo')) continue;
                    const raw = await FileSystemProvider.read(file);
                    const content = (raw instanceof Blob) ? await raw.text() : String(raw);
                    // Relativize path
                    const rootPath = folderItem.path === '/' ? '' : folderItem.path;
                    const relPath = file.path.startsWith(rootPath) ? file.path.substring(rootPath.length + 1) : file.path;
                    creations.push({ path: relPath, content });
                }

                if (creations.length > 0) {
                    await GitCommit.performCommit(
                        { ...folderItem, type: 'github' }, 
                        { repoInfo, branch, remoteTree: [] }, 
                        { creations }, 
                        'B"H: Initial Manifestation'
                    );
                }
	        }

	        // 5. Finalize the local anchor (.awtsmoos-repo)
            const tree = await FileSystemProvider.GitHub.getFullTree({ repoInfo, branch });
	        const ikar = { isClone: true, repoInfo, branch, baseCommitSHA: tree.sha, remoteTree: tree.tree };
	        
	        await FileSystemProvider.create(folderItem, '.awtsmoos-repo', 'directory');
	        await FileSystemProvider.write({ ...folderItem, path: `${folderItem.path}/.awtsmoos-repo/ikar.js` }, `// B"H\nconst ikar = ${JSON.stringify(ikar, null, 4)};`);
	        
	        UI.endTask(taskId, 'success', 'Repository Stabilized.');
	        import('../workspaces/index.js').then(m => m.Workspaces.refreshNode(folderItem));
            
	    } catch (e) {
	        UI.endTask(taskId, 'error', e.message);
	    }
	}
};
