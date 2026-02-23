// B"H
// FILE: js/ui/dialogs.js
import { DOM } from '../state.js';

export const UIDialogs = {
    showDialog({ title, message, hasInput = false, inputType = 'text', placeholder = '', inputValue = '', hasTextarea = false, textareaContent = '', okText = 'OK', cancelText = 'Cancel', contentHTML = '' }) {
        return new Promise(resolve => {
            const dialog = DOM.genericDialog;
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>${title}</h3>
                    ${message ? `<p>${message}</p>` : ''}
                    ${contentHTML}
                    ${hasInput ? `<input type="${inputType}" id="dialog-input" placeholder="${placeholder}" value="${inputValue}">` : ''}
                    ${hasTextarea ? `<textarea id="dialog-textarea" rows="5">${textareaContent}</textarea>` : ''}
                    <div class="dialog-button-bar" style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                        ${cancelText ? `<button class="secondary-btn" id="dialog-cancel-btn">${cancelText}</button>` : ''}
                        ${okText ? `<button class="primary-btn" id="dialog-ok-btn">${okText}</button>` : ''}
                    </div>
                </div>`;
            
            const cleanup = (val) => {
                dialog.classList.remove('visible');
                document.removeEventListener('keydown', handler);
                resolve(val);
            };

            const handler = (e) => {
                if (e.key === 'Escape') cleanup(null);
                if (e.key === 'Enter' && !hasTextarea && okText) cleanup(hasInput ? document.getElementById('dialog-input').value : true);
            };

            // B"H - Defensive checks for buttons to prevent "onclick of null"
            const okBtn = dialog.querySelector('#dialog-ok-btn');
            if (okBtn) {
                okBtn.onclick = () => cleanup(hasInput ? document.getElementById('dialog-input').value : (hasTextarea ? document.getElementById('dialog-textarea').value : true));
            }

            const cancelBtn = dialog.querySelector('#dialog-cancel-btn');
            if (cancelBtn) {
                cancelBtn.onclick = () => cleanup(null);
            }
            
            dialog.classList.add('visible');
            document.addEventListener('keydown', handler);
            const focusTarget = dialog.querySelector('input, textarea, button.primary-btn');
            if (focusTarget) focusTarget.focus();
        });
    }
};