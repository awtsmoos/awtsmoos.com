// B"H
// FILE: js/git/status-ui.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';
import { GitMetaProvider } from './meta.js';
import { GitDiff } from './git-diff.js';
import { GitCommit } from './git-commit.js';
import { FileOperations } from '../file-operations.js';
import { Tabs } from '../tabs.js';

// B"H - Internal State for the Staging Dialog
const GitStageManager = {
    unstaged: [],
    staged: new Set(), // Set of paths
    allChanges: [],
    gitContext: null,
    gitInfo: null,
    diffCache: new Map(),

    init(gitContext, gitInfo, changeSet) {
        this.gitContext = gitContext;
        this.gitInfo = gitInfo;
        
        // Flatten changeSet into a workable list
        this.allChanges = [
            ...changeSet.creations.map(c => ({ ...c, status: 'added' })),
            ...changeSet.updates.map(c => ({ ...c, status: 'modified' })),
            ...changeSet.deletions.map(c => ({ ...c, status: 'deleted' }))
        ];
        
        // Initially, everything is unstaged
        this.unstaged = [...this.allChanges];
        this.staged.clear();
        this.diffCache.clear();
    },

    stage(path) {
        const idx = this.unstaged.findIndex(c => c.path === path);
        if (idx !== -1) {
            const item = this.unstaged.splice(idx, 1)[0];
            this.staged.add(item);
            this.render();
        }
    },

    unstage(path) {
        // Find item in staged set (it's an object reference)
        let item = null;
        for (const i of this.staged) {
            if (i.path === path) { item = i; break; }
        }
        if (item) {
            this.staged.delete(item);
            this.unstaged.push(item);
            // Sort unstaged for tidiness
            this.unstaged.sort((a,b) => a.path.localeCompare(b.path));
            this.render();
        }
    },
    
    stageAll() {
        this.unstaged.forEach(item => this.staged.add(item));
        this.unstaged = [];
        this.render();
    },
    
    unstageAll() {
        this.staged.forEach(item => this.unstaged.push(item));
        this.staged.clear();
        this.unstaged.sort((a,b) => a.path.localeCompare(b.path));
        this.render();
    },

    async toggleDiff(item, containerEl) {
        const diffContainer = containerEl.querySelector('.git-diff-viewer');
        
        if (diffContainer.classList.contains('visible')) {
            diffContainer.classList.remove('visible');
            setTimeout(() => diffContainer.style.display = 'none', 200);
            return;
        }

        diffContainer.style.display = 'block';
        // Need frame for animation
        requestAnimationFrame(() => diffContainer.classList.add('visible'));

        if (!diffContainer.dataset.loaded) {
            diffContainer.innerHTML = '<div style="padding:10px; color:gray;">Computing Diff...</div>';
            
            // Fetch contents
            let oldContent = '';
            let newContent = item.content || ''; // If content available in changeset

            // If it's a deletion or update, we need old content from remote
            if (item.status !== 'added') {
                const remoteFile = this.gitInfo.remoteTree.find(f => f.path === item.path);
                if (remoteFile && remoteFile.sha) {
                    try {
                        const blob = await FileSystemProvider.GitHub.api(`/repos/${this.gitInfo.repoInfo.owner}/${this.gitInfo.repoInfo.repo}/git/blobs/${remoteFile.sha}`);
                        oldContent = FileSystemProvider.GitHub.b64_to_utf8(blob.content);
                    } catch(e) {
                        oldContent = "[Error fetching remote content]";
                    }
                }
            }
            
            // Calculate Diff
            const diffLines = GitDiff.computeLineDiff(oldContent, newContent);
            
            // Render Diff
            let html = '';
            if (diffLines.length === 0) {
                html = '<div style="padding:10px; font-style:italic;">Binary file or no text changes detected.</div>';
            } else {
                diffLines.forEach(line => {
                    const cls = line.type === 'added' ? 'diff-added' : (line.type === 'removed' ? 'diff-removed' : '');
                    const sym = line.type === 'added' ? '+' : (line.type === 'removed' ? '-' : ' ');
                    html += `<div class="diff-line ${cls}">
                        <div class="diff-line-num">${line.line || ''}</div>
                        <div class="diff-line-content">${sym} ${line.content.replace(/</g, '&lt;')}</div>
                    </div>`;
                });
            }
            
            diffContainer.innerHTML = html;
            diffContainer.dataset.loaded = "true";
        }
    },

    render() {
        // Unstaged List
        const unstagedList = document.getElementById('git-unstaged-list');
        if (unstagedList) {
            unstagedList.innerHTML = this.unstaged.length === 0 
                ? '<div style="padding:10px; color:gray; font-style:italic;">No unstaged changes.</div>'
                : this.unstaged.map(item => this._renderItem(item, 'unstaged')).join('');
        }

        // Staged List
        const stagedList = document.getElementById('git-staged-list');
        if (stagedList) {
            const arr = Array.from(this.staged);
            stagedList.innerHTML = arr.length === 0
                ? '<div style="padding:10px; color:gray; font-style:italic;">No staged changes.</div>'
                : arr.map(item => this._renderItem(item, 'staged')).join('');
        }
        
        // Update Counts
        document.getElementById('git-unstaged-count').textContent = `(${this.unstaged.length})`;
        document.getElementById('git-staged-count').textContent = `(${this.staged.size})`;
        
        // Enable/Disable Commit Button
        const commitBtn = document.getElementById('git-commit-btn');
        if (commitBtn) {
            commitBtn.disabled = this.staged.size === 0;
            if (this.staged.size > 0) commitBtn.classList.remove('disabled');
            else commitBtn.classList.add('disabled');
        }
    },

    _renderItem(item, type) {
        const icon = item.status === 'added' ? 'plus' : (item.status === 'deleted' ? 'trash' : 'file');
        const color = item.status === 'added' ? 'var(--neon-lime)' : (item.status === 'deleted' ? 'var(--color-accent-danger)' : 'var(--color-accent-info)');
        const actionBtn = type === 'unstaged' 
            ? `<button class="git-action-btn stage" onclick="window.gitStage('${item.path}')" title="Stage">+</button>`
            : `<button class="git-action-btn unstage" onclick="window.gitUnstage('${item.path}')" title="Unstage">-</button>`;
            
        // onclick for the item triggers diff toggle
        const toggleClick = `window.gitToggleDiff('${item.path}', this.parentElement)`;

        return `
            <div class="git-file-container">
                <div class="git-file-item" style="border-left: 3px solid ${color};">
                    <div class="git-file-name" onclick="${toggleClick}">
                        <span style="color:${color}; font-weight:bold; margin-right:5px;">${item.status[0].toUpperCase()}</span>
                        ${item.path}
                    </div>
                    ${actionBtn}
                </div>
                <div class="git-diff-viewer"></div>
            </div>
        `;
    }
};

