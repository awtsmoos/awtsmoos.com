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
    staged: new Set(),
    allChanges: [],
    gitContext: null,
    gitInfo: null,

    init(gitContext, gitInfo, changeSet) {
        this.gitContext = gitContext;
        this.gitInfo = gitInfo;
        
        this.allChanges = [
            ...changeSet.creations.map(c => ({ ...c, status: 'added' })),
            ...changeSet.updates.map(c => ({ ...c, status: 'modified' })),
            ...changeSet.deletions.map(c => ({ ...c, status: 'deleted' }))
        ];
        
        this.unstaged = [...this.allChanges];
        this.staged.clear();
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
        let item = null;
        for (const i of this.staged) {
            if (i.path === path) { item = i; break; }
        }
        if (item) {
            this.staged.delete(item);
            this.unstaged.push(item);
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

    // ... (diff toggling logic remains the same) ...
    async toggleDiff(item, containerEl) {
        const diffContainer = containerEl.querySelector('.git-diff-viewer');
        if (diffContainer.classList.contains('visible')) {
            diffContainer.classList.remove('visible');
            setTimeout(() => diffContainer.style.display = 'none', 200);
            return;
        }
        diffContainer.style.display = 'block';
        requestAnimationFrame(() => diffContainer.classList.add('visible'));

        if (!diffContainer.dataset.loaded) {
            diffContainer.innerHTML = '<div style="padding:10px; color:gray;">Computing Diff...</div>';
            let oldContent = '';
            let newContent = item.content || '';
            if (item.status !== 'added') {
                const remoteFile = this.gitInfo.remoteTree.find(f => f.path === item.path);
                if (remoteFile && remoteFile.sha) {
                    try {
                        const blob = await FileSystemProvider.GitHub.api(`/repos/${this.gitInfo.repoInfo.owner}/${this.gitInfo.repoInfo.repo}/git/blobs/${remoteFile.sha}`);
                        oldContent = FileSystemProvider.GitHub.b64_to_utf8(blob.content);
                    } catch(e) { oldContent = "[Error fetching remote]"; }
                }
            }
            const diffLines = GitDiff.computeLineDiff(oldContent, newContent);
            let html = diffLines.length === 0 ? '<div style="padding:10px; font-style:italic;">Binary or No Changes</div>' : '';
            diffLines.forEach(line => {
                const cls = line.type === 'added' ? 'diff-added' : (line.type === 'removed' ? 'diff-removed' : '');
                const sym = line.type === 'added' ? '+' : (line.type === 'removed' ? '-' : ' ');
                html += `<div class="diff-line ${cls}"><div class="diff-line-num">${line.line || ''}</div><div class="diff-line-content">${sym} ${line.content.replace(/</g, '&lt;')}</div></div>`;
            });
            diffContainer.innerHTML = html;
            diffContainer.dataset.loaded = "true";
        }
    },

    render() {
        const unstagedList = document.getElementById('git-unstaged-list');
        if (unstagedList) {
            unstagedList.innerHTML = this.unstaged.length === 0 
                ? '<div style="padding:10px; color:gray; font-style:italic;">No unstaged changes.</div>'
                : this.unstaged.map(item => this._renderItem(item, 'unstaged')).join('');
        }

        const stagedList = document.getElementById('git-staged-list');
        if (stagedList) {
            const arr = Array.from(this.staged);
            stagedList.innerHTML = arr.length === 0
                ? '<div style="padding:10px; color:gray; font-style:italic;">No staged changes.</div>'
                : arr.map(item => this._renderItem(item, 'staged')).join('');
        }
        
        document.getElementById('git-unstaged-count').textContent = `(${this.unstaged.length})`;
        document.getElementById('git-staged-count').textContent = `(${this.staged.size})`;
        
        const commitBtn = document.getElementById('git-commit-btn');
        const magicBtn = document.getElementById('git-magic-push-btn');
        
        if (commitBtn) {
            commitBtn.disabled = this.staged.size === 0;
            if (this.staged.size > 0) commitBtn.classList.remove('disabled');
            else commitBtn.classList.add('disabled');
        }
        
        if (magicBtn) {
            // Magic Push is available if there are ANY changes (staged OR unstaged)
            const hasAnyChanges = this.staged.size > 0 || this.unstaged.length > 0;
            magicBtn.disabled = !hasAnyChanges;
            if (hasAnyChanges) magicBtn.classList.remove('disabled');
        }
    },

    _renderItem(item, type) {
        const icon = item.status === 'added' ? 'plus' : (item.status === 'deleted' ? 'trash' : 'file');
        const color = item.status === 'added' ? 'var(--neon-lime)' : (item.status === 'deleted' ? 'var(--color-accent-danger)' : 'var(--color-accent-info)');
        const actionBtn = type === 'unstaged' 
            ? `<button class="git-action-btn stage" onclick="window.gitStage('${item.path}')" title="Stage">+</button>`
            : `<button class="git-action-btn unstage" onclick="window.gitUnstage('${item.path}')" title="Unstage">-</button>`;
        const toggleClick = `window.gitToggleDiff('${item.path}', this.parentElement)`;

        return `<div class="git-file-container"><div class="git-file-item" style="border-left: 3px solid ${color};"><div class="git-file-name" onclick="${toggleClick}"><span style="color:${color}; font-weight:bold; margin-right:5px;">${item.status[0].toUpperCase()}</span>${item.path}</div>${actionBtn}</div><div class="git-diff-viewer"></div></div>`;
    }
};

// Hooks
window.gitStage = (path) => GitStageManager.stage(path);
window.gitUnstage = (path) => GitStageManager.unstage(path);
window.gitToggleDiff = (path, el) => {
    let item = GitStageManager.unstaged.find(i => i.path === path);
    if (!item) item = Array.from(GitStageManager.staged).find(i => i.path === path);
    if (item) GitStageManager.toggleDiff(item, el);
};
window.gitStageAll = () => GitStageManager.stageAll();
window.gitUnstageAll = () => GitStageManager.unstageAll();


export const GitStatusUI = {
    async showGitUI(gitContextItem, performScan = false) {
        const taskId = `git-scan-${Date.now()}`;
        UI.startTask(taskId, "Reading repository data...");

        let gitInfo = gitContextItem.type === 'github' ? gitContextItem : await GitMetaProvider.getGitInfoForFolder(gitContextItem);
        if (!gitInfo) { UI.endTask(taskId, 'error', "Not a Git-aware folder."); return; }

        UI.updateTask(taskId, 50, "Analyzing status...");
        try {
            if (gitContextItem.type === 'github' && (performScan || !gitInfo._treeCache)) {
                const treeData = await FileSystemProvider.GitHub.getFullTree(gitInfo);
                gitInfo = { ...gitInfo, remoteTree: treeData.tree, baseCommitSHA: treeData.sha };
            }

            const changeSet = await GitDiff.calculateDiff(gitContextItem, gitInfo, { checkUntracked: performScan });
            UI.endTask(taskId, 'success', "Scan complete.");
            GitStageManager.init(gitContextItem, gitInfo, changeSet);
            this.renderDialog();

        } catch (e) {
            UI.endTask(taskId, 'error', `Error: ${e.message}`);
            console.error(e);
        }
    },

    renderDialog() {
        const defaultMsg = `B"H\nBiezras Hashem\n[${new Date().toLocaleString()}] Update`;

        const dialogHTML = `
            <div class="git-toolbar">
                <button id="git-btn-refresh" class="menu-button"><svg class="svg-icon"><use href="#icon-refresh"></use></svg> Scan</button>
                <button id="git-btn-pull" class="menu-button"><svg class="svg-icon"><use href="#icon-download"></use></svg> Pull</button>
                <button id="git-btn-force-pull" class="menu-button danger"><svg class="svg-icon"><use href="#icon-alert-triangle"></use></svg> Force Pull</button>
                <div style="flex-grow:1;"></div>
                <button id="git-magic-push-btn" class="primary-btn" title="Stage All, Commit, and Push immediately">⚡ Stage & Push All</button>
            </div>

            <div class="git-stage-container">
                <div class="git-col">
                    <div class="git-col-header unstaged"><span>Unstaged <span id="git-unstaged-count">(0)</span></span><button class="icon-button" onclick="window.gitStageAll()"><svg class="svg-icon" style="width:14px;height:14px;"><use href="#icon-plus"></use></svg></button></div>
                    <div id="git-unstaged-list" class="git-file-list"></div>
                </div>
                <div class="git-col">
                    <div class="git-col-header staged"><span>Staged <span id="git-staged-count">(0)</span></span><button class="icon-button" onclick="window.gitUnstageAll()"><svg class="svg-icon" style="width:14px;height:14px;"><use href="#icon-x"></use></svg></button></div>
                    <div id="git-staged-list" class="git-file-list"></div>
                </div>
            </div>

            <div class="commit-area">
                <textarea id="git-commit-msg" class="commit-message-input" rows="4">${defaultMsg}</textarea>
                <div class="commit-actions">
                    <label class="git-force-option" title="Rewrite remote history (Dangerous)">
                        <input type="checkbox" id="git-force-push"> ⚠️ Force Push
                    </label>
                    <button id="git-cancel-btn" class="secondary-btn">Close</button>
                    <button id="git-commit-btn" class="primary-btn" disabled>Commit Staged</button>
                </div>
            </div>
        `;

        const dialog = document.getElementById('generic-dialog');
        dialog.innerHTML = `<div class="dialog-content" style="max-width: 900px; width: 95%;">
            <h3 style="color:var(--neon-cyan); border-bottom:1px solid var(--color-border); padding-bottom:10px; margin-bottom:15px;">Git Control: ${GitStageManager.gitContext.name}</h3>
            ${dialogHTML}
        </div>`;
        dialog.classList.add('visible');

        GitStageManager.render();

        // Handlers
        document.getElementById('git-cancel-btn').onclick = () => dialog.classList.remove('visible');
        document.getElementById('git-btn-refresh').onclick = () => { dialog.classList.remove('visible'); this.showGitUI(GitStageManager.gitContext, true); };
        document.getElementById('git-btn-pull').onclick = () => { dialog.classList.remove('visible'); FileOperations.pullAndOverwrite(GitStageManager.gitContext, GitStageManager.gitInfo); };
        
        document.getElementById('git-btn-force-pull').onclick = async () => {
            dialog.classList.remove('visible');
            const c = await UI.showDialog({ title: "Force Pull", message: "Wipe local changes?", okText: "Yes", cancelText: "No" });
            if(c) FileOperations.pullAndOverwrite(GitStageManager.gitContext, GitStageManager.gitInfo);
        };

        const commitAction = async (stagedOnly = true) => {
            const msg = document.getElementById('git-commit-msg').value.trim();
            if (!msg) return UI.showToast("Message required.", "warning");
            
            // If !stagedOnly (Magic Push), we stage everything first
            if (!stagedOnly) {
                GitStageManager.stageAll();
            }

            if (GitStageManager.staged.size === 0) return UI.showToast("Nothing to commit.", "warning");

            const isForce = document.getElementById('git-force-push').checked;
            const stagedArray = Array.from(GitStageManager.staged);
            const finalChangeSet = {
                creations: stagedArray.filter(i => i.status === 'added'),
                updates: stagedArray.filter(i => i.status === 'modified'),
                deletions: stagedArray.filter(i => i.status === 'deleted')
            };

            dialog.classList.remove('visible');
            await GitStatusUI._handleCommit(GitStageManager.gitContext, GitStageManager.gitInfo, finalChangeSet, msg, isForce);
        };

        document.getElementById('git-commit-btn').onclick = () => commitAction(true);
        document.getElementById('git-magic-push-btn').onclick = () => commitAction(false);
    },

    async _handleCommit(gitContextItem, gitInfo, finalChangeSet, commitMessage, force) {
        const taskId = `post-commit-${Date.now()}`;
        try {
            const newCommitSHA = await GitCommit.performCommit(
                gitContextItem, 
                gitInfo, 
                finalChangeSet, 
                commitMessage, 
                { force }
            );
            
            UI.startTask(taskId, "Verifying final state...");
            
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
            
            UI.endTask(taskId, 'success', force ? "Force Push Successful!" : "Changes committed!");
        } catch (e) {
            UI.showToast(`COMMIT FAILED: ${e.message}`, 'error', 8000);
        }
    },
    
    async discardChanges(gitContextItem) { /* Keep for api compat */ }
};