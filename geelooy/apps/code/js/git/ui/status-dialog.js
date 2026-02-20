// B"H
// FILE: js/git/ui/status-dialog.js
import { UI } from '../../ui.js';
import { GitDiff } from '../git-diff.js';
import { GitCommit } from '../commit/core.js';
import { GitStageManager } from './stage-manager.js';

export const GitStatusUI = {
    /**
     * B"H - Opens the Git Control Center.
     * @param {object} item - The repository folder item.
     * @param {boolean} scan - Whether to force a full local file scan.
     */
    async showGitUI(item, scan = false) {
        // Dynamic import to prevent circularity with GitMetaProvider
        const { GitMetaProvider } = await import('../meta.js');
        
        let gitInfo = item.type === 'github' ? item : await GitMetaProvider.getGitInfoForFolder(item);
        
        if (!gitInfo) {
            UI.showToast("Not a Git repository.", "error");
            return;
        }

        const changeSet = await GitDiff.calculateDiff(item, gitInfo, { checkUntracked: scan });
        
        GitStageManager.init(item, gitInfo, changeSet);
        this.render();
    },

    /**
     * B"H - Compatibility stub for discarding local changes.
     */
    async discardChanges(item) {
        UI.showToast("Discarding changes is handled via standard file operations.", "info");
    },

    render() {
        const dialog = document.getElementById('generic-dialog');
        dialog.innerHTML = `
            <div class="dialog-content" style="max-width:900px; width: 95%;">
                <h3 style="color:var(--neon-cyan); border-bottom:1px solid var(--color-border); padding-bottom:10px;">
                    Git Control: ${GitStageManager.gitContext.name}
                </h3>
                <div class="git-toolbar" style="margin-bottom: 10px; display: flex; gap: 10px;">
                    <button id="git-btn-refresh" class="secondary-btn" title="Refresh local status">
                        <svg class="svg-icon" style="width:14px;height:14px;"><use href="#icon-refresh"></use></svg> Scan
                    </button>
                    <div style="flex-grow:1;"></div>
                    <button onclick="window.gitStageAll()" class="secondary-btn">Stage All</button>
                </div>
                <div class="git-stage-container" style="display:flex; height:450px; gap:10px; border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden;">
                    <div class="git-col" style="flex:1; display: flex; flex-direction: column; background: rgba(0,0,0,0.2);">
                        <div class="git-col-header" style="padding:10px; background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border);">
                            Unstaged <span id="git-unstaged-count"></span>
                        </div>
                        <div id="git-unstaged-list" style="flex-grow:1; overflow-y:auto; padding:5px;"></div>
                    </div>
                    <div class="git-col" style="flex:1; display: flex; flex-direction: column; background: rgba(0,0,0,0.2);">
                        <div class="git-col-header" style="padding:10px; background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border);">
                            Staged <span id="git-staged-count"></span>
                        </div>
                        <div id="git-staged-list" style="flex-grow:1; overflow-y:auto; padding:5px;"></div>
                    </div>
                </div>
                <div class="commit-area" style="margin-top:15px; display: flex; flex-direction: column; gap: 10px;">
                    <textarea id="git-commit-msg" class="commit-message-input" placeholder="B\"H - Enter commit message..."></textarea>
                    <div class="commit-actions" style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="secondary-btn" onclick="document.getElementById('generic-dialog').classList.remove('visible')">Close</button>
                        <button id="git-commit-btn" class="primary-btn">Commit & Push Staged</button>
                    </div>
                </div>
            </div>`;
        
        dialog.classList.add('visible');
        GitStageManager.render();

        document.getElementById('git-btn-refresh').onclick = () => this.showGitUI(GitStageManager.gitContext, true);

        dialog.querySelector('#git-commit-btn').onclick = async () => {
            const msg = document.getElementById('git-commit-msg').value.trim() || 'B"H Update';
            const staged = Array.from(GitStageManager.staged);
            
            const changes = {
                creations: staged.filter(i => i.status === 'added'),
                updates: staged.filter(i => i.status === 'modified'),
                deletions: staged.filter(i => i.status === 'deleted')
            };
            
            dialog.classList.remove('visible');
            await GitCommit.performCommit(GitStageManager.gitContext, GitStageManager.gitInfo, changes, msg);
        };
    }
};