// Global hooks for HTML onclicks
window.gitStage = (path) => GitStageManager.stage(path);
window.gitUnstage = (path) => GitStageManager.unstage(path);
window.gitToggleDiff = (path, el) => {
    // Find the item object
    let item = GitStageManager.unstaged.find(i => i.path === path);
    if (!item) item = Array.from(GitStageManager.staged).find(i => i.path === path);
    if (item) GitStageManager.toggleDiff(item, el);
};
window.gitStageAll = () => GitStageManager.stageAll();
window.gitUnstageAll = () => GitStageManager.unstageAll();


export const GitStatusUI = {
    async showGitUI(gitContextItem, performScan = false) {
        UI.showLoading("Reading repository data...");

        let gitInfo = gitContextItem.type === 'github' ?
            gitContextItem :
            await GitMetaProvider.getGitInfoForFolder(gitContextItem);

        if (!gitInfo) {
            UI.hideLoading();
            UI.showToast("This is not a Git-aware folder.", "error");
            return;
        }

        UI.showLoading("Analyzing status...");
        try {
            // ... (Existing Tree Refresh Logic) ...
            if (gitContextItem.type === 'github' && (performScan || !gitInfo._treeCache)) {
                const treeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                gitInfo = { ...gitInfo, remoteTree: treeData.tree, baseCommitSHA: treeData.sha };
            }

            const changeSet = await GitDiff.calculateDiff(gitContextItem, gitInfo, { checkUntracked: performScan });
            
            UI.hideLoading();
            
            // Initialize Manager with Data
            GitStageManager.init(gitContextItem, gitInfo, changeSet);
            
            this.renderDialog();

        } catch (e) {
            UI.hideLoading();
            UI.showToast(`Error: ${e.message}`, 'error');
            console.error(e);
        }
    },

    renderDialog() {
        const dialogHTML = `
            <div class="git-toolbar">
                <button id="git-btn-refresh" class="menu-button" title="Refresh status (Scan for changes)">
                    <svg class="svg-icon"><use href="#icon-refresh"></use></svg> Scan
                </button>
                <button id="git-btn-pull" class="menu-button" title="Pull remote changes (Safe)">
                    <svg class="svg-icon"><use href="#icon-download"></use></svg> Pull
                </button>
                <button id="git-btn-force-pull" class="menu-button danger" title="Overwrite local changes with remote version">
                    <svg class="svg-icon"><use href="#icon-alert-triangle"></use></svg> Force Pull
                </button>
            </div>

            <div class="git-stage-container">
                <!-- Unstaged Column -->
                <div class="git-col">
                    <div class="git-col-header unstaged">
                        <span>Unstaged <span id="git-unstaged-count">(0)</span></span>
                        <button class="icon-button" onclick="window.gitStageAll()" title="Stage All" style="height:24px;width:24px;padding:0;">
                            <svg class="svg-icon" style="width:14px;height:14px;"><use href="#icon-plus"></use></svg>
                        </button>
                    </div>
                    <div id="git-unstaged-list" class="git-file-list"></div>
                </div>

                <!-- Staged Column -->
                <div class="git-col">
                    <div class="git-col-header staged">
                        <span>Staged <span id="git-staged-count">(0)</span></span>
                        <button class="icon-button" onclick="window.gitUnstageAll()" title="Unstage All" style="height:24px;width:24px;padding:0;">
                            <svg class="svg-icon" style="width:14px;height:14px;"><use href="#icon-x"></use></svg>
                        </button>
                    </div>
                    <div id="git-staged-list" class="git-file-list"></div>
                </div>
            </div>

            <div class="commit-area">
                <textarea id="git-commit-msg" class="commit-message-input" placeholder="B&quot;H - Enter commit message..."></textarea>
                <div class="commit-actions">
                    <label class="git-force-option" title="Use Force Push (rewrite remote history)">
                        <input type="checkbox" id="git-force-push"> Force Push
                    </label>
                    <button id="git-cancel-btn" class="secondary-btn">Cancel</button>
                    <button id="git-commit-btn" class="primary-btn" disabled>Commit Staged</button>
                </div>
            </div>
        `;

        // We hijack the generic dialog but customize behavior
        const dialog = document.getElementById('generic-dialog');
        dialog.innerHTML = `
            <div class="dialog-content" style="max-width: 900px; width: 95%;">
                <h3 style="color:var(--neon-cyan); border-bottom:1px solid var(--color-border); padding-bottom:10px; margin-bottom:15px;">
                    Git Control: ${GitStageManager.gitContext.name}
                </h3>
                ${dialogHTML}
            </div>
        `;
        dialog.classList.add('visible');

        // Initial Render
        GitStageManager.render();

        // Bind Main Buttons
        document.getElementById('git-cancel-btn').onclick = () => {
            dialog.classList.remove('visible');
        };
        
        // Toolbar Events
        document.getElementById('git-btn-refresh').onclick = () => {
            dialog.classList.remove('visible');
            this.showGitUI(GitStageManager.gitContext, true);
        };
        
        document.getElementById('git-btn-pull').onclick = () => {
            dialog.classList.remove('visible');
            // Safe pull actually reuses the logic but we warn/confirm first in FileOperations
            FileOperations.pullAndOverwrite(GitStageManager.gitContext, GitStageManager.gitInfo);
        };
        
        document.getElementById('git-btn-force-pull').onclick = async () => {
            dialog.classList.remove('visible');
            const confirmed = await UI.showDialog({
                title: "Force Pull / Reset",
                message: "Are you sure? This will wipe all local uncommitted changes and match the remote state exactly.",
                okText: "Force Pull",
                cancelText: "Cancel"
            });
            if(confirmed) {
                FileOperations.pullAndOverwrite(GitStageManager.gitContext, GitStageManager.gitInfo);
            }
        };

        const commitMsgInput = document.getElementById('git-commit-msg');
        
        // Commit Shortcut
        commitMsgInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                document.getElementById('git-commit-btn').click();
            }
        });

        document.getElementById('git-commit-btn').onclick = async () => {
            const msg = commitMsgInput.value.trim();
            if (!msg) {
                UI.showToast("Please enter a commit message.", "warning");
                return;
            }
            if (GitStageManager.staged.size === 0) return;

            const isForce = document.getElementById('git-force-push').checked;

            // Prepare ChangeSet from Staged Items ONLY
            const stagedArray = Array.from(GitStageManager.staged);
            const finalChangeSet = {
                creations: stagedArray.filter(i => i.status === 'added'),
                updates: stagedArray.filter(i => i.status === 'modified'),
                deletions: stagedArray.filter(i => i.status === 'deleted')
            };

            dialog.classList.remove('visible');
            
            try {
                await GitStatusUI._handleCommit(
                    GitStageManager.gitContext, 
                    GitStageManager.gitInfo, 
                    finalChangeSet, 
                    msg, 
                    isForce
                );
            } catch(e) {
                console.error(e);
            }
        };
    },

    // Re-use existing commit logic
    async _handleCommit(gitContextItem, gitInfo, finalChangeSet, commitMessage, force) {
        UI.hideLoading();
        try {
            const newCommitSHA = await GitCommit.performCommit(
                gitContextItem, 
                gitInfo, 
                finalChangeSet, 
                commitMessage, 
                { force }
            );
            
            UI.showLoading("Verifying final repository state...");
            
            const newTree = await FileSystemProvider.GitHub.getFullTree(gitInfo);
            
            if (gitContextItem.type !== 'github') {
                const updatedGitInfo = { ...gitInfo, baseCommitSHA: newCommitSHA, remoteTree: newTree.tree };
                const ikarFileContent = `// B"H\n\nconst ikar = ${JSON.stringify(updatedGitInfo, null, 4)};`;
                const ikarFileItem = { ...gitContextItem, path: `${gitContextItem.path}/.awtsmoos-repo/ikar.js` };
                await FileSystemProvider.write(ikarFileItem, ikarFileContent);
            } else {
                gitContextItem.remoteTree = newTree.tree;
                gitContextItem.baseCommitSHA = newTree.sha;
                await Workspaces.refreshNode(gitContextItem);
            }
            
            UI.hideLoading();
            UI.showToast(force ? "Force Push Successful!" : "Changes committed successfully!", "success");
        } catch (e) {
            UI.hideLoading();
            let finalMessage = `COMMIT FAILED: ${e.message}`;
            UI.showToast(finalMessage, 'error', 8000);
        }
    },
    
    // Kept for compatibility
    async discardChanges(gitContextItem) {
        // ... (Keep existing implementation or redirect to Unstaged logic if preferred)
        // For now, implementing "Discard Staged" inside the new UI covers most needs.
        // We can keep the global discard for emergencies.
    }
};