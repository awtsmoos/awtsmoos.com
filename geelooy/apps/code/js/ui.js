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
    /*B"H*/
// ACTION: Replace the 'showDialog' method with this version, which can now handle two primary actions.

/**
 * Manifests a dialog, a chamber of choice. This evolved version can now conjure
 * two primary paths for the user (`okText` and `secondaryOk`), allowing for
 * more nuanced and powerful decisions, such as choosing between committing all
 * changes or only those already saved.
 * @param {object} options - The configuration for the dialog.
 * @param {string} options.title - The title text.
 * @param {string} [options.message] - The main message text.
 * @param {boolean} [options.hasInput=false] - If true, shows a text input.
 * @param {string} [options.inputType='text'] - The type for the input field.
 * @param {string} [options.placeholder=''] - The placeholder for the input.
 * @param {boolean} [options.hasTextarea=false] - If true, shows a textarea.
 * @param {string} [options.textareaContent=''] - Initial content for the textarea.
 * @param {string} [options.okText='OK'] - Text for the primary confirmation button.
 * @param {string} [options.cancelText='Cancel'] - Text for the cancellation button.
 * @param {string} [options.contentHTML=''] - Raw HTML to inject into the dialog body.
 * @param {object} [options.tertiary] - Configuration for a third, lesser button (e.g., discard).
 * @param {object} [options.secondaryOk] - Configuration for a second primary button.
 * @param {string} options.secondaryOk.text - The text for this second button.
 * @param {string} options.secondaryOk.actionKey - The value the promise will resolve with if clicked.
 * @returns {Promise<any>} Resolves with input value, `true` (for ok), `null` (for cancel), 'tertiary', or the secondaryOk actionKey.
 */
showDialog: ({ title, message, hasInput = false, inputType = 'text', placeholder = '', hasTextarea = false, textareaContent = '', okText = 'OK', cancelText = 'Cancel', contentHTML = '', tertiary = null, secondaryOk = null }) => {
    return new Promise(resolve => {
        const dialog = DOM.genericDialog;
        
        let tertiaryButtonHTML = '';
        if (tertiary) {
            tertiaryButtonHTML = `<button class="secondary-btn ${tertiary.class || ''}" id="dialog-tertiary-btn" style="margin-right: auto;">${tertiary.text}</button>`;
        }

        let secondaryOkButtonHTML = '';
        if (secondaryOk) {
            secondaryOkButtonHTML = `<button class="secondary-btn" id="dialog-secondary-ok-btn">${secondaryOk.text}</button>`;
        }

        dialog.innerHTML = `
            <div class="dialog-content" id="dialog-content">
                <h3>${title}</h3>
                ${message ? `<p>${message}</p>` : ''}
                ${contentHTML}
                ${hasInput ? `<input type="${inputType}" id="dialog-input" placeholder="${placeholder}">` : ''}
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

        const cleanupAndResolve = (value) => {
            dialog.classList.remove('visible');
            document.removeEventListener('keydown', keydownHandler);
            resolve(value);
        };

        const keydownHandler = (e) => {
            if (e.key === 'Escape') { cancelBtn?.click(); }
        };
        
        if (okBtn) okBtn.onclick = () => cleanupAndResolve(hasInput ? dialog.querySelector('#dialog-input').value : (hasTextarea ? dialog.querySelector('#dialog-textarea').value : true));
        if (cancelBtn) cancelBtn.onclick = () => cleanupAndResolve(null);
        if (tertiaryBtn) tertiaryBtn.onclick = () => cleanupAndResolve('tertiary');
        if (secondaryOkBtn) secondaryOkBtn.onclick = () => cleanupAndResolve(secondaryOk.actionKey);
        
        dialog.classList.add('visible');
        const input = dialog.querySelector('#dialog-input');
        const textarea = dialog.querySelector('#dialog-textarea');
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
        if (viewName !== 'editor') DOM.keyboardHelper.classList.remove('is-visible');
        DOM.editorWrapper.classList.add('hidden');
        DOM.previewer.classList.add('hidden');
        DOM.consoleHost.classList.add('hidden');
        DOM.emptyEditorMessage.classList.add('hidden');
	DOM.hexEditorWrapper.classList.add('hidden');
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
                
            case 'altar': DOM.dataAltarContainer.classList.remove('hidden'); break;
            case 'empty':
                DOM.emptyEditorMessage.classList.remove('hidden');
                break;
                
            case 'hex': DOM.hexEditorWrapper.classList.remove('hidden'); break;
        }
    },
    syncScroll: () => DOM.lineNumbers.scrollTop = DOM.editor.scrollTop
};