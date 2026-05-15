
// B"H
// FILE: js/features/workspace-addition.js

import { UI } from '../ui.js';
import { State } from '../state.js';
import { App } from '../app.js';
import { Workspaces } from '../workspaces/index.js';
import { FileSystemProvider } from '../fs-provider.js';

export const WorkspaceAddition = {
    showDialog() {
        const contentHTML = /*html*/ `
            <div id="workspace-options" class="workspace-options-grid">
                <button class="menu-button" data-action="local">
                    <svg class="svg-icon"><use href="#icon-laptop"></use></svg>
                    <span>Local Folder</span>
                </button>
                <button class="menu-button" data-action="github">
                    <svg class="svg-icon"><use href="#icon-github"></use></svg>
                    <span>GitHub Repo</span>
                </button>
                <button class="menu-button" data-action="opfs">
                    <svg class="svg-icon"><use href="#icon-save"></use></svg>
                    <span>Browser Storage (OPFS)</span>
                </button>
                <button class="menu-button" data-action="idb">
                    <svg class="svg-icon"><use href="#icon-brain"></use></svg>
                    <span>Browser Storage (IDB)</span>
                </button>
                <button class="menu-button" data-action="relay" style="grid-column: 1 / -1; background: rgba(0, 246, 255, 0.05); border-color: var(--neon-cyan);">
                    <svg class="svg-icon" style="color: var(--neon-cyan);"><use href="#icon-link"></use></svg>
                    <span style="color: var(--neon-cyan);">Relay Server Connection</span>
                </button>
                <button class="menu-button" data-action="awtsmoos-os" style="grid-column: 1 / -1; background: rgba(255, 160, 0, 0.07); border-color: #ffa000;">
                    <svg class="svg-icon" style="color: #ffa000;"><use href="#icon-brain-circuit"></use></svg>
                    <span style="color: #ffa000;">Awtsmoos OS</span>
                </button>
                <button class="menu-button" data-action="ssh" style="grid-column: 1 / -1; background: rgba(168, 255, 0, 0.05); border-color: var(--neon-lime);">
                    <svg class="svg-icon" style="color: var(--neon-lime);"><use href="#icon-ssh"></use></svg>
                    <span style="color: var(--neon-lime);">SSH Workspace</span>
                </button>
            </div>
            <style>
                .workspace-options-grid { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
                .workspace-options-grid .menu-button { 
                    justify-content: center; flex-direction: column; 
                    height: 100px; gap: 12px; font-weight: 600;
                    border: 1px solid var(--color-border);
                    background: var(--color-bg-secondary);
                }
                .workspace-options-grid .menu-button:hover {
                    border-color: var(--neon-cyan);
                    color: var(--neon-cyan);
                    background: var(--color-bg-tertiary);
                }
                .workspace-options-grid .svg-icon { width: 2.5em; height: 2.5em; margin-bottom: 5px; }
            </style>`;

        // Show dialog but handle events manually due to custom buttons
        UI.showDialog({
            title: 'Add New Workspace',
            contentHTML,
            okText: '', // Hide OK button
            cancelText: 'Cancel'
        });

        // Attach listener to the container (delegation)
        setTimeout(() => {
            const optionsContainer = document.getElementById('workspace-options');
            if (optionsContainer) {
                optionsContainer.onclick = (e) => {
                    const btn = e.target.closest('button');
                    if(!btn) return;
                    const action = btn.dataset.action;
                    
                    const closeBtn = document.getElementById('dialog-cancel-btn');
                    if(closeBtn) closeBtn.click();
                    
                    if (action === 'local') this.addLocal();
                    else if (action === 'github') this.addGithub();
                    else if (action === 'idb') this.addIdb();
                    else if (action === 'opfs') this.addOpfs();
                    else if (action === 'relay') this.addRelay();
                    else if (action === 'awtsmoos-os') this.addAwtsmoosOs();
                    else if (action === 'ssh') this.addSsh();
                };
            }
        }, 50);
    },

    async addSsh() {
        const { SSHWorkspace } = await import('./ssh-workspace.js');
        return SSHWorkspace.add();
    },

    async addAwtsmoosOs() {
        const { InlineLogin } = await import('../session/inline-login.js');
        const login = await InlineLogin.ensure();
        if (!login.ok) return;

        const existing = State.workspaces.find(w => w.type === 'awtsmoos-os');
        if (existing) {
            UI.showToast('Awtsmoos OS workspace is already mounted.', 'info');
            return existing;
        }

        const wsId = State.nextWorkspaceId++;
        Workspaces.add({
            id: wsId,
            name: 'Awtsmoos OS',
            type: 'awtsmoos-os',
            path: '.',
            realmid: login.identity?.id || login.identity?._id || null
        }, true);

        UI.showToast('Awtsmoos OS workspace added. Each alias now appears as an editable folder.', 'success');
    },

    /**
     * B"H
     * Initiates the connection to a distant Relay server.
     * It ensures the user understands the exact API specifications required
     * to become a chariot for the Awtsmoos editor, including the absolute 
     * necessity of CORS headers to bridge the cross-origin void.
     */
    async addRelay() {
        if (!State.relayUrl) {
            const configHtml = `
                <div style="color: white; font-family: var(--font-ui); text-align: left;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 15px;">
                        <p style="margin: 0; line-height: 1.5; font-size: 0.9em; max-width: 65%;">
                            To connect to a physical machine across the Void, the Awtsmoos Editor requires a Relay Server running locally on that machine. 
                        </p>
                        <button id="dl-relay-server-btn" class="primary-btn" style="padding: 6px 12px; font-size: 0.85em; background: var(--neon-lime); box-shadow: 0 0 10px rgba(168, 255, 0, 0.4); border:none; border-radius:4px; color:black; font-weight:bold;">
                            ⬇️ Download Server Script
                        </button>
                    </div>

                    <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; border: 1px solid var(--neon-cyan); margin-bottom: 20px; font-family: var(--font-code); font-size: 0.85em; overflow-y:auto; max-height: 250px;">
                        <div style="margin-bottom:12px; color: var(--neon-lime); font-weight: bold; border-bottom: 1px dashed var(--neon-lime); padding-bottom: 8px;">
                            Usage: <code style="color:white;">node relay-server.js</code>
                        </div>
                        <div style="margin-bottom:12px; color: var(--color-accent-danger); font-weight: bold; border-bottom: 1px dashed var(--color-accent-danger); padding-bottom: 8px;">
                            ⚠️ CRITICAL: The server MUST return CORS headers:<br>
                            <code>Access-Control-Allow-Origin: *</code><br>
                            <code>Access-Control-Allow-Methods: POST, OPTIONS</code>
                        </div>
                        <div style="margin-bottom:8px;"><strong style="color:var(--neon-cyan);">action=list</strong> & filepath=/path<br><span style="opacity:0.6;">↳ Returns JSON array: ["file.txt", "folder"]</span></div>
                        <div style="margin-bottom:8px;"><strong style="color:var(--neon-cyan);">action=read</strong> & filepath=/path<br><span style="opacity:0.6;">↳ Returns raw file content</span></div>
                        <div style="margin-bottom:8px;"><strong style="color:var(--neon-cyan);">action=write</strong> & filepath=/path & content=...<br><span style="opacity:0.6;">↳ Writes the file</span></div>
                        <div style="margin-bottom:8px;"><strong style="color:var(--neon-cyan);">action=mkdir</strong> & filepath=/path<br><span style="opacity:0.6;">↳ Creates a folder</span></div>
                        <div style="margin-bottom:8px;"><strong style="color:var(--neon-cyan);">action=delete</strong> & filepath=/path<br><span style="opacity:0.6;">↳ Deletes the file or folder</span></div>
                        <div><strong style="color:var(--neon-cyan);">action=download-md</strong> & filepath=/path & [files=["1.js"]]<br><span style="opacity:0.6;">↳ Returns concatenated markdown blocks for AI context</span></div>
                    </div>
                </div>
            `;
            
            const DEFAULT_RELAY_URL = "http://localhost:3000";
            const enteredUrl = await UI.showDialog({
                title: "Configure Relay Manifestation",
                contentHTML: configHtml,
                hasInput: true,
                placeholder: DEFAULT_RELAY_URL,
                okText: "Establish Connection",
                cancelText: "Cancel"
            });
            
            if (enteredUrl === null) {
                UI.showToast("B\"H - Relay connection cancelled.", 'info');
                return; // Action abandoned
            }

            const resolvedUrl = String(enteredUrl || '').trim() || DEFAULT_RELAY_URL;
            if (!new RegExp('^https?://', 'i').test(resolvedUrl)) {
                UI.showToast("Relay URL must start with http:// or https://", 'error', 8000);
                return;
            }

            State.relayUrl = resolvedUrl.replace(/\/+$/, '');
            import('../app.js').then(m => m.App.saveSettings());
            UI.showToast(`B"H - Trying Relay Server at ${State.relayUrl}`, 'info', 4000);
        }
        
        // Once the coordinates are secured, open the ethereal browser
        const { RelayBrowser } = await import('./relay-browser/index.js');
        const selectedPath = await RelayBrowser.selectRoot(State.relayUrl);
        
        if (selectedPath) {
            const wsName = selectedPath === '/' ? 'Relay Root' : selectedPath.split('/').filter(Boolean).pop();
            const wsId = State.nextWorkspaceId++;
            
            import('../workspaces/index.js').then(m => {
                m.Workspaces.add({
                    id: wsId,
                    name: `Relay: ${wsName}`,
                    type: 'relay',
                    basePath: selectedPath,
                    relayUrl: State.relayUrl
                }, true);
            });
            UI.showToast("B\"H - Relay World Anchored.", "success");
        } else {
            UI.showToast(`B"H - Relay workspace was not added. No directory was selected from ${State.relayUrl}.`, "warning", 8000);
        }
        
        // B"H - Bind the download button immediately after Dialog manifestation
        setTimeout(() => {
            const dlBtn = document.getElementById('dl-relay-server-btn');
            if (dlBtn) {
                dlBtn.onclick = async () => {
                    try {
                        const { RelayServerCode } = await import('./relay-server-code.js');
                        const blob = new Blob([RelayServerCode], { type: 'application/javascript' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'relay-server.js';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        UI.showToast('B"H - Downloaded relay-server.js! Run with: node relay-server.js', 'success', 5000);
                    } catch (err) {
                        UI.showToast('Failed to download the blueprint: ' + err.message, 'error');
                    }
                };
            }
        }, 50);
    },

    async addLocal() {
        try {
            if (!window.showDirectoryPicker) {
                throw new Error("Your browser does not support the File System Access API.");
            }
            const handle = await window.showDirectoryPicker();
            if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
                if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
                    throw new Error('Permission denied.');
                }
            }
            const wsId = State.nextWorkspaceId++;
            const wsData = { id: wsId, name: handle.name, type: 'local', handle };
            await FileSystemProvider.IndexedDB.saveHandle(wsId, handle);
            Workspaces.add(wsData, true);
            UI.showToast("Local folder added.", "success");
        } catch (e) {
            if (e.name !== 'AbortError') UI.showToast(`Error: ${e.message}`, 'error');
        }
    },

	async addGithub() {
	    if (!State.githubToken) {
	        const token = await UI.showDialog({
	            title: "GitHub Token Required",
	            message: "A Personal Access Token is required.",
	            hasInput: true, 
	            inputType: 'password', 
	            okText: "Save Token"
	        });
	        if (!token) return;
	        State.githubToken = token;
	        App.saveSettings();
	    }
	
	    let allRepos = []; // Cache for filtering
	
	    const contentHTML = /*html*/`
	        <div class="repo-search-container">
	            <p style="margin-bottom:10px; font-size:0.9em; opacity:0.8;">Search or select a repository to add as a workspace.</p>
	            <input type="text" id="repo-search-input" placeholder="Type to search your repos..." autocomplete="off">
	            <div id="repo-list-vessel" style="margin-top: 10px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; background: var(--color-bg-primary);">
	                <div id="repo-loading-status" style="padding:15px; text-align:center; color:var(--color-text-tertiary);">
	                    <span class="loading-text">Initializing...</span>
	                </div>
	                <div id="repo-list-items" style="max-height: 250px; overflow-y: auto; display:none;"></div>
	            </div>
	        </div>
	        <style>
	            .repo-item { 
	                padding: 10px 15px; cursor: pointer; border-bottom: 1px solid var(--color-border); 
	                display: flex; justify-content: space-between; transition: background 0.2s;
	            }
	            .repo-item:hover { background: var(--color-bg-tertiary); color: var(--neon-cyan); }
	            .repo-item.selected { background: var(--color-bg-accent-translucent); border-left: 3px solid var(--neon-cyan); }
	            .repo-meta { font-size: 0.8em; color: var(--color-text-tertiary); }
	        </style>`;
	
	    UI.showDialog({
	        title: "Add GitHub Repository",
	        contentHTML,
	        okText: "Next",
	        cancelText: "Cancel"
	    }).then(async (result) => {
	        if (!result) return;
	        const input = document.getElementById('repo-search-input');
	        const repoPath = input.dataset.selectedPath || input.value;
	        if (!repoPath) return;
	
	        const [owner, repo] = repoPath.split('/');
	        const branch = await UI.showDialog({
	            title: "Select Branch",
	            hasInput: true, placeholder: "main", inputValue: "main", okText: "Add Workspace"
	        });
	        if (!branch) return;
	
	        const wsId = State.nextWorkspaceId++;
	        Workspaces.add({
	            id: wsId,
	            name: `${owner}/${repo}`, // Display name only
	            type: 'github',
	            repoInfo: { owner, repo },
	            branch,
	            path: '/' // Internal logic uses /
	        }, true);
	    });
	
	    // --- Logic Loop ---
	    setTimeout(async () => {
	        const input = document.getElementById('repo-search-input');
	        const listVessel = document.getElementById('repo-list-items');
	        const status = document.getElementById('repo-loading-status');
	
	        const renderList = (filter = "") => {
	            const filtered = allRepos.filter(r => r.full_name.toLowerCase().includes(filter.toLowerCase()));
	            if (filtered.length === 0) {
	                listVessel.innerHTML = `<div style="padding:15px; color:gray; text-align:center;">No matches found.</div>`;
	            } else {
	                listVessel.innerHTML = filtered.map(r => `
	                    <div class="repo-item" data-full_name="${r.full_name}">
	                        <strong>${r.name}</strong>
	                        <span class="repo-meta">${r.private ? '🔒' : 'globe'}</span>
	                    </div>
	                `).join('');
	            }
	            status.style.display = 'none';
	            listVessel.style.display = 'block';
	        };
	
	        // Auto-load repos immediately
	        try {
	            status.innerHTML = "Fetching your repositories...";
	            const data = await FileSystemProvider.GitHub.api('/user/repos?sort=full_name&per_page=100');
	            allRepos = data.sort((a, b) => a.name.localeCompare(b.name));
	            renderList();
	        } catch (e) {
	            status.innerHTML = `<span style="color:var(--color-accent-danger)">Error: ${e.message}</span>`;
	        }
	
	        input.oninput = () => renderList(input.value);
	        listVessel.onclick = (e) => {
	            const item = e.target.closest('.repo-item');
	            if (item) {
	                input.value = item.dataset.full_name;
	                input.dataset.selectedPath = item.dataset.full_name;
	                listVessel.querySelectorAll('.repo-item').forEach(el => el.classList.remove('selected'));
	                item.classList.add('selected');
	            }
	        };
	    }, 50);
	},

    addIdb() {
        const wsId = State.nextWorkspaceId++;
        Workspaces.add({ id: wsId, name: 'Browser Storage (IDB)', type: 'indexeddb' }, true);
        UI.showToast("IndexedDB Storage added.", "success");
    },

    addOpfs() {
        const wsId = State.nextWorkspaceId++;
        Workspaces.add({ id: wsId, name: 'Browser Storage (OPFS)', type: 'opfs' }, true);
        UI.showToast("Origin Private File System added.", "success");
    }
};
