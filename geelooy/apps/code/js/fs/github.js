// B"H
// FILE: js/fs/github.js
import { State } from '../state.js';
import { MimeUtil } from '../mime-util.js';
import { UI } from '../ui.js';

export const GitHubProvider = {
    api: async (endpoint, options = {}) => {
        const method = options.method || 'GET';
        const headers = {
         'Accept': 'application/vnd.github+json', 
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
        
        if (response.status === 422) {
            throw new Error("Sorry, your input was too large to process. Consider creating the blob in a local clone of the repository and then pushing it to GitHub.");
        }
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            if (response.status === 401) throw new Error("Bad credentials. Your GitHub token may be invalid or expired.");
            throw new Error(err.message || `GitHub API Error: ${response.status}`);
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
        
        return fullTree.tree
            .filter(node => node.type === 'blob')
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
        let repoInfo = item.repoInfo;
        const { sha, name } = item;

        if (!repoInfo) {
            const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
            if (workspace && workspace.repoInfo) {
                repoInfo = workspace.repoInfo;
            }
        }

        if (!repoInfo) {
            throw new Error(`Could not determine repository information for this read operation.`);
        }

        if (!sha) {
            throw new Error(`Cannot read file "${name}": its SHA identifier is missing.`);
        }

        const blob = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs/${sha}`);
        
        if (blob.encoding !== 'base64') throw new Error("Unsupported encoding from GitHub");
        const fileInfo = MimeUtil.getInfo(name);
        if (fileInfo.type === 'text') {
            return this.b64_to_utf8(blob.content);
        } else {
            return { isBinary: true, base64Content: blob.content, mime: fileInfo.mime };
        }
    },

    async write(item, content, commitMessage) {
        const { repoInfo, branch, path, name } = item;
        let existingSha;
        try {
            const fileData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
            existingSha = fileData.sha;
        } catch (e) { /* File doesn't exist, which is fine */ }

        const result = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify({
                message: commitMessage || `B"H\nupdated ${name}!`,
                content: this.utf8_to_b64(content),
                sha: existingSha,
                branch
            })
        });
        item.sha = result.content.sha;

        const workspace = State.workspaces.find(ws => ws.repoInfo?.repo === repoInfo.repo && ws.repoInfo?.owner === repoInfo.owner);
        if (workspace) workspace._treeCache = null;
    },

    async create({ repoInfo, branch, path }, name, kind) {
        const newPath = (path === '/' ? name : `${path}/${name}`) + (kind === 'directory' ? '/.gitkeep' : '');
        const message = `B"H\ncreate ${kind} '${name}'`;
        await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${newPath}`, {
            method: 'PUT',
            body: JSON.stringify({
                message,
                content: kind === 'directory' ? '' : this.utf8_to_b64(''),
                branch
            })
        });

        const workspace = State.workspaces.find(ws => ws.repoInfo?.repo === repoInfo.repo && ws.repoInfo?.owner === repoInfo.owner);
        if (workspace) workspace._treeCache = null;
    },

    async _deletePathRecursively(repoInfo, branch, path) {
        const contents = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
        for (const item of contents) {
            UI.showLoading(`Deleting: ${item.path}`);
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
        const { repoInfo, branch, path, name } = item;
        if (item.kind === 'file') {
            const message = `B"H - Delete '${name}'`;
            const fileData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${branch}`);
            await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    message,
                    sha: fileData.sha,
                    branch
                })
            });
        } else if (item.kind === 'directory') {
            await this._deletePathRecursively(repoInfo, branch, path);
        } else {
            throw new Error(`Unsupported item type for deletion: ${item.kind}`);
        }

        const workspace = State.workspaces.find(ws => ws.repoInfo?.repo === repoInfo.repo && ws.repoInfo?.owner === repoInfo.owner);
        if (workspace) workspace._treeCache = null;
    },

    async getLatestCommitSHA({ repoInfo, branch }) {
        try {
            const ref = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${branch}`);
            return ref.object.sha;
        } catch (e) {
            if (e.message.toLowerCase().includes('not found') || e.message.toLowerCase().includes('empty')) {
                return null;
            }
            throw e;
        }
    },

    async getFullTree({ repoInfo, branch }) {
        const latestCommitSHA = await this.getLatestCommitSHA({ repoInfo, branch });

        if (latestCommitSHA === null) {
            return { sha: null, tree: [] };
        }

        const treeData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${latestCommitSHA}?recursive=1`);
        
        return {
            sha: latestCommitSHA,
            tree: treeData.tree 
        };
    },

    async commitMultipleFiles({ repoInfo, branch, commitMessage, changeSet }) {
        const latestCommitSHA = await this.getLatestCommitSHA({ repoInfo, branch });
        const latestCommit = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${latestCommitSHA}`);
        const baseTreeSHA = latestCommit.tree.sha;
        const filesToUpload = [...(changeSet.creations || []), ...(changeSet.updates || [])];
        const blobCreationPromises = filesToUpload.map(file => 
            this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs`, {
                method: 'POST', body: JSON.stringify({ content: this.utf8_to_b64(file.content), encoding: 'base64' })
            }).then(blob => ({ path: file.path, sha: blob.sha }))
        );
        const createdBlobs = await Promise.all(blobCreationPromises);
        const tree = [];
        createdBlobs.forEach(blob => tree.push({ path: blob.path, mode: '100644', type: 'blob', sha: blob.sha }));
        (changeSet.deletions || []).forEach(file => tree.push({ path: file.path, mode: '100644', type: 'blob', sha: null }));
        const newTree = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
            method: 'POST', body: JSON.stringify({ base_tree: baseTreeSHA, tree: tree })
        });
        const newCommit = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
            method: 'POST', body: JSON.stringify({ message: commitMessage, tree: newTree.sha, parents: [latestCommitSHA] })
        });
        await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${branch}`, {
            method: 'PATCH', body: JSON.stringify({ sha: newCommit.sha })
        });
        return newCommit.sha;
    }
};
