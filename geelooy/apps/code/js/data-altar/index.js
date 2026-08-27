// B"H
// FILE: js/data-altar/index.js

import { DOM, State } from '../state.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs/index.js';
import { AltarRender } from './render.js';

export const DataAltar = {
    liveDataObject: null,

    manifest(liveData) {
        this.liveDataObject = liveData;
        DOM.dataAltarContainer.innerHTML = ''; 
        const rootNode = AltarRender.createNode(this.liveDataObject, 'root', 'root', true);
        DOM.dataAltarContainer.appendChild(rootNode);
        this._attachEventListeners();
    },
    
    demanifest() {
        this.liveDataObject = null;
        DOM.dataAltarContainer.innerHTML = '';
        DOM.dataAltarContainer.classList.add('hidden'); 
    },
    
    _setDirty() {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !activeTab.isDirty) {
            activeTab.isDirty = true;
            Tabs.render();
        }
    },

     _attachEventListeners() {
        if (DOM.dataAltarContainer.dataset.listenerAttached) return;

        // Button clicks
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

        // Blurring
        DOM.dataAltarContainer.addEventListener('blur', e => {
            const target = e.target.closest('[contenteditable="true"], .altar-value');
            if (!target) return;
            const path = target.closest('.altar-node').dataset.path;
            
            if (target.classList.contains('altar-key')) {
                this._editKey(path, target.textContent);
            } else if (target.classList.contains('altar-value')) {
                this._editValue(path, target);
            }
        }, true);
        
        // Input (Resize + Preview)
        DOM.dataAltarContainer.addEventListener('input', e => {
            const target = e.target.closest('.altar-value');
            if (!target || target.tagName !== 'TEXTAREA') return;

            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
            
            const node = target.closest('.altar-node');
            const preview = node?.querySelector('.altar-preview');
            if (!preview) return;
            
            const newText = target.value; 
            const type = node.dataset.type;
            let previewText = newText;
            if (type === 'string') {
                previewText = `"${newText.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;
            }

            if (previewText.length > 50) {
                previewText = previewText.substring(0, 50) + '…';
            }
            preview.textContent = previewText;
        });

        // Tab Handling
        DOM.dataAltarContainer.addEventListener('keydown', e => {
            const target = e.target.closest('textarea.altar-value');
            if (!target) return;

            if (e.key === 'Tab') {
                e.preventDefault();
                const start = target.selectionStart;
                const end = target.selectionEnd;
                target.value = target.value.substring(0, start) + '\t' + target.value.substring(end);
                target.selectionStart = target.selectionEnd = start + 1;
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
        this._setDirty();
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
             const node = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
             if (node) node.querySelector('.altar-key').textContent = oldKeyName;
             UI.showToast(Array.isArray(parent) ? "Cannot rename array index." : "Key already exists.", "error");
             return;
        }

        const value = parent[oldKeyName];
        delete parent[oldKeyName];
        parent[cleanNewKey] = value;
        
        const node = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
        if (node) {
            const newPath = `${parentPath}.${cleanNewKey}`;
            node.dataset.path = newPath;
            node.querySelectorAll('[data-path]').forEach(el => el.dataset.path = newPath);
        }
        this._setDirty(); 
    },
    
     _editValue(path, element) {
        const newValue = element.value;
        const dataType = this._getPathValue(path)?.constructor;
        let castValue = newValue;
        
        try {
            if (dataType === Number) {
                const num = Number(newValue);
                // B"H - Safe Number Casting: If NaN, revert to 0 or keep as string if desired? 
                // We'll keep as 0 to be safe for JSON structure integrity.
                castValue = isNaN(num) ? 0 : num;
            }
            else if (dataType === Boolean) castValue = (newValue.toLowerCase() === 'true' || newValue === '1');
            else if (newValue === 'null') castValue = null;
            else if (newValue === 'undefined') castValue = undefined;
        } catch(e) { }

        this._updateData(path, castValue);
        
        // B"H - Add Visual Feedback
        element.classList.add('altar-flash');
        setTimeout(() => element.classList.remove('altar-flash'), 300);
    },

    _deleteProperty(path) {
        this._updateData(path, null, 'delete');
        const node = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
        if (node) node.remove();
    },

    async _addProperty(path) {
        const parent = this._getPathValue(path);
        const isArray = Array.isArray(parent);
        let newKey = isArray ? parent.length : await UI.showDialog({ title: "Enter New Key", hasInput: true, placeholder: "property_name" });

        if (newKey !== null && newKey !== '' && !parent.hasOwnProperty(newKey)) {
             parent[newKey] = null; 
             this._setDirty(); 
             
             const parentNode = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
             if(parentNode) {
                 const contentWrapper = parentNode.querySelector('.altar-content');
                 const newNode = AltarRender.createNode(null, newKey, `${path}.${newKey}`, true);
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
        
        const oldNode = DOM.dataAltarContainer.querySelector(`[data-path="${path}"]`);
        if(oldNode) {
            const key = path.substring(path.lastIndexOf('.') + 1);
            const newNode = AltarRender.createNode(newValue, key, path, true);
            oldNode.replaceWith(newNode);
        }
    }
};