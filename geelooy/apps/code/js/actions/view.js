
// B"H
// FILE: js/actions/view.js
import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs/index.js';
import { App } from '../app.js';
import { Editor } from '../editor.js';
import { FindReplace } from '../find-replace.js';
import { CommandPalette } from '../command-palette.js';
import { VisualSettings } from '../visuals/settings.js';
import { Help } from '../help.js';
import { ParticleSystem } from '../visuals/particle-system.js'; 

export const ViewActions = {
    toggleLineComment() { Editor.toggleComment(); },
    insertLineBefore() { Editor.insertLine('before'); },
    insertLineAfter() { Editor.insertLine('after'); },
    deleteLine() { Editor.deleteLine(); },
    goToLine() { Editor.promptGoToLine(); },
    
    showDocs() { Help.show(); },
    
    visualSettings() {
        const html = VisualSettings.getSettingsPanelHTML();
        UI.showDialog({
            title: "Visual Engine Configuration",
            contentHTML: html,
            okText: "Close",
            cancelText: ""
        });
        setTimeout(() => {
            const dialog = document.getElementById('generic-dialog');
            if (dialog) VisualSettings.bindEvents(dialog);
        }, 50);
    },

    toggleWordWrap() {
        const currentWrap = DOM.editor.style.whiteSpace;
        DOM.editor.style.whiteSpace = (currentWrap === 'pre-wrap') ? 'pre' : 'pre-wrap';
        UI.showToast(`Word Wrap: ${DOM.editor.style.whiteSpace === 'pre-wrap' ? 'ON' : 'OFF'}`, 'info');
    },

    _changeFontSize(delta) {
        const editor = DOM.editor;
        if (!editor) return;
        
        const style = window.getComputedStyle(editor);
        const currentSize = parseFloat(style.fontSize);
        const newSize = Math.max(10, Math.min(60, currentSize + delta)); 
        
        editor.style.fontSize = `${newSize}px`;
        const lineNums = document.getElementById('line-numbers');
        if (lineNums) lineNums.style.fontSize = `${newSize}px`;
        
        if (Editor.currentHighlighter) {
            Editor.currentHighlighter.refresh();
        }
        
        UI.showToast(`Font Size: ${newSize}px`, "info");
    },

    increaseFontSize() { this._changeFontSize(2); },
    decreaseFontSize() { this._changeFontSize(-2); },

    toggleTheme() {
        const body = document.body;
        if (body.classList.contains('theme-midnight')) {
            body.classList.remove('theme-midnight');
            body.classList.add('theme-matrix');
            UI.showToast("Theme: Matrix", "info");
        } else if (body.classList.contains('theme-matrix')) {
            body.classList.remove('theme-matrix');
            UI.showToast("Theme: Vivid Dark (Default)", "info");
        } else {
            body.classList.add('theme-midnight');
            UI.showToast("Theme: Midnight", "info");
        }
    },

    closeOtherTabs() {
        if (State.contextTabTarget) {
            const targetId = State.contextTabTarget.id;
            const tabsToClose = State.tabs.filter(t => t.id !== targetId);
            for (const t of tabsToClose) Tabs.close(t.id, true);
        }
    },

    closeAllTabs() {
        const allTabs = [...State.tabs];
        for (const t of allTabs) Tabs.close(t.id);
    },

    reopenClosedTab() { Tabs.reopenLastClosed(); },
    
    fileProperties(item) {
        if (item) {
            const info = `
                <strong>Name:</strong> ${item.name}<br>
                <strong>Path:</strong> ${item.path}<br>
                <strong>Type:</strong> ${item.kind} (${item.type})<br>
                <strong>Workspace:</strong> ${State.workspaces.find(w => w.id === (item.workspaceId||item.id))?.name || 'N/A'}
            `;
            UI.showDialog({ title: "Properties", contentHTML: info, okText: "Close", cancelText: "" });
        }
    },

    toggleKeyboardHelper() { DOM.keyboardHelper.classList.toggle("is-visible"); },
    
    // B"H - Delegated to FullscreenManager
    toggleFullscreen() { 
        import('../app/fullscreen-manager.js').then(m => m.FullscreenManager.toggleApp());
    },
    
    showSettings() { App.showSettings(); },
    findReplace() { FindReplace.show(); },
    commandPalette() { CommandPalette.toggle(); },
    zenMode() {
        document.body.classList.toggle('zen-mode');
        UI.showToast(document.body.classList.contains('zen-mode') ? "Zen Mode Active (Esc to exit)" : "Zen Mode Disabled", "info");
    }
};
