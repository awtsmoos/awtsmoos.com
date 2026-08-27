// B"H
// FILE: js/data-altar/render.js

export const AltarRender = {
    createNode(data, key, path, forceOpen = false) {
        const type = this.getType(data);
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
            if (type === 'string') {
                previewText = `"${previewText.replace(/\n/g, '\\n')}"`;
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
             const typeBtn = this.createActionButton('T', 'change-type', 'Change Data Type', path);
             const deleteBtn = this.createActionButton('×', 'delete-property', 'Delete Property', path);
             summary.appendChild(typeBtn);
             summary.appendChild(deleteBtn);
        }
        
        details.appendChild(summary);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'altar-content';

        if (isContainer) {
            for (const childKey in data) {
                contentWrapper.appendChild(this.createNode(data[childKey], childKey, `${path}.${childKey}`));
            }
            const addBtn = this.createActionButton('+', 'add-property', 'Add Property', path);
            contentWrapper.appendChild(addBtn);
        } else {
            contentWrapper.appendChild(this.createValueElement(data, type, path));
        }
        details.appendChild(contentWrapper);

        return details;
    },

    createValueElement(data, type, path) {
        const valueEl = document.createElement('textarea');
        valueEl.className = 'altar-value';
        valueEl.spellcheck = false;
        valueEl.rows = 1; 
        valueEl.value = String(data) || '';

        setTimeout(() => {
            valueEl.style.height = 'auto';
            valueEl.style.height = `${valueEl.scrollHeight}px`;
        }, 0);

        return valueEl;
    },
    
    createActionButton(text, action, title, path) {
        const btn = document.createElement('button');
        btn.className = `altar-action-btn action-${action}`;
        btn.dataset.action = action;
        btn.dataset.path = path;
        btn.title = title;
        btn.textContent = text;
        return btn;
    },

    getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }
};