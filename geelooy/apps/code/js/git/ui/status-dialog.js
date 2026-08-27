// B"H
// FILE: js/git/ui/status-dialog.js

import { UI } from '../../ui.js';

export const GitStatusUI = {
    async showGitUI(item, gitInfoOrScan, scanOrOptions, maybeOptions) {
	    var self = this;
	    var { GitMetaProvider } = await import('../meta.js');
        var providedGitInfo = (gitInfoOrScan && typeof gitInfoOrScan === 'object') ? gitInfoOrScan : null;
        var scan = (gitInfoOrScan === true) || (scanOrOptions === true);
        var options = {};
        if (scanOrOptions && typeof scanOrOptions === 'object') options = scanOrOptions;
        if (maybeOptions && typeof maybeOptions === 'object') options = maybeOptions;
	    var gitInfo = providedGitInfo || (item.type === 'github' ? item : await GitMetaProvider.getGitInfoForFolder(item));
	    
	    if (!gitInfo) {
	        UI.showToast("Not a Git repository.", "error");
	        return;
	    }
	
	    this.renderSkeleton(item);
	
	    try {
	        var { GitDiff } = await import('../git-diff.js');
	        // B"H - FAST MODE: checkUntracked is FALSE by default.
	        // It will only look at the IndexedDB "Queue", which is instant.
	        var changeSet = await GitDiff.calculateDiff(item, gitInfo, {
            checkUntracked: (scan === true),
            scanRoot: options.scanRoot || item
        });
	        
	        var { GitStageManager } = await import('./stage-manager.js');
	        GitStageManager.init(item, gitInfo, changeSet);
	        
	        this.populateFullUI(item, gitInfo, options);
	    } catch(e) {
	        UI.showToast("B\"H Error: " + e.message, "error");
	    }
	},

    renderSkeleton: function(item) {
        var dialog = document.getElementById('generic-dialog');
        dialog.innerHTML = 
            '<div class="dialog-content" style="max-width:900px; width: 95%;">' +
                '<h3 style="color:var(--neon-cyan); border-bottom:1px solid var(--color-border); padding-bottom:10px;">' +
                    'Git Control: ' + item.name +
                '</h3>' +
                '<div id="git-loading-indicator" style="padding:60px; text-align:center; color:var(--neon-cyan);">' +
                    '<div class="vibe-typing-indicator">Analyzing the vessels...</div>' +
                '</div>' +
                '<div id="git-main-container"></div>' +
            '</div>';
        dialog.classList.add('visible');
    },

    populateFullUI: function(item, gitInfo, options = {}) {
        var loader = document.getElementById('git-loading-indicator');
        if (loader) loader.remove();

        var container = document.getElementById('git-main-container');
        if (!container) return;

        // B"H - Injecting the actual interactive elements
        container.innerHTML = 
            '<div class="git-toolbar" style="margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 10px;">' +
                '<button id="git-btn-refresh" class="secondary-btn">Scan</button>' +
                '<button id="git-btn-pull" class="secondary-btn">Pull (Overwrite)</button>' +
                '<div style="flex-grow:1;"></div>' +
                '<button onclick="window.gitStageAll()" class="secondary-btn">Stage All</button>' +
            '</div>' +
            '<div class="git-stage-container" style="display:flex; height:400px; gap:10px; border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden;">' +
                '<div class="git-col" style="flex:1; display: flex; flex-direction: column; background: rgba(0,0,0,0.2);">' +
                    '<div class="git-col-header" style="padding:10px; background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border);">Unstaged <span id="git-unstaged-count"></span></div>' +
                    '<div id="git-unstaged-list" style="flex-grow:1; overflow-y:auto; padding:5px;"></div>' +
                '</div>' +
                '<div class="git-col" style="flex:1; display: flex; flex-direction: column; background: rgba(0,0,0,0.2);">' +
                    '<div class="git-col-header" style="padding:10px; background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border);">Staged <span id="git-staged-count"></span></div>' +
                    '<div id="git-staged-list" style="flex-grow:1; overflow-y:auto; padding:5px;"></div>' +
                '</div>' +
            '</div>' +
            '<div class="commit-area" style="margin-top:15px; display: flex; flex-direction: column; gap: 10px;">' +
                '<textarea id="git-commit-msg" class="commit-message-input" style="width:100%; min-height:60px; background:#000; color:#fff; border:1px solid #333; padding:10px;" placeholder="B\"H - Enter commit message...">B"H\nManifesting changes.</textarea>' +
                '<div class="commit-actions" style="display: flex; justify-content: flex-end; gap: 10px;">' +
                    '<button class="secondary-btn" onclick="document.getElementById(\'generic-dialog\').classList.remove(\'visible\')">Close</button>' +
                    '<button id="git-commit-btn" class="primary-btn">Commit & Push All</button>' +
                '</div>' +
            '</div>';

        this._bindEvents(item, gitInfo, options);
        
        // Trigger initial list render
        import('./stage-manager.js').then(function(m) {
            m.GitStageManager.render();
        });
    },

    _bindEvents: function(item, gitInfo, options = {}) {
        var self = this;
        document.getElementById('git-btn-refresh').onclick = function() { self.showGitUI(item, gitInfo, true, options); };
        
        document.getElementById('git-btn-pull').onclick = async function() {
            var conf = await UI.showDialog({ title: "Pull", message: "Overwrite local files with remote?", okText: "Pull" });
            if (conf) {
                document.getElementById('generic-dialog').classList.remove('visible');
                import('../../file-operations.js').then(m => m.FileOperations.pullAndOverwrite(item, gitInfo));
            }
        };

        document.getElementById('git-commit-btn').onclick = async function() {
            var { GitStageManager } = await import('./stage-manager.js');
            GitStageManager.stageAll();
            
            var msg = document.getElementById('git-commit-msg').value.trim();
            if (!msg) return UI.showToast("Commit message required.", "warning");

            var staged = Array.from(GitStageManager.staged);
            var changes = {
                creations: staged.filter(i => i.status === 'added'),
                updates: staged.filter(i => i.status === 'modified'),
                deletions: staged.filter(i => i.status === 'deleted')
            };
            
            document.getElementById('generic-dialog').classList.remove('visible');
            var { GitCommit } = await import('../commit/core.js');
            await GitCommit.performCommit(item, gitInfo, changes, msg);
        };
    }
};