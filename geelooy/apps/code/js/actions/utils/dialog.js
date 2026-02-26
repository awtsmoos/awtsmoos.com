
// B"H
/**
 * @file dialog.js
 * @brief THE GATES OF COMMUNICATION.
 * Completely replaces crude native popups (alert/prompt/confirm) with glorious pure DOM data-driven modals.
 */

export class Dialog {
    static _createNode(schema) {
        if (!schema) return null;
        if (typeof schema === 'string') return document.createTextNode(schema);
        const el = document.createElement(schema.tag || 'div');
        if (schema.cls) el.className = schema.cls;
        if (schema.id) el.id = schema.id;
        if (schema.text) el.textContent = schema.text;
        if (schema.type) el.type = schema.type;
        if (schema.value) el.value = schema.value;
        if (schema.style) Object.assign(el.style, schema.style);
        if (schema.events) {
            Object.entries(schema.events).forEach(([k, v]) => el.addEventListener(k, v));
        }
        if (schema.children) {
            schema.children.forEach(c => el.appendChild(this._createNode(c)));
        }
        return el;
    }

    static _buildBaseOverlay() {
        return this._createNode({
            cls: 'awtsmoos-dialog-overlay',
            style: {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '999999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(3px)'
            }
        });
    }

    static _buildBox() {
        return {
            cls: 'awtsmoos-dialog-box',
            style: {
                background: '#15151e', border: '1px solid #00ffcc', borderRadius: '8px',
                padding: '24px', minWidth: '350px', color: '#fff',
                fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.7)'
            },
            children:[]
        };
    }

    static async prompt(message, defaultValue = "") {
        return new Promise(resolve => {
            const overlay = this._buildBaseOverlay();
            let inputValue = defaultValue;

            const submit = () => {
                document.body.removeChild(overlay);
                resolve(inputValue);
            };

            const cancel = () => {
                document.body.removeChild(overlay);
                resolve(null);
            };

            const box = this._buildBox();
            box.children.push(
                { tag: 'h3', text: 'Input Required', style: { margin: '0', color: '#00ffcc' } },
                { tag: 'p', text: message, style: { fontSize: '14px', margin: '0' } },
                {
                    tag: 'input', type: 'text', value: defaultValue,
                    style: { padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', outline: 'none' },
                    events: {
                        input: e => { inputValue = e.target.value; },
                        keydown: e => { if(e.key === 'Enter') submit(); if(e.key === 'Escape') cancel(); }
                    }
                },
                {
                    style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
                    children:[
                        { tag: 'button', text: 'Cancel', style: { padding: '6px 14px', cursor: 'pointer', background: 'transparent', color: '#aaa', border: 'none' }, events: { click: cancel } },
                        { tag: 'button', text: 'Confirm', style: { padding: '6px 14px', cursor: 'pointer', background: '#00ffcc', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }, events: { click: submit } }
                    ]
                }
            );

            overlay.appendChild(this._createNode(box));
            document.body.appendChild(overlay);
            overlay.querySelector('input').focus();
        });
    }

    static async confirm(message) {
        return new Promise(resolve => {
            const overlay = this._buildBaseOverlay();
            
            const submit = (result) => {
                document.body.removeChild(overlay);
                resolve(result);
            };

            const box = this._buildBox();
            box.children.push(
                { tag: 'h3', text: 'Confirm Action', style: { margin: '0', color: '#ffae57' } },
                { tag: 'p', text: message, style: { fontSize: '14px', margin: '0', whiteSpace: 'pre-wrap' } },
                {
                    style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
                    children:[
                        { tag: 'button', text: 'Cancel', style: { padding: '6px 14px', cursor: 'pointer', background: 'transparent', color: '#aaa', border: 'none' }, events: { click: () => submit(false) } },
                        { tag: 'button', text: 'Yes, Proceed', style: { padding: '6px 14px', cursor: 'pointer', background: '#ffae57', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }, events: { click: () => submit(true) } }
                    ]
                }
            );

            overlay.appendChild(this._createNode(box));
            document.body.appendChild(overlay);
        });
    }

    static async alert(message) {
        return new Promise(resolve => {
            const overlay = this._buildBaseOverlay();
            const submit = () => { document.body.removeChild(overlay); resolve(); };

            const box = this._buildBox();
            box.children.push(
                { tag: 'h3', text: 'System Notice', style: { margin: '0', color: '#ff6666' } },
                { tag: 'p', text: message, style: { fontSize: '14px', margin: '0', whiteSpace: 'pre-wrap' } },
                {
                    style: { display: 'flex', justifyContent: 'flex-end' },
                    children:[ { tag: 'button', text: 'Acknowledge', style: { padding: '6px 14px', cursor: 'pointer', background: '#ff6666', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }, events: { click: submit } } ]
                }
            );

            overlay.appendChild(this._createNode(box));
            document.body.appendChild(overlay);
        });
    }
}
