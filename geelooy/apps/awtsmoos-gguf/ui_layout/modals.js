// B"H
import { el } from './dom.js';

export function buildModals() {
    return [
        // Info Modal
        el('div', 'modal-overlay hidden', 
            el('div', 'modal-content', [
                el('div', 'header', 'MANUAL'),
                el('div', 'body', '', { id: 'infoContent' }),
                el('div', 'footer', [
                    el('button', 'btn', 'CLOSE', { id: 'btnCloseInfo' })
                ])
            ]), 
        { id: 'infoModal' }),

        // Confirm Modal
        el('div', 'modal-overlay hidden', 
            el('div', 'modal-content', [
                el('div', 'header', 'CONFIRM ACTION'),
                el('div', 'body', '', { id: 'confirmContent' }),
                el('div', 'footer', [
                    el('button', 'btn', 'CANCEL', { id: 'btnConfirmCancel' }),
                    el('button', 'btn danger', 'PROCEED', { id: 'btnConfirmOk' })
                ])
            ], {style:'max-width: 450px;'}), 
        { id: 'confirmModal' }),
        
        // B"H - New Token Inspector Modal
        el('div', 'modal-overlay hidden',
            el('div', 'modal-content', [
                el('div', 'header', [
                    el('span', '', 'TOKEN INSPECTOR', { id: 'tokenHeaderText' })
                ]),
                el('div', 'body', [
                    el('div', 'token-data-grid', [
                        el('div', 'token-data-field', [
                            el('label', '', 'TOKEN'),
                            el('span', '', 'N/A', { id: 'tokenText' })
                        ]),
                        el('div', 'token-data-field', [
                            el('label', '', 'SCORE'),
                            el('span', '', '0.00', { id: 'tokenScore' })
                        ]),
                    ]),
                     el('div', 'token-data-field mb-4', [
                        el('label', '', 'EST. MEMORY FOOTPRINT'),
                        el('span', 'text-accent-blue', '0 KB', { id: 'tokenSizeBytes' })
                    ]),
                    el('label', 'text-xs text-muted font-bold mb-2', 'EMBEDDING VECTOR'),
                    el('div', '', 'Vector data unavailable in UI thread.', { id: 'tokenVector' })
                ]),
                el('div', 'footer', [
                    el('button', 'btn', 'CLOSE', { id: 'btnCloseToken' })
                ])
            ]),
        { id: 'tokenModal' })
    ];
}