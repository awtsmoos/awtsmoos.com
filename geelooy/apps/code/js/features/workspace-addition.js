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

    async addGithub() {
        if (!State.githubToken) {
            const token = await UI.showDialog({
                title: "GitHub Token Required",
                message: "A Personal Access Token (classic) with 'repo' scope is required to access GitHub.",
                hasInput: true, 
                inputType: 'password', 
                placeholder: "ghp_...", 
                okText: "Save Token",
                cancelText: "Cancel"
            });
            if (!token) return;
            State.githubToken = token;
            App.saveSettings();
        }

        const contentHTML = /*html*/`
            <p>Enter the repository path (owner/repo) or full URL.</p>
            <input type="text" id="repo-input" placeholder="awtsmoos/editor" style="margin-bottom: 10px;">
            <div id="repo-list-container" style="border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; margin-top: 10px;">
                <button id="load-repos-btn" class="menu-button" style="width: 100%; justify-content: space-between; border:none; background: var(--color-bg-secondary);">
                    <span>Load My Repositories</span>
                    <svg class="svg-icon" style="transition: transform 0.2s;"><use href="#icon-arrow-left" style="transform: rotate(-90deg);"></use></svg>
                </button>
                <div id="repo-list" style="display: none; max-height: 200px; overflow-y: auto; background: var(--color-bg-primary); border-top: 1px solid var(--color-border);">
                    <div style="padding: 10px; text-align: center; color: var(--color-text-tertiary);">Loading...</div>
                </div>
            </div>`;

        setTimeout(() => {
            const loadBtn = document.getElementById('load-repos-btn');
            const repoList = document.getElementById('repo-list');
            const input = document.getElementById('repo-input');
            const icon = loadBtn?.querySelector('.svg-icon');

            if (loadBtn && repoList && input) {
                repoList.onclick = (e) => {
                    const item = e.target.closest('.repo-item');
                    if (item) {
                        input.value = item.dataset.full_name;
                        repoList.style.display = 'none';
                        if(icon) icon.style.transform = 'rotate(-90deg)';
                    }
                };

                loadBtn.onclick = async () => {
                    const isHidden = repoList.style.display === 'none';
                    repoList.style.display = isHidden ? 'block' : 'none';
                    if(icon) icon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(-90deg)';
                    
                    if (isHidden && !repoList.dataset.loaded) {
                        try {
                            const repos = await FileSystemProvider.GitHub.api('/user/repos?sort=updated&per_page=100');
                            repoList.dataset.loaded = 'true';
                            if(repos.length === 0) {
                                 repoList.innerHTML = `<div style="padding:10px; text-align:center;">No repositories found.</div>`;
                            } else {
                                repoList.innerHTML = repos.map(r => `
                                    <div class="repo-item" data-full_name="${r.full_name}" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--color-border); font-size: 0.9em; display:flex; justify-content:space-between;">
                                        <strong>${r.name}</strong> 
                                        <span style="color: var(--color-text-tertiary); font-size: 0.8em;">${r.private ? '🔒' : 'globe'}</span>
                                    </div>
                                `).join('');
                            }
                        } catch (e) {
                            repoList.innerHTML = `<div style="padding: 10px; color: var(--color-accent-danger);">Error: ${e.message}</div>`;
                        }
                    }
                };
            }
        }, 50);

        const result = await UI.showDialog({
            title: "Add GitHub Repository",
            contentHTML,
            okText: "Next",
            cancelText: "Cancel"
        });
        
        if (!result) return;
        
        const repoInput = document.getElementById('repo-input');
        if(!repoInput) return;
        const repoUrl = repoInput.value;
        if (!repoUrl) return;

        let owner, repo;
        const clean = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
        const parts = clean.split('/');
        if (parts.length >= 2) {
            owner = parts[parts.length - 2];
            repo = parts[parts.length - 1];
        } else {
            UI.showToast("Invalid repository format. Use 'owner/repo'.", "error");
            return;
        }

        const branch = await UI.showDialog({
            title: "Select Branch",
            message: "Enter the branch name to checkout (default: main).",
            hasInput: true, 
            placeholder: "main", 
            inputValue: "main", 
            okText: "Add Workspace",
            cancelText: "Cancel"
        });
        if (!branch) return;

        UI.showLoading("Connecting to GitHub...");
        try {
            const repoInfo = { owner, repo };
            await FileSystemProvider.GitHub.api(`/repos/${owner}/${repo}`);
            
            const wsId = State.nextWorkspaceId++;
            Workspaces.add({
                id: wsId,
                name: `${owner}/${repo} (${branch})`,
                type: 'github',
                repoInfo,
                branch
            }, true);
            
            UI.showToast(`Connected to ${owner}/${repo}`, "success");
        } catch (e) {
            console.error(e);
            let msg = e.message;
            if(e.message === 'Not Found') msg = "Repository not found or token invalid.";
            UI.showToast(`Connection failed: ${msg}`, "error");
        } finally {
            UI.hideLoading();
        }
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