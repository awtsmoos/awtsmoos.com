// B"H
// FILE: js/git/ui/stage-manager.js
import { FileSystemProvider } from '../../fs-provider.js';
import { GitDiff } from '../git-diff.js';

export const GitStageManager = {
    unstaged: [],
    staged: new Set(),
    gitContext: null,
    gitInfo: null,

    init(gitContext, gitInfo, changeSet) {
        this.gitContext = gitContext;
        this.gitInfo = gitInfo;
        this.unstaged = [
            ...(changeSet.creations || []).map(c => ({ ...c, status: 'added' })),
            ...(changeSet.updates || []).map(c => ({ ...c, status: 'modified' })),
            ...(changeSet.deletions || []).map(c => ({ ...c, status: 'deleted' }))
        ];
        this.staged.clear();
    },

    stage(path) {
        const idx = this.unstaged.findIndex(c => c.path === path);
        if (idx !== -1) {
            this.staged.add(this.unstaged.splice(idx, 1)[0]);
            this.render();
        }
    },

    unstage(path) {
        const item = Array.from(this.staged).find(i => i.path === path);
        if (item) {
            this.staged.delete(item);
            this.unstaged.push(item);
            this.render();
        }
    },

    render() {
        const uList = document.getElementById('git-unstaged-list');
        const sList = document.getElementById('git-staged-list');
        if (!uList || !sList) return;

        uList.innerHTML = this.unstaged.map(i => this._row(i, 'stage')).join('') || '<div class="empty">Clear</div>';
        sList.innerHTML = Array.from(this.staged).map(i => this._row(i, 'unstage')).join('') || '<div class="empty">Empty</div>';
        
        document.getElementById('git-unstaged-count').textContent = `(${this.unstaged.length})`;
        document.getElementById('git-staged-count').textContent = `(${this.staged.size})`;
        
        const btn = document.getElementById('git-commit-btn');
        if (btn) btn.disabled = this.staged.size === 0;
    },

    _row(item, action) {
        const color = item.status === 'added' ? 'var(--neon-lime)' : 'var(--neon-cyan)';
        return `
            <div class="git-file-item" style="border-left: 2px solid ${color}">
                <div class="git-file-name" onclick="window.gitToggleDiff('${item.path}', this.parentElement)">
                    ${item.path}
                </div>
                <button class="git-action-btn" onclick="window.git${action === 'stage' ? 'Stage' : 'Unstage'}('${item.path}')">
                    ${action === 'stage' ? '+' : '-'}
                </button>
                <div class="git-diff-viewer"></div>
            </div>`;
    }
};