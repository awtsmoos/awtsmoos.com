// B"H
// FILE: js/fs/github.js
import { State } from '../state.js';
import { MimeUtil } from '../mime-util.js';
import { UI } from '../ui.js';
import { IndexedDBProvider } from './indexeddb.js';

export const GitHubProvider = {
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

            // B"H - Securely include status code for logic checks
            let errorMessage = errorData.message 
                ? `${errorData.message} (HTTP ${response.status})` 
                : `API Error ${response.status}`;
            
            if (response.status === 401) throw new Error("Invalid GitHub token.");
            throw new Error(errorMessage);
        }

        return response.status === 204 ? null : response.json();
    },
    
    utf8_to_b64: str => btoa(unescape(encodeURIComponent(str))),
    b64_to_utf8: str => decodeURIComponent(escape(atob(str))),
    
    async list({ repoInfo, branch, path }) {
        try {
            const contents = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path === '/' ? '' : path}?ref=${branch}`);
            return contents.map(c => ({ 
                name: c.name, kind: c.type === 'dir' ? 'directory' : 'file', path: c.path, sha: c.sha
            }));
        } catch (e) {
            if (e.message.includes('404') || e.message.includes('409') || e.message.includes('empty')) return [];
            throw e;
        }
    },

    async getLatestCommitSHA({ repoInfo, branch }) {
        try {
            const ref = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${branch}`);
            return ref.object.sha;
        } catch (e) {
            // B"H - Correctly identifies genesis state
            if (e.message.includes('404') || e.message.includes('409') || e.message.includes('empty')) {
                console.log(`[GitHub] ${repoInfo.repo} is in Genesis state.`);
                return null;
            }
            throw e;
        }
    },

    async getFullTree(item) {
        const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId || item.id));
        const repoInfo = item.repoInfo || workspace?.repoInfo;
        const branch = item.branch || workspace?.branch || 'main';

        const latestCommitSHA = await this.getLatestCommitSHA({ repoInfo, branch });

        if (!latestCommitSHA) {
            const emptyMap = new Map();
            emptyMap.set('', []);
            if (workspace) workspace._treeCache = emptyMap;
            return { sha: null, tree: [], map: emptyMap };
        }

        try {
            const treeData = await this.api(`/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${latestCommitSHA}?recursive=1`);
            const treeMap = new Map();
            treeMap.set('', []);

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
            return { sha: latestCommitSHA, tree: treeData.tree, map: treeMap };
        } catch (e) {
            return { sha: null, tree: [], map: new Map([['', []]]) };
        }
    }
};