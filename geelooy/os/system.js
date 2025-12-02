/*B"H*/

export default class System {
    path = null
    os = null

    constructor({ path, os } = {}) {
        this.path = path;
        this.os = os;
        
    }

    
    
    async save(program) {
        var content = program?.content();
        var fileName = program?.fileName();
        if (!fileName) return false;
        var path = this.path;
        if (!path) return;

        window.os = this.os;

        await this.os?.db.Koysayv(path, fileName, content);
        this.makeToast(`Saved ${fileName}`, "success");
        return true;
    }

    /**
     * @method makeToast
     * @description Creates a fleeting spark of information (Nitzotz) that rises and fades.
     * @param {string} text - The message.
     * @param {string} type - 'info', 'success', 'error'.
     */
    async makeToast(text, type = 'info') {
        let container = document.querySelector('.awtsmoos-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'awtsmoos-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `awtsmoos-toast ${type}`;
        toast.textContent = text;

        container.appendChild(toast);

        // Sound cues? (Optional expansion)
        
        // Remove after delay
        setTimeout(() => {
            
            
            toast.classList.add('removing');
            setTimeout(() => {
	            
	            toast.parentNode.removeChild(toast)
            }, 1000)
        }, 3500);
    }

    /**
     * @method prompt
     * @description Opens a vessel (Modal) to receive the user's Ratzon (Will/Input).
     * @param {string} message - The question.
     * @param {string} defaultValue - The initial state.
     * @returns {Promise<string|null>} - The user's input, or null if cancelled.
     */
    prompt(message, defaultValue = "") {
        return new Promise((resolve) => {
            this._createModal({
                title: message,
                hasInput: true,
                defaultValue,
                confirmText: "OK",
                onConfirm: (val) => resolve(val),
                onCancel: () => resolve(null)
            });
        });
    }

    /**
     * @method confirm
     * @description Opens a binary vessel (Yes/No) to determine the path forward.
     * @param {string} message - The query.
     * @returns {Promise<boolean>} - True if confirmed, false otherwise.
     */
    confirm(message) {
        return new Promise((resolve) => {
            this._createModal({
                title: message,
                hasInput: false,
                confirmText: "Yes",
                cancelText: "No",
                isDanger: true, // Often used for delete
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    /**
     * @private
     * @method _createModal
     * @description Internal builder of the vessel.
     */
    _createModal({ title, hasInput, defaultValue, confirmText, cancelText = "Cancel", isDanger, onConfirm, onCancel }) {
        const overlay = document.createElement('div');
        overlay.className = 'awtsmoos-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'awtsmoos-modal';

        const titleEl = document.createElement('div');
        titleEl.className = 'awtsmoos-modal-title';
        titleEl.textContent = title;

        let inputEl = null;
        if (hasInput) {
            inputEl = document.createElement('input');
            inputEl.className = 'awtsmoos-modal-input';
            inputEl.value = defaultValue;
            inputEl.type = "text";
        }

        const btnContainer = document.createElement('div');
        btnContainer.className = 'awtsmoos-modal-buttons';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'awtsmoos-btn awtsmoos-btn-secondary';
        cancelBtn.textContent = cancelText;
        cancelBtn.onclick = () => {
            close();
            onCancel();
        };

        const okBtn = document.createElement('button');
        okBtn.className = `awtsmoos-btn ${isDanger ? 'awtsmoos-btn-danger' : 'awtsmoos-btn-primary'}`;
        okBtn.textContent = confirmText;
        okBtn.onclick = () => {
            const val = inputEl ? inputEl.value : true;
            close();
            onConfirm(val);
        };

        const close = () => {
            overlay.style.animation = 'fadeIn 0.2s reverse forwards'; // Fade out
            setTimeout(() => overlay.remove(), 200);
        };

        // Append Logic
        modal.appendChild(titleEl);
        if (inputEl) {
            modal.appendChild(inputEl);
            // Focus input on mount
            setTimeout(() => inputEl.focus(), 50);
            inputEl.onkeydown = (e) => {
                if (e.key === 'Enter') okBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            };
        }
        
        btnContainer.appendChild(cancelBtn);
        btnContainer.appendChild(okBtn);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Handle overlay click to cancel
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                close();
                onCancel();
            }
        };
    }
    
    // Static helper to bridge legacy calls if needed, though instance is preferred
    static makeToast(text) {
        new System().makeToast(text);
    }
}