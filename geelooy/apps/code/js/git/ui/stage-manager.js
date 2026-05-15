// B"H
// FILE: js/git/ui/stage-manager.js

/**
 * B"H - Git Stage Manager
 * Handles the logic of adding/removing files from the commit set.
 */
export const GitStageManager = {
    unstaged: [],
    staged: new Set(),
    gitContext: null,
    gitInfo: null,

    init(gitContext, gitInfo, changeSet) {
        this.gitContext = gitContext;
        this.gitInfo = gitInfo;

        // Flatten the changeset into a unified list with statuses
        this.unstaged = [
            ...(changeSet.creations || []).map(c => ({ ...c, status: 'added' })),
            ...(changeSet.updates || []).map(c => ({ ...c, status: 'modified' })),
            ...(changeSet.deletions || []).map(c => ({ ...c, status: 'deleted' }))
        ].sort((a, b) => String(a.path).localeCompare(String(b.path)));
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
            this.unstaged.sort((a, b) => a.path.localeCompare(b.path));
            this.render();
        }
    },

    stageAll() {
        this.unstaged.forEach(i => this.staged.add(i));
        this.unstaged = [];
        this.render();
    },

    render() {
        const uList = document.getElementById('git-unstaged-list');
        const sList = document.getElementById('git-staged-list');
        if (!uList || !sList) return;

        uList.innerHTML = this.unstaged.map(i => this._row(i, 'stage')).join('') || 
                         '<div style="padding:10px; color:gray; font-style:italic;">No changes.</div>';

        sList.innerHTML = Array.from(this.staged).map(i => this._row(i, 'unstage')).join('') || 
                         '<div style="padding:10px; color:gray; font-style:italic;">Nothing staged.</div>';

        document.getElementById('git-unstaged-count').textContent = `(${this.unstaged.length})`;
        document.getElementById('git-staged-count').textContent = `(${this.staged.size})`;

        const btn = document.getElementById('git-commit-btn');
        if (btn) btn.disabled = (this.staged.size === 0);
    },

    _row(item, action) {
        const colorMap = { 'added': 'var(--neon-lime)', 'deleted': 'var(--color-accent-danger)', 'modified': 'var(--neon-cyan)' };
        const color = colorMap[item.status] || 'white';
        const label = item.status.toUpperCase()[0];
        const hook = action === 'stage' ? 'gitStage' : 'gitUnstage';
        const safePath = JSON.stringify(item.path);
        const escapedTitle = String(item.path)
            .replaceAll('&', '&amp;')
            .replaceAll('"', '&quot;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');

        return `
            <div class="git-file-item" style="display:flex; align-items:flex-start; gap:6px; padding:6px; margin-bottom:4px; background:rgba(255,255,255,0.03); border-left: 2px solid ${color};">
                <div class="git-file-name" title="${escapedTitle}" style="flex:1 1 0; min-width:0; cursor:pointer; font-family:var(--font-code); font-size:0.85em; white-space:normal; overflow-wrap:anywhere; word-break:break-word; line-height:1.35;">
                    <span style="color:${color}; font-weight:bold; margin-right:8px;">${label}</span>${escapedTitle}
                </div>
                <button class="git-action-btn" onclick='window.${hook}(${safePath})' style="flex:0 0 auto; background:none; border:1px solid var(--color-border); color:white; border-radius:4px; padding:2px 8px; cursor:pointer;">
                    ${action === 'stage' ? '+' : '-'}
                </button>
            </div>`;
    }
};

// B"H - Global Hooks for inline onclick
window.gitStage = (p) => GitStageManager.stage(p);
window.gitUnstage = (p) => GitStageManager.unstage(p);
window.gitStageAll = () => GitStageManager.stageAll();
