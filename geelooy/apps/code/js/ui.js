
// B"H
// FILE: code/js/ui.js

import { State, DOM } from './state.js';
import { ColorOrbs } from './visuals/color-orbs.js';
import { VisualSettings } from './visuals/settings.js';
import { ASTEngine } from './tools/ast-engine.js';

export const UI = {
    showLoading: (msg = 'Processing...') => {
        DOM.loadingOverlay.querySelector('span').textContent = msg;
        DOM.loadingOverlay.style.display = 'flex';
    },
    hideLoading: () => {
        DOM.loadingOverlay.style.display = 'none';
    },
    showToast: (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        DOM.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }, 10);
    },

    _taskStack: null,
    _ensureTaskStack() {
        if (this._taskStack) return;
        this._taskStack = document.createElement('div');
        this._taskStack.className = 'task-notification-stack';
        document.body.appendChild(this._taskStack);
    },

    startTask(taskId, label) {
        this._ensureTaskStack();
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-info">
                <span class="task-label">${label}</span>
                <span class="task-percent">0%</span>
            </div>
            <div class="task-progress-bg">
                <div class="task-progress-fill" style="width: 0%"></div>
            </div>
        `;
        this._taskStack.appendChild(card);
        State.activeTasks.set(taskId, { card, label });
        return taskId;
    },

    updateTask(taskId, progress, message = '') {
        const task = State.activeTasks.get(taskId);
        if (!task) return;
        const fill = task.card.querySelector('.task-progress-fill');
        const percent = task.card.querySelector('.task-percent');
        if (fill) fill.style.width = `${progress}%`;
        if (percent) percent.textContent = `${Math.round(progress)}%`;
        if (message) {
            const labelEl = task.card.querySelector('.task-label');
            if (labelEl) labelEl.textContent = message;
        }
    },

    endTask(taskId, status = 'success', message = '') {
        const task = State.activeTasks.get(taskId);
        if (!task) return;
        task.card.classList.add(status);
        if (message) task.card.querySelector('.task-label').textContent = message;
        const fill = task.card.querySelector('.task-progress-fill');
        const percent = task.card.querySelector('.task-percent');
        if (fill) fill.style.width = '100%';
        if (percent) percent.textContent = status === 'success' ? 'DONE' : 'ERROR';
        setTimeout(() => {
            task.card.classList.add('fading');
            setTimeout(() => {
                task.card.remove();
                State.activeTasks.delete(taskId);
            }, 500);
        }, 3000);
    },
    
    showDialog: ({ title, message, hasInput = false, inputType = 'text', placeholder = '', inputValue = '', hasTextarea = false, textareaContent = '', okText = 'OK', cancelText = 'Cancel', contentHTML = '', tertiary = null, secondaryOk = null }) => {
    return new Promise(resolve => {
        const dialog = DOM.genericDialog;
        let tertiaryButtonHTML = '';
        if (tertiary) tertiaryButtonHTML = `<button class="secondary-btn ${tertiary.class || ''}" id="dialog-tertiary-btn" style="margin-right: auto;">${tertiary.text}</button>`;
        let secondaryOkButtonHTML = '';
        if (secondaryOk) secondaryOkButtonHTML = `<button class="secondary-btn" id="dialog-secondary-ok-btn">${secondaryOk.text}</button>`;

        dialog.innerHTML = `
            <div class="dialog-content" id="dialog-content">
                <h3>${title}</h3>
                ${message ? `<p>${message}</p>` : ''}
                ${contentHTML}
                ${hasInput ? `<input type="${inputType}" id="dialog-input" placeholder="${placeholder}" value="${inputValue}">` : ''}
                ${hasTextarea ? `<textarea id="dialog-textarea" rows="5">${textareaContent}</textarea>` : ''}
                <div class="dialog-button-bar">
                    ${tertiaryButtonHTML}
                    ${cancelText ? `<button class="secondary-btn" id="dialog-cancel-btn">${cancelText}</button>` : ''}
                    ${secondaryOkButtonHTML}
                    ${okText ? `<button class="primary-btn" id="dialog-ok-btn">${okText}</button>` : ''}
                </div>
            </div>`;
        
        const okBtn = dialog.querySelector('#dialog-ok-btn');
        const cancelBtn = dialog.querySelector('#dialog-cancel-btn');
        const tertiaryBtn = dialog.querySelector('#dialog-tertiary-btn');
        const secondaryOkBtn = dialog.querySelector('#dialog-secondary-ok-btn');
        const inputEl = dialog.querySelector('#dialog-input');
        const textareaEl = dialog.querySelector('#dialog-textarea');

        const cleanupAndResolve = (value) => {
            dialog.classList.remove('visible');
            document.removeEventListener('keydown', keydownHandler);
            resolve(value);
        };

        const keydownHandler = (e) => {
            if (e.key === 'Escape') { e.preventDefault(); cancelBtn?.click(); }
            if (e.key === 'Enter') {
                if (textareaEl && document.activeElement === textareaEl && !e.ctrlKey) return; 
                e.preventDefault(); okBtn?.click();
            }
        };
        if (okBtn) okBtn.onclick = () => cleanupAndResolve(hasInput ? inputEl.value : (hasTextarea ? textareaEl.value : true));
        if (cancelBtn) cancelBtn.onclick = () => cleanupAndResolve(null);
        if (tertiaryBtn) tertiaryBtn.onclick = () => cleanupAndResolve('tertiary');
        if (secondaryOkBtn) secondaryOkBtn.onclick = () => cleanupAndResolve(secondaryOk.actionKey);
        dialog.classList.add('visible');
        if (inputEl) { inputEl.focus(); if (inputValue) inputEl.select(); } 
        else if (textareaEl) textareaEl.focus();
        else if (okBtn) okBtn.focus();
        document.addEventListener('keydown', keydownHandler);
    });
},

    updateLineNumbers: (errors = []) => {
        if (DOM.editorWrapper.classList.contains('hidden')) return;
        const text = DOM.editor.value;
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        const lines = text.split('\n');

        let foldableLines = [];
        // Only run AST check if we are NOT viewing folded code, to save perf,
        // or just accept that getFoldableLines ignores the string literal lines.
        if (VisualSettings.get('folding') && activeTab && activeTab.fileType === 'text') {
            try { 
                foldableLines = ASTEngine.getFoldableLines(text); 
            } catch(e) {}
        }

        const errorMap = new Map();
        errors.forEach(e => errorMap.set(e.line, e));

        let html = '';
        for (let i = 1; i <= lines.length; i++) {
            const lineText = lines[i-1];
            
            // B"H - New Detection logic for comment based fold markers
            const isActuallyFolded = lineText.match(/\/\* \[FOLD:\d+\] \*\//);
            const isFoldablePotential = foldableLines.includes(i);
            
            const markerClass = errorMap.has(i) ? 'lint-marker' : '';
            
            let foldIcon = '';
            if (isActuallyFolded) {
                // Expanding Point (Right Arrow) - Indicates currently folded
                foldIcon = `<span class="fold-gutter-icon folded" data-line="${i}" title="Expand" style="cursor:pointer; color:var(--neon-magenta); margin-right:5px; font-size:10px;">▶</span>`;
            } else if (isFoldablePotential) {
                // Contracting Point (Down Arrow) - Indicates can be folded
                foldIcon = `<span class="fold-gutter-icon potential" data-line="${i}" title="Fold" style="cursor:pointer; color:var(--neon-cyan); margin-right:5px; font-size:10px; opacity:0.8;">▼</span>`;
            } else {
                foldIcon = `<span style="display:inline-block; width:18px;"></span>`;
            }

            const title = errorMap.has(i) ? `title="${errorMap.get(i).message}"` : '';
            html += `<div class="${markerClass}" ${title} style="display:flex; align-items:center; justify-content:flex-end; padding-right:8px; height:24px;">${foldIcon}${i}</div>`;
        }
        DOM.lineNumbers.innerHTML = html;

        // Re-attach fold listener if missing
        if (!DOM.lineNumbers.dataset.foldListener) {
            DOM.lineNumbers.onclick = (e) => {
                const icon = e.target.closest('.fold-gutter-icon');
                if (icon) {
                    e.stopPropagation();
                    ASTEngine.toggleFoldAtLine(parseInt(icon.dataset.line));
                }
            };
            DOM.lineNumbers.dataset.foldListener = "true";
        }
        
        requestAnimationFrame(() => ColorOrbs.scanAndRender(DOM.lineNumbers));
    },
    
    switchView(viewName) { 
        if (viewName !== 'editor') DOM.keyboardHelper.classList.remove('is-visible');
        DOM.editorWrapper.classList.add('hidden');
        DOM.previewer.classList.add('hidden');
        DOM.consoleHost.classList.add('hidden');
        DOM.emptyEditorMessage.classList.add('hidden');
        DOM.hexEditorWrapper.classList.add('hidden');
        DOM.dataAltarContainer.classList.add('hidden');
        if (DOM.zipExplorerWrapper) DOM.zipExplorerWrapper.classList.add('hidden');
        const vibeWrapper = document.getElementById('vibe-editor-wrapper');
        if(vibeWrapper) vibeWrapper.classList.add('hidden');
        switch(viewName) {
            case 'editor': DOM.editorWrapper.classList.remove('hidden'); break;
            case 'preview': DOM.previewer.classList.remove('hidden'); break;
            case 'console': DOM.consoleHost.classList.remove('hidden'); break;
            case 'altar': DOM.dataAltarContainer.classList.remove('hidden'); break;
            case 'empty': DOM.emptyEditorMessage.classList.remove('hidden'); break;
            case 'hex': DOM.hexEditorWrapper.classList.remove('hidden'); break;
            case 'zip': if (DOM.zipExplorerWrapper) DOM.zipExplorerWrapper.classList.remove('hidden'); break;
            case 'vibe': if(vibeWrapper) vibeWrapper.classList.remove('hidden'); break;
        }
    },
    syncScroll: () => DOM.lineNumbers.scrollTop = DOM.editor.scrollTop
};
