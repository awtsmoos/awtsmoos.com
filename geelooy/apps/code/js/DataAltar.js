// B"H
// FILE: js/DataAltar.js
// The EXTREMELY INTENSE Data Altar Engine v3 (Targeted DOM Update Edition)

import { DOM, State } from './state.js';
import { UI } from './ui.js';

export const DataAltar = {
    liveDataObject: null,

    /**
     * Manifests the Altar UI from a live JavaScript object.
     */
    manifest(liveData) {
        this.liveDataObject = liveData;
        DOM.dataAltarContainer.innerHTML = ''; // Cleanse the chamber
        // The root node is special; it's always an object and starts expanded.
        const rootNode = this._createNode(this.liveDataObject, 'root', 'root', true);
        DOM.dataAltarContainer.appendChild(rootNode);
        // Event listeners are now attached once to the container for efficiency.
        this._attachEventListeners();
    },
    
    /**
     * Banishes the Altar from view.
     */
    demanifest() {
        this.liveDataObject = null;
        DOM.dataAltarContainer.innerHTML = '';
        DOM.dataAltarContainer.classList.add('hidden'); // Ensure it's hidden
        // Detach listeners if you want to be extra clean, but it's not strictly necessary
    },

    /**
     * Recursively creates the interactive HTML for a given piece of data.
     * This is the heart of the new "intense" version.
     */
     _createNode(data, key, path, forceOpen = false) {
        const type = this._getType(data);
        const isContainer = type === 'object' || type === 'array';

        const details = document.createElement('details');
        details.className = 'altar-node';
        details.dataset.path = path;
        details.dataset.type = type;
        details.open = forceOpen || (isContainer && type !== 'array');

        const summary = document.createElement('summary');
        summary.className = 'altar-row';

        const keyEl = document.createElement('span');
        keyEl.className = 'altar-key';
        keyEl.textContent = key;
        keyEl.contentEditable = (path !== 'root');
        keyEl.spellcheck = false;
        
        summary.appendChild(keyEl);
        summary.insertAdjacentHTML('beforeend', '<span class="altar-colon">:</span>');

        const previewEl = document.createElement('span');
        previewEl.className = 'altar-preview';
        if (!isContainer) {
            let previewText = String(data);
            // B"H --- FIX IS HERE: Show \n in preview ---
            if (type === 'string') {
                previewText = `"${previewText.replace(/\n/g, '\\n')}"`; // Show literal \n
            }
            if (previewText.length > 50) {
                previewText = previewText.substring(0, 50) + '…';
            }
            previewEl.textContent = previewText;
        } else {
            const braceOpen = type === 'object' ? '{' : '[';
            const braceClose = type === 'object' ? '}' : ']';
            const count = Object.keys(data).length;
            previewEl.innerHTML = `<span class="altar-brace">${braceOpen}</span> <span class="altar-count">${count} item${count === 1 ? '' : 's'}</span> <span class="altar-brace">${braceClose}</span>`;
        }
        summary.appendChild(previewEl);
        
        if (path !== 'root') {
             const typeBtn = this._createActionButton('T', 'change-type', 'Change Data Type', path);
             const deleteBtn = this._createActionButton('×', 'delete-property', 'Delete Property', path);
             summary.appendChild(typeBtn);
             summary.appendChild(deleteBtn);
        }
        
        details.appendChild(summary);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'altar-content';

        if (isContainer) {
            for (const childKey in data) {
                contentWrapper.appendChild(this._createNode(data[childKey], childKey, `${path}.${childKey}`));
            }
            const addBtn = this._createActionButton('+', 'add-property', 'Add Property', path);
            contentWrapper.appendChild(addBtn);
        } else {
            contentWrapper.appendChild(this._createValueElement(data, type, path));
        }
        details.appendChild(contentWrapper);

        return details;
    },
    
    _getTrueTextContent(element) {
        let text = '';
        // The childNodes list gives us both text and <br> elements.
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                // If it's a piece of text, add it.
                text += node.textContent;
            } else if (node.nodeName === 'BR') {
                // If it's a <br> tag, add a newline character.
                text += '\n';
            }
        });
        return text;
    },

    _createValueElement(data, type, path) {
        const valueEl = document.createElement('span');
        valueEl.className = 'altar-value';
        valueEl.contentEditable = true;
        valueEl.spellcheck = false;

        // THE FIX: Convert data with '\n' into visible HTML with '<br>' for rendering.
        const stringData = String(data) || '';
        valueEl.innerHTML = stringData.replace(/\n/g, '<br>');

        // If the element is completely empty, add a single <br> to ensure it has height
        // and that the cursor has a stable place to start, fixing the "first press" bug.
        if (valueEl.innerHTML === '') {
            valueEl.innerHTML = '<br>';
        }
        
        return valueEl;
    },
    
    _createActionButton(text, action, title, path) {
        const btn = document.createElement('button');
        btn.className = `altar-action-btn action-${action}`;
        btn.dataset.action = action;
        btn.dataset.path = path;
        btn.title = title;
        btn.textContent = text;
        return btn;
    },

    _attachEventListeners() {
        if (DOM.dataAltarContainer.dataset.listenerAttached) return;

        // Handles button clicks (delete, add, change type)
        DOM.dataAltarContainer.addEventListener('click', e => {
            const target = e.target.closest('button.altar-action-btn');
            if (!target) return;
            e.preventDefault();
            const action = target.dataset.action;
            const path = target.dataset.path;
            switch (action) {
                case 'delete-property': this._deleteProperty(path); break;
                case 'add-property': this._addProperty(path); break;
                case 'change-type': this._promptForTypeChange(path); break;
            }
        });

        // Handles committing data when you click away
        DOM.dataAltarContainer.addEventListener('blur', e => {
            const target = e.target.closest('[contenteditable="true"]');
            if (!target) return;
            const path = target.closest('.altar-node').dataset.path;
            if (target.classList.contains('altar-key')) {
                this._editKey(path, target.textContent);
            } else if (target.classList.contains('altar-value')) {
                // We now pass the element itself, not just its text content.
                this._editValue(path, target);
            }
        }, true);
        
        // Handles REAL-TIME preview updates as you type, cut, or paste
        DOM.dataAltarContainer.addEventListener('input', e => {
            const target = e.target.closest('.altar-value[contenteditable="true"]');
            if (!target) return;
            const node = target.closest('.altar-node');
            const preview = node?.querySelector('.altar-preview');
            if (!preview) return;

            // THE FIX: Use the browser's reliable 'innerText' property.
            let newText = target.innerText;
            
            // EDGE CASE FIX: If the editor only contains a single line break,
            // innerText can be an empty string. We correct this.
            if (target.innerHTML === '<br>') {
                newText = '\n';
            }

            const type = node.dataset.type;
            let previewText = newText;
            if (type === 'string') {
                // Now correctly handles tabs as well for the preview.
                previewText = `"${newText.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;
            }

            if (previewText.length > 50) {
                previewText = previewText.substring(0, 50) + '…';
            }
            preview.textContent = previewText;
        });

        // Handles inserting \n and \t correctly.
        DOM.dataAltarContainer.addEventListener('keydown', e => {
            const target = e.target.closest('[contenteditable="true"]');
            if (!target) return;

            if (e.key === 'Enter' && !e.shiftKey) {
                // This is the definitive fix. We abandon the unreliable execCommand.
                e.preventDefault();

                // Get the current cursor position (the selection).
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);

                // Delete any selected text, just in case.
                range.deleteContents();

                // Create a <br> element ourselves. We are now in full control.
                const br = document.createElement('br');
                range.insertNode(br);

                // CRITICAL: We must manually move the cursor to be *after* the new <br>.
                // This creates a stable position for the next keypress and ensures the visual line break.
                range.setStartAfter(br);
                range.collapse(true);

                // Apply our new cursor position to the document's selection.
                selection.removeAllRanges();
                selection.addRange(range);

                // Manually trigger the 'input' event so our real-time preview updates instantly.
                target.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            if (e.key === 'Tab') {
                e.preventDefault();
                // execCommand is reliable for simple text insertion, so we keep it here.
                document.execCommand('insertText', false, '\t');
                // Manually trigger the input event for the tab character.
                target.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        DOM.dataAltarContainer.dataset.listenerAttached = 'true';
    },
    
    _updateData(path, value, action = 'set') {
        const keys = path.split('.').slice(1);
        let current = this.liveDataObject;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current?.[keys[i]];
        }
        if (!current) return;

        const finalKey = keys[keys.length - 1];
        if (action === 'set') {
            current[finalKey] = value;
        } else if (action === 'delete') {
            if (Array.isArray(current)) {
                current.splice(Number(finalKey), 1);
            } else {
                delete current[finalKey];
            }
        }
        
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) activeTab.isDirty = true;
    },

    _getPathValue(path) {
        return path.split('.').slice(1).reduce((obj, key) => obj?.[key], this.liveDataObject);
    },
    
    _editKey(path, newKeyName) {
        const cleanNewKey = newKeyName.trim();
        const parentPath = path.substring(0, path.lastIndexOf('.'));
        const oldKeyName = path.substring(path.lastIndexOf('.') + 1);
        if (oldKeyName === cleanNewKey) return;

        const parent = this._getPathValue(parentPath);
        if (Array.isArray(parent) || !parent || parent.hasOwnProperty(cleanNewKey)) {
             // Revert in UI if invalid
             const node = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
             if (node) node.querySelector('.altar-key').textContent = oldKeyName;
             UI.showToast(Array.isArray(parent) ? "Cannot rename array index." : "Key already exists.", "error");
             return;
        }

        const value = parent[oldKeyName];
        delete parent[oldKeyName];
        parent[cleanNewKey] = value;
        
        // Targeted DOM Update
        const node = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
        if (node) {
            const newPath = `${parentPath}.${cleanNewKey}`;
            node.dataset.path = newPath;
            // Update paths of all action buttons on this node
            node.querySelectorAll('[data-path]').forEach(el => el.dataset.path = newPath);
        }
        
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) activeTab.isDirty = true;
    },
    
    _editValue(path, element) {
        // THE FIX: Use innerText here as well for consistency.
        let newValue = element.innerText;

        // EDGE CASE FIX: Ensure a single newline is saved correctly.
        if (element.innerHTML === '<br>') {
            newValue = '\n';
        }

        const dataType = this._getPathValue(path)?.constructor;
        let castValue = newValue;
        try {
            if (dataType === Number) castValue = Number(newValue);
            else if (dataType === Boolean) castValue = (newValue.toLowerCase() === 'true' || newValue === '1');
            else if (newValue === 'null') castValue = null;
            else if (newValue === 'undefined') castValue = undefined;
        } catch(e) { /* ignore cast error */ }

        this._updateData(path, castValue);
    },

    _deleteProperty(path) {
        this._updateData(path, null, 'delete');
        // Targeted DOM Update: Just remove the element.
        const node = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
        if (node) node.remove();
        // We might need to refresh the parent's count here, but for now this is a huge improvement.
    },

    async _addProperty(path) {
        const parent = this._getPathValue(path);
        const isArray = Array.isArray(parent);
        let newKey = isArray ? parent.length : await UI.showDialog({ title: "Enter New Key", hasInput: true, placeholder: "property_name" });

        if (newKey !== null && newKey !== '' && !parent.hasOwnProperty(newKey)) {
             parent[newKey] = null; // Add a null value by default
             const activeTab = State.tabs.find(t => t.id === State.activeTabId);
             if (activeTab) activeTab.isDirty = true;
             
             // Targeted DOM Update
             const parentNode = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
             if(parentNode) {
                 const contentWrapper = parentNode.querySelector('.altar-content');
                 const newNode = this._createNode(null, newKey, `${path}.${newKey}`, true);
                 // Insert before the 'add' button
                 contentWrapper.insertBefore(newNode, contentWrapper.lastChild);
             }
        }
    },
    
    async _promptForTypeChange(path) {
        const typeChoice = await UI.showDialog({
            title: 'Transmute Data Type',
            contentHTML: `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button class="menu-button" data-type="string">String</button>
                    <button class="menu-button" data-type="number">Number</button>
                    <button class="menu-button" data-type="boolean">Boolean</button>
                    <button class="menu-button" data-type="null">Null</button>
                    <button class="menu-button" data-type="array">Array</button>
                    <button class="menu-button" data-type="object">Object</button>
                </div>`,
            okText: '',
            cancelText: 'Cancel'
        });

        if (typeChoice) {
            this._changeType(path, typeChoice);
        }
    },

    _changeType(path, newType) {
        const currentValue = this._getPathValue(path);
        let newValue;

        switch (newType) {
            case 'string': newValue = String(currentValue ?? ''); break;
            case 'number': newValue = Number(currentValue) || 0; break;
            case 'boolean': newValue = Boolean(currentValue); break;
            case 'null': newValue = null; break;
            case 'array': newValue = Array.isArray(currentValue) ? currentValue : []; break;
            case 'object': newValue = (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) ? currentValue : {}; break;
            default: return;
        }
        
        this._updateData(path, newValue);
        
        // Targeted DOM Update: Replace the old node with a completely new one.
        const oldNode = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
        if(oldNode) {
            const key = path.substring(path.lastIndexOf('.') + 1);
            const newNode = this._createNode(newValue, key, path, true);
            oldNode.replaceWith(newNode);
        }
    },

    _getType: value => {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }
};