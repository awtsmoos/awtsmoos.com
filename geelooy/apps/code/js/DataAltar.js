// B"H
// FILE: js/DataAltar.js
// The INFINITELY MORE EXTREME Data Altar Engine v2

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
        const rootNode = this._createNode(this.liveDataObject, 'root', 'root');
        DOM.dataAltarContainer.appendChild(rootNode);
        this._attachEventListeners();
    },
    
    /**
     * Banishes the Altar from view.
     */
    demanifest() {
        this.liveDataObject = null;
        DOM.dataAltarContainer.innerHTML = '';
        UI.switchView('editor'); // Ensure we fall back to the editor view
    },

    /**
     * Recursively creates the interactive HTML for a given piece of data.
     */
    _createNode(data, key, path) {
        const type = this._getType(data);

        const container = document.createElement('div');
        container.className = 'altar-node';
        container.dataset.path = path;
        container.dataset.type = type;

        const row = document.createElement('div');
        row.className = 'altar-row';
        
        const keyEl = document.createElement('span');
        keyEl.className = 'altar-key';
        keyEl.textContent = `${key}:`;
        keyEl.contentEditable = (path !== 'root'); // Root key cannot be edited
        keyEl.spellcheck = false;
        
        row.appendChild(keyEl);

        if (type === 'object' || type === 'array') {
            const details = document.createElement('details');
            details.open = true;
            const summary = document.createElement('summary');
            summary.appendChild(row);
            summary.querySelector('.altar-key').insertAdjacentHTML('afterend', ` <span class="altar-brace">${type === 'object' ? '{' : '['}</span>`);
            
            for (const childKey in data) {
                details.appendChild(this._createNode(data[childKey], childKey, `${path}.${childKey}`));
            }
            
            const addBtn = this._createActionButton('+', 'add-property', 'Add Property', path);
            details.appendChild(addBtn);

            details.appendChild(document.createElement('br'));
            details.appendChild(document.createTextNode(type === 'object' ? '}' : ']'));
            container.appendChild(details);
        } else {
            const valueEl = this._createValueElement(data, type, path);
            row.appendChild(valueEl);
            container.appendChild(row);
        }
        
        if (path !== 'root') {
             const typeBtn = this._createActionButton('T', 'change-type', 'Change Type', path);
             const deleteBtn = this._createActionButton('×', 'delete-property', 'Delete Property', path);
             row.appendChild(typeBtn);
             row.appendChild(deleteBtn);
        }

        return container;
    },

    _createValueElement(data, type, path) {
        const valueEl = document.createElement('span');
        valueEl.className = 'altar-value';
        valueEl.contentEditable = true;
        valueEl.spellcheck = false;
        valueEl.textContent = (type === 'string') ? data : String(data);
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
        DOM.dataAltarContainer.addEventListener('click', e => {
            const target = e.target.closest('button.altar-action-btn');
            if (!target) return;

            const action = target.dataset.action;
            const path = target.dataset.path;

            switch (action) {
                case 'delete-property': this._deleteProperty(path); break;
                case 'add-property': this._addProperty(path); break;
                case 'change-type': this._changeType(path); break;
            }
        });

        DOM.dataAltarContainer.addEventListener('blur', e => {
            const target = e.target.closest('[contenteditable="true"]');
            if (!target) return;
            
            const path = target.closest('.altar-node').dataset.path;
            const newContent = target.textContent;
            
            if (target.classList.contains('altar-key')) {
                this._editKey(path, newContent);
            } else if (target.classList.contains('altar-value')) {
                this._editValue(path, newContent);
            }
        }, true); // Use capture phase to ensure we get the event
    },
    
    _updateData(path, value, action = 'set') {
        const keys = path.split('.').slice(1);
        let current = this.liveDataObject;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
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
        
        this.manifest(this.liveDataObject); // Re-manifest after every change
    },

    _getPathValue(path) {
        return path.split('.').slice(1).reduce((obj, key) => obj?.[key], this.liveDataObject);
    },
    
    _editKey(path, newKeyName) {
        const parentPath = path.substring(0, path.lastIndexOf('.'));
        const oldKeyName = path.substring(path.lastIndexOf('.') + 1);
        if (oldKeyName === newKeyName) return;

        const parent = this._getPathValue(parentPath);
        if (Array.isArray(parent)) return; // Cannot edit array indices

        const value = parent[oldKeyName];
        delete parent[oldKeyName];
        parent[newKeyName] = value;
        
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) activeTab.isDirty = true;
        
        this.manifest(this.liveDataObject);
    },
    
    _editValue(path, newValue) {
        const type = this._getPathValue(path).constructor;
        let castValue = newValue;
        try {
            if (type === Number) castValue = Number(newValue);
            else if (type === Boolean) castValue = (newValue.toLowerCase() === 'true');
            else if (newValue === 'null') castValue = null;
        } catch(e) {/* ignore cast error */}

        this._updateData(path, castValue);
    },

    _deleteProperty(path) {
        this._updateData(path, null, 'delete');
    },

    async _addProperty(path) {
        const parent = this._getPathValue(path);
        if (Array.isArray(parent)) {
            parent.push(null);
        } else {
            const newKey = await UI.showDialog({ title: "Enter New Key", hasInput: true, placeholder: "property_name" });
            if (newKey && !parent.hasOwnProperty(newKey)) {
                parent[newKey] = null;
            }
        }
        
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) activeTab.isDirty = true;
        
        this.manifest(this.liveDataObject);
    },
    
    _changeType(path) {
        const currentValue = this._getPathValue(path);
        let newValue;
        // Cycle: string -> number -> boolean -> null -> string
        switch (currentValue?.constructor) {
            case String: newValue = isNaN(Number(currentValue)) ? 0 : Number(currentValue); break;
            case Number: newValue = Boolean(currentValue); break;
            case Boolean: newValue = null; break;
            default: newValue = String(currentValue); break;
        }
        this._updateData(path, newValue);
    },

    _getType: value => {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }
};