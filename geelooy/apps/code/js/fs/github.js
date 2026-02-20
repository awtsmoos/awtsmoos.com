// B"H
// FILE: js/fs/github.js
import { State } from '../state.js';
import { MimeUtil } from '../mime-util.js';
import { UI } from '../ui.js';
import { IndexedDBProvider } from './indexeddb.js'; // B"H

export const GitHubProvider = {
    // B"H
api: async (endpoint, options = {}) => {
    const method = options.method || 'GET';
    const headers = {
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers
    };

    if (State.githubToken) {
        headers['Authorization'] = `Bearer ${State.githubToken}`;
    } else if (method !== 'GET') {
        throw new Error("A GitHub token is required for this action.");
    }

    let fetchEndpoint = endpoint;
    if (method === 'GET') {
        const cacheBuster = `_cb=${Date.now()}`;
        fetchEndpoint += (fetchEndpoint.includes('?') ? '&' : '?') + cacheBuster;
    }

    const response = await fetch(`https://api.github.com${fetchEndpoint}`, { ...options, headers });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: response.statusText };
        }

        // B"H - ACCURATE ERROR PARSING
        let errorMessage = errorData.message || `API Error ${response.status}`;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
            const details = errorData.errors.map(err => {
                const fieldPrefix = err.field ? `${err.field}: ` : '';
                return `${fieldPrefix}${err.message || err.code}`;
            }).join('; ');
            errorMessage += ` (${details})`;
        }

        if (response.status === 401) throw new Error("Invalid GitHub token.");
        if (response.status === 422) throw new Error(errorMessage);
        
        throw new Error(errorMessage);
    }

    return response.status === 204 ? null : response.json();
},
    
    utf8_to_b64: str => btoa(unescape(encodeURIComponent(str))),
    b64_to_utf8: str => decodeURIComponent(escape(atob(str))),
    
    async list({ repoInfo, branch, path }) {
        const contents = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path === '/' ? '' : path}?ref=${branch}`);
        return contents.map(c => ({ 
            name: c.name, kind: c.type === 'dir' ? 'directory' : 'file', path: c.path, sha: c.sha
        }));
    },

    async listAllFiles(item) {
        // Use recursive tree fetch to emulate listing all files
        const fullTree = await this.getFullTree(item);
        if (!fullTree || !fullTree.tree) return [];
        
        // B"H - Scoped Search Logic
        // Remove leading slash for matching against GitHub paths
        const rootPath = item.path.startsWith('/') ? item.path.slice(1) : item.path;
        
        return fullTree.tree
            .filter(node => node.type === 'blob')
            .filter(node => {
                // If searching from root, include everything.
                if (rootPath === '' || item.path === '/') return true;
                // Otherwise, only include files that start with the folder path
                return node.path.startsWith(rootPath + '/');
            })
            .map(node => ({
                name: node.path.split('/').pop(),
                kind: 'file',
                path: node.path,
                sha: node.sha,
                workspaceId: item.workspaceId,
                repoInfo: item.repoInfo,
                branch: item.branch
            }));
    },

    async read(item) {
        // B"H - Overlay Logic: Check local staging first!
        const uniquePath = `${item.workspaceId}::${item.path}`;
        try {
            const stagedContent = await IndexedDBProvider.readUncommitted(uniquePath);
            // If staged content exists, use it.
            if (stagedContent === null) throw new Error("File deleted locally.");
            return stagedContent;
        } catch (e) {
            if (e.message === "File deleted locally.") throw new Error("File not found (Deleted in staging)");
            // If not found in staging, proceed to remote fetch
        }

        let repoInfo = item.repoInfo;
        const { name, branch } = item;

        if (!repoInfo) {
            const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
            if (workspace && workspace.repoInfo) {
                repoInfo = workspace.repoInfo;
            }
        }

        if (!repoInfo) {
            throw new Error(`Could not determine repository information for this read operation.`);
        }

        // B"H - FRESHNESS CHECK
        // To ensure we get the latest content (even if tree cache is stale), we fetch file metadata via 'contents'.
        // This gives us the current SHA and content (if small enough).
        // Using 'contents' API ensures we see changes made on GitHub.com immediately.
        
        let blobContent = null;
        let blobEncoding = null;
        
        try {
            // Path must not start with slash for API
            const apiPath = item.path.startsWith('/') ? item.path.substring(1) : item.path;
            const refBranch = branch || item.branch || 'main'; // Fallback
            
            const meta = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${apiPath}?ref=${refBranch}`);
            
            if (meta.content) {
                // Content provided directly (small files)
                blobContent = meta.content;
                blobEncoding = meta.encoding;
            } else if (meta.sha) {
                // Content too large/not provided, use SHA to fetch blob
                // This updates the SHA to the LATEST one.
                const blob = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs/${meta.sha}`);
                blobContent = blob.content;
                blobEncoding = blob.encoding;
            }
        } catch(e) {
            // Fallback to item.sha if API fails (e.g. rate limit on contents vs blobs?) or file missing
            console.warn("Freshness check failed, falling back to cached SHA", e);
            if (!item.sha) throw e;
            const blob = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs/${item.sha}`);
            blobContent = blob.content;
            blobEncoding = blob.encoding;
        }

        if (blobEncoding !== 'base64') throw new Error("Unsupported encoding from GitHub");
        
        const fileInfo = MimeUtil.getInfo(name);
        if (fileInfo.type === 'text') {
            // Strip newlines from base64 if present (GitHub API sends them)
            const cleanBase64 = blobContent.replace(/\n/g, '');
            return this.b64_to_utf8(cleanBase64);
        } else {
            return { isBinary: true, base64Content: blobContent, mime: fileInfo.mime };
        }
    },

    async write(item, content, commitMessage) {
        // B"H - Overlay Logic: Write to Local Staging (IDB) ONLY.
        const uniquePath = `${item.workspaceId}::${item.path}`;
        await IndexedDBProvider.writeUncommitted(uniquePath, content, item);
    },

    async create({ repoInfo, branch, path, workspaceId }, name, kind) {
        // B"H - Overlay Logic: Create in Staging
        const newPath = path === '/' ? name : `${path}/${name}`;
        
        if (kind === 'file') {
            const item = { 
                workspaceId, 
                path: newPath, 
                name, 
                kind, 
                repoInfo, 
                branch 
            };
            const uniquePath = `${workspaceId}::${newPath}`;
            await IndexedDBProvider.writeUncommitted(uniquePath, "", item);
        } else {
            const gitKeepPath = `${newPath}/.gitkeep`;
            const item = {
                workspaceId,
                path: gitKeepPath,
                name: '.gitkeep',
                kind: 'file',
                repoInfo,
                branch
            };
            const uniquePath = `${workspaceId}::${gitKeepPath}`;
            await IndexedDBProvider.writeUncommitted(uniquePath, "", item);
        }
        UI.showToast(`Item '${name}' staged for creation. Use Git Actions to commit.`, "info");
    },

    async _deletePathRecursively(repoInfo, branch, path) {
        const contents = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
        for (const item of contents) {
            if (item.type === 'file') {
                await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${item.path}`, {
                    method: 'DELETE',
                    body: JSON.stringify({ 
                        message: `B"H - Delete '${item.name}'`, 
                        sha: item.sha,
                        branch 
                    })
                });
            } else if (item.type === 'dir') {
                await this._deletePathRecursively(repoInfo, branch, item.path);
            }
        }
    },

    async delete(item) {
        // B"H - Overlay Logic: Mark as Deleted in Staging
        const uniquePath = `${item.workspaceId}::${item.path}`;
        await IndexedDBProvider.writeUncommitted(uniquePath, null, item);
        UI.showToast(`Item '${item.name}' staged for deletion.`, "info");
    },

    // B"H
	async getLatestCommitSHA({ repoInfo, branch }) {
	    try {
	        const ref = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${branch}`);
	        return ref.object.sha;
	    } catch (e) {
	        // B"H - 409 Conflict or 404 Not Found usually means the repo is empty (Genesis state)
	        if (e.message.includes('409') || e.message.includes('404') || e.message.toLowerCase().includes('empty')) {
	            console.log(`[GitHub] Repo ${repoInfo.repo} appears to be empty. Proceeding with Genesis commit.`);
	            return null;
	        }
	        throw e;
	    }
	},

    // B"H
    //to build a proper directory map
	async getFullTree(item) {
	    const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId || item.id));
	    const repoInfo = item.repoInfo || workspace?.repoInfo;
	    const branch = item.branch || workspace?.branch || 'main';
	
	    if (!repoInfo) throw new Error("Missing repository info for tree fetch.");
	
	    const latestCommitSHA = await this.getLatestCommitSHA({ repoInfo, branch });
	    if (!latestCommitSHA) return { sha: null, tree: [] };
	
	    const treeData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${latestCommitSHA}?recursive=1`);
	    
	    // B"H - THE FIX: Convert flat list to a Folder Map
	    const treeMap = new Map();
	    treeMap.set('', []); // Root
	
	    treeData.tree.forEach(node => {
	        const parts = node.path.split('/');
	        const fileName = parts.pop();
	        const parentPath = parts.join('/');
	
	        if (!treeMap.has(parentPath)) treeMap.set(parentPath, []);
	        
	        treeMap.get(parentPath).push({
	            name: fileName,
	            kind: node.type === 'tree' ? 'directory' : 'file',
	            path: node.path,
	            sha: node.sha,
	            size: node.size
	        });
	    });
	
	    if (workspace) {
	        workspace._treeCache = treeMap;
	        workspace.baseCommitSHA = latestCommitSHA;
	    }
	
	    return {
	        sha: latestCommitSHA,
	        tree: treeData.tree,
	        map: treeMap
	    };
	},

    async commitMultipleFiles({ repoInfo, branch, commitMessage, changeSet }) {
        return null; 
    }
};