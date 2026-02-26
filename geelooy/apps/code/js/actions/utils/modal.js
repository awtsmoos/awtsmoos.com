
// B"H
/**
 * @file modal.js
 * @brief A pure DOM-based modal system, annihilating the use of native window.prompt.
 */

import { HTML } from '../../../html-generator.js';

export const ActionModal = {
    _createOverlay() {
        return HTML({
            style: {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: '999999',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backdropFilter: 'blur(8px)'
            }
        });
    },

    _createButton(text, isPrimary, onClick) {
        return HTML({
            tag: 'button', text: text,
            style: {
                padding: '8px 16px', cursor: 'pointer', borderRadius: '6px', border: 'none',
                background: isPrimary ? 'var(--neon-cyan, #0ff)' : '#333',
                color: isPrimary ? '#000' : '#fff',
                fontWeight: isPrimary ? 'bold' : 'normal',
                fontFamily: 'inherit', fontSize: '14px'
            },
            events: { click: onClick }
        });
    },

    /**
     * B"H - A custom, asynchronous prompt.
     */
    prompt(message, defaultValue = "") {
        return new Promise(resolve => {
            const overlay = this._createOverlay();
            let inputEl;

            const submit = () => {
                const val = inputEl.value;
                document.body.removeChild(overlay);
                resolve(val);
            };

            const cancel = () => {
                document.body.removeChild(overlay);
                resolve(null);
            };

            const box = HTML({
                style: {
                    background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px',
                    padding: '24px', minWidth: '350px', color: '#fff',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', gap: '16px',
                    fontFamily: 'sans-serif'
                },
                children:[
                    { tag: 'div', text: message, style: { fontSize: '15px', fontWeight: '500' } },
                    { 
                        tag: 'input', value: defaultValue,
                        style: {
                            padding: '10px', background: '#0a0a0a', border: '1px solid #555',
                            color: 'var(--neon-cyan, #0ff)', borderRadius: '6px', fontSize: '15px', outline: 'none'
                        },
                        events: {
                            keydown: (e) => {
                                if (e.key === 'Enter') submit();
                                if (e.key === 'Escape') cancel();
                            }
                        }
                    },
                    {
                        style: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
                        children:[
                            this._createButton('Cancel', false, cancel),
                            this._createButton('Confirm', true, submit)
                        ]
                    }
                ]
            });

            overlay.appendChild(box);
            document.body.appendChild(overlay);
            
            inputEl = box.querySelector('input');
            setTimeout(() => {
                inputEl.focus();
                inputEl.select();
            }, 50);
        });
    },

    /**
     * B"H - A custom, asynchronous confirm.
     */
    confirm(message) {
        return new Promise(resolve => {
            const overlay = this._createOverlay();

            const submit = () => { document.body.removeChild(overlay); resolve(true); };
            const cancel = () => { document.body.removeChild(overlay); resolve(false); };

            const box = HTML({
                style: {
                    background: '#1a1a1a', border: '1px solid #444', borderRadius: '12px',
                    padding: '24px', minWidth: '300px', color: '#fff',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', gap: '20px',
                    fontFamily: 'sans-serif'
                },
                children:[
                    { tag: 'div', text: message, style: { fontSize: '15px', lineHeight: '1.4' } },
                    {
                        style: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
                        children:[
                            this._createButton('No', false, cancel),
                            this._createButton('Yes', true, submit)
                        ]
                    }
                ]
            });

            overlay.appendChild(box);
            document.body.appendChild(overlay);
            
            const yesBtn = box.querySelectorAll('button')[1];
            setTimeout(() => yesBtn.focus(), 50);
        });
    },

    /**
     * B"H - A custom, asynchronous alert.
     */
    alert(message) {
        return new Promise(resolve => {
            const overlay = this._createOverlay();
            const close = () => { document.body.removeChild(overlay); resolve(); };

            const box = HTML({
                style: {
                    background: '#1a1a1a', border: '1px solid #622', borderRadius: '12px',
                    padding: '24px', minWidth: '300px', color: '#fff',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', gap: '20px',
                    fontFamily: 'sans-serif'
                },
                children:[
                    { tag: 'div', text: message, style: { fontSize: '15px', lineHeight: '1.4' } },
                    {
                        style: { display: 'flex', justifyContent: 'flex-end' },
                        children: [ this._createButton('OK', true, close) ]
                    }
                ]
            });

            overlay.appendChild(box);
            document.body.appendChild(overlay);
            
            const btn = box.querySelector('button');
            setTimeout(() => btn.focus(), 50);
        });
    }
};
