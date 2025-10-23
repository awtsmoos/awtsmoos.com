// B"H
// FILE: js/ui.js

import { DOM } from './state.js';
import { App } from './app.js'; // Needed for getTabString

/**
 * UI Module: Handles all UI updates like dialogs, toasts, and loading indicators.
 */
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
    showDialog: ({ title, message, hasInput = false, inputType = 'text', placeholder = '', hasTextarea = false, textareaContent = '', okText = 'OK', cancelText = 'Cancel', contentHTML = '' }) => {
        return new Promise(resolve => {
            const dialog = DOM.genericDialog;
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>${title}</h3>
                    ${message ? `<p>${message}</p>` : ''}
                    <div id="dialog-content-slot">${contentHTML}</div>
                    ${hasInput ? `<input type="${inputType}" id="dialog-input" placeholder="${placeholder}">` : ''}
                    ${hasTextarea ? `<textarea id="dialog-textarea" rows="5">${textareaContent}</textarea>` : ''}
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                        ${cancelText ? `<button class="secondary-btn" id="dialog-cancel-btn">${cancelText}</button>` : ''}
                        ${okText ? `<button class="primary-btn" id="dialog-ok-btn">${okText}</button>` : ''}
                    </div>
                </div>`;
            
            const input = dialog.querySelector('#dialog-input');
            const textarea = dialog.querySelector('#dialog-textarea');
            const okBtn = dialog.querySelector('#dialog-ok-btn');
            const cancelBtn = dialog.querySelector('#dialog-cancel-btn');
            const contentSlot = dialog.querySelector('#dialog-content-slot');

            const cleanupAndResolve = (value) => {
                dialog.classList.remove('visible');
                document.removeEventListener('keydown', keydownHandler);
                resolve(value);
            };

            const keydownHandler = (e) => {
                if (e.key === 'Enter' && hasInput && !hasTextarea) { e.preventDefault(); okBtn?.click(); }
                else if (e.key === 'Escape') { cancelBtn?.click(); }
            };
            
            // This handles clicks inside the main dialog area, like on the workspace list
            contentSlot.onclick = (e) => {
                const button = e.target.closest('button[data-ws-id]');
                if (button) {
                    cleanupAndResolve(button.dataset.wsId);
                }
            };
            
            dialog.onclick = (e) => {
                if (e.target === dialog) cancelBtn?.click();
            };

            if (okBtn) okBtn.onclick = () => cleanupAndResolve(hasInput ? input.value : (hasTextarea ? textarea.value : true));
            if (cancelBtn) cancelBtn.onclick = () => cleanupAndResolve(null);
            
            dialog.classList.add('visible');
            if (input) input.focus();
            if (textarea) textarea.focus();
            document.addEventListener('keydown', keydownHandler);
        });
    },
    updateLineNumbers: () => {
        if (DOM.editorWrapper.classList.contains('hidden')) return;
        const lineCount = DOM.editor.value.split('\n').length || 1;
        const numbersText = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
        if (DOM.lineNumbers.innerText !== numbersText) {
            DOM.lineNumbers.innerText = numbersText;
        }
    },
    
    switchView(viewName) { // Can be 'editor', 'preview', 'console', or 'empty'
        DOM.editorWrapper.classList.add('hidden');
        DOM.previewer.classList.add('hidden');
        DOM.consoleHost.classList.add('hidden');
        DOM.emptyEditorMessage.classList.add('hidden');

        switch(viewName) {
            case 'editor':
                DOM.editorWrapper.classList.remove('hidden');
                break;
            case 'preview':
                DOM.previewer.classList.remove('hidden');
                break;
            case 'console':
                DOM.consoleHost.classList.remove('hidden');
                break;
            case 'empty':
                DOM.emptyEditorMessage.classList.remove('hidden');
                break;
        }
    },
    syncScroll: () => DOM.lineNumbers.scrollTop = DOM.editor.scrollTop
};