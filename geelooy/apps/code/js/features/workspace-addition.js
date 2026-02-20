// B"H
// FILE: js/features/workspace-addition.js

import { UI } from '../ui.js';
import { State } from '../state.js';
import { App } from '../app.js';
import { Workspaces } from '../workspaces.js';
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

    // B"H
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