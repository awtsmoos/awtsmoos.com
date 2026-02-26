
//B"H
// FILE: js/ui.js
import { DOM } from './state.js';
import { UINotifications } from './ui/notifications.js';
import { UIDialogs } from './ui/dialogs.js';
import { ASTEngine } from './tools/ast-engine.js';
import { ColorOrbs } from './visuals/color-orbs.js';
import { VisualSettings } from './visuals/settings.js';

export const UI = {
    showLoading: (msg = 'Processing...') => {
        DOM.loadingOverlay.querySelector('span').textContent = msg;
        DOM.loadingOverlay.style.display = 'flex';
    },
    hideLoading: () => DOM.loadingOverlay.style.display = 'none',
    
    showToast: (msg, type, dur) => UINotifications.showToast(msg, type, dur),
    startTask: (id, lbl) => UINotifications.startTask(id, lbl),
    updateTask: (id, prog, msg) => UINotifications.updateTask(id, prog, msg),
    endTask: (id, stat, msg) => UINotifications.endTask(id, stat, msg),
    
    showDialog: (cfg) => UIDialogs.showDialog(cfg),

    updateLineNumbers(errors =[]) {
        if (DOM.editorWrapper.classList.contains('hidden')) return;
        const text = DOM.editor.value;
        const lines = text.split('\n');
        let foldable = VisualSettings.get('folding') ? ASTEngine.getFoldableLines(text) : [];
        const errorMap = new Map(errors.map(e =>[e.line, e]));

        let html = '';
        for (let i = 1; i <= lines.length; i++) {
            const lineText = lines[i-1];
            const isActuallyFolded = lineText.match(/\/\* \[FOLD:\d+\] \*\//);
            const canFold = foldable.includes(i);
            const cls = errorMap.has(i) ? 'lint-marker' : '';
            
            let foldIcon = '';
            if (isActuallyFolded) {
                foldIcon = `<span class="fold-gutter-icon folded" data-line="${i}">▶</span>`;
            } else if (canFold) {
                foldIcon = `<span class="fold-gutter-icon potential" data-line="${i}">▼</span>`;
            }

            html += `<div class="${cls}" style="height:24px; display:flex; align-items:center; justify-content:flex-end; padding-right:8px;">
                <span style="display:inline-block; width:18px;">${foldIcon}</span>${i}</div>`;
        }
        DOM.lineNumbers.innerHTML = html;
        requestAnimationFrame(() => ColorOrbs.scanAndRender(DOM.lineNumbers));
    },

    switchView: function(view) {
        var panels =[
            'editor-wrapper', 'previewer', 'console-host', 
            'empty-editor-message', 'hex-editor-wrapper', 
            'data-altar-container', 'zip-editor-wrapper', 
            'vibe-editor-wrapper', 'vibe-manager-wrapper',
            'file-commander-wrapper', 'terminal-wrapper',
            'devtools-wrapper' // B"H - Added DevTools to the hidden list
        ];
        
        for (var i = 0; i < panels.length; i++) {
            var el = document.getElementById(panels[i]);
            if (el) el.classList.add('hidden');
        }
        
        var idMap = {
            'editor': 'editor-wrapper',
            'preview': 'previewer',
            'vibe': 'vibe-editor-wrapper',
            'hex': 'hex-editor-wrapper',
            'zip': 'zip-editor-wrapper',
            'altar': 'data-altar-container',
            'empty': 'empty-editor-message',
            'commander': 'file-commander-wrapper',
            'terminal': 'terminal-wrapper',
            'devtools': 'devtools-wrapper' // B"H - Map shortcut
        };

        var targetId = idMap[view] || view;
        var targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.remove('hidden');
        
        var minimap = document.getElementById('minimap-canvas');
        if (minimap) minimap.classList.toggle('hidden', view !== 'editor');
    },

    syncScroll: () => DOM.lineNumbers.scrollTop = DOM.editor.scrollTop
};
