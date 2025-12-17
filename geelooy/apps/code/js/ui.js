// B"H
// FILE: js/ui.js

import { DOM } from './state.js';
import { App } from './app.js'; 

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
    
    showDialog: ({ title, message, hasInput = false, inputType = 'text', placeholder = '', inputValue = '', hasTextarea = false, textareaContent = '', okText = 'OK', cancelText = 'Cancel', contentHTML = '', tertiary = null, secondaryOk = null }) => {
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
            if (e.key === 'Escape') { 
                e.preventDefault();
                cancelBtn?.click(); 
            }
            if (e.key === 'Enter') {
                if (textareaEl && document.activeElement === textareaEl && !e.ctrlKey) return; 
                e.preventDefault();
                okBtn?.click();
            }
        };
        
        if (okBtn) okBtn.onclick = () => cleanupAndResolve(hasInput ? inputEl.value : (hasTextarea ? textareaEl.value : true));
        if (cancelBtn) cancelBtn.onclick = () => cleanupAndResolve(null);
        if (tertiaryBtn) tertiaryBtn.onclick = () => cleanupAndResolve('tertiary');
        if (secondaryOkBtn) secondaryOkBtn.onclick = () => cleanupAndResolve(secondaryOk.actionKey);
        
        dialog.classList.add('visible');
        
        if (inputEl) {
            inputEl.focus();
            if (inputValue) inputEl.select();
        } else if (textareaEl) {
            textareaEl.focus();
        } else if (okBtn) {
            okBtn.focus();
        }

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
    
    switchView(viewName) { 
        if (viewName !== 'editor') DOM.keyboardHelper.classList.remove('is-visible');
        DOM.editorWrapper.classList.add('hidden');
        DOM.previewer.classList.add('hidden');
        DOM.consoleHost.classList.add('hidden');
        DOM.emptyEditorMessage.classList.add('hidden');
        DOM.hexEditorWrapper.classList.add('hidden');
        DOM.dataAltarContainer.classList.add('hidden');
        if (DOM.zipExplorerWrapper) DOM.zipExplorerWrapper.classList.add('hidden');

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
            case 'altar': 
                DOM.dataAltarContainer.classList.remove('hidden'); 
                break;
            case 'empty':
                DOM.emptyEditorMessage.classList.remove('hidden');
                break;
            case 'hex': 
                DOM.hexEditorWrapper.classList.remove('hidden'); 
                break;
            case 'zip':
                if (DOM.zipExplorerWrapper) DOM.zipExplorerWrapper.classList.remove('hidden');
                break;
        }
    },
    syncScroll: () => DOM.lineNumbers.scrollTop = DOM.editor.scrollTop
};