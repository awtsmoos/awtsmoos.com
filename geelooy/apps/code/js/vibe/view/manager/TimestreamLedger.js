
// B"H
/**
 * @file TimestreamLedger.js
 * @brief THE PALACE OF THE RECORDED HISTORY.
 */

import { HTML } from '../../../html-generator.js';
import { VibeDB } from '../../db.js';
import { UI } from '../../../ui.js';

export const TimestreamLedger = {
    /**
     * B"H - Assembles the scroll of history.
     */
    build(sessions) {
        return {
            className: 'vibe-manager-box ledger',
            children: [
                {
                    className: 'vibe-manager-title-row',
                    children: [
                        { tag: 'h3', className: 'vibe-manager-box-title', text: '◈ Timestream Ledger' },
                        { 
                            tag: 'span', 
                            style: { color: 'var(--neon-cyan)', fontSize: '0.7em', fontWeight: 'bold' }, 
                            text: 'TOTAL REVEALED: ' + sessions.length 
                        }
                    ]
                },
                {
                    id: 'vibe-mgr-list',
                    style: { 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px', 
                        maxHeight: '700px', 
                        overflowY: 'auto',
                        paddingRight: '10px'
                    },
                    children: sessions.length === 0 ? [
                        { 
                            style: { padding: '40px', textAlign: 'center', color: 'gray', fontSize: '0.9em' }, 
                            text: 'No active timestreams have manifested in this dimension.' 
                        }
                    ] : []
                }
            ]
        };
    },

    bind(container, controller, sessions, refresh) {
        const list = container.querySelector('#vibe-mgr-list');
        if (!list) return;

        sessions.sort((a,b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

        sessions.forEach(sess => {
            const card = HTML({
                className: 'timestream-card',
                children: [
                    {
                        className: 'timestream-info',
                        children: [
                            { tag: 'span', className: 'timestream-name', text: sess.name.replace('Vibe: ', '') },
                            { tag: 'span', className: 'timestream-path', text: sess.path }
                        ]
                    },
                    {
                        style: { display: 'flex', gap: '8px', flexShrink: 0 },
                        children: [
                            { 
                                tag: 'button', className: 'primary-btn', 
                                style: { minHeight: 0, padding: '8px 20px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' }, 
                                text: 'ACTIVATE',
                                onClick: () => controller.open({ 
                                    name: sess.name.replace('Vibe: ', ''), 
                                    path: sess.path, 
                                    workspaceId: sess.workspaceId, 
                                    type: sess.originalType, 
                                    kind: 'directory' 
                                }) 
                            },
                            { 
                                tag: 'button', className: 'secondary-btn', 
                                style: { minHeight: 0, padding: '8px 12px', border: '1px solid #400', color: '#f55' }, 
                                text: '×', 
                                onClick: async () => {
                                    const confirmText = 'Are you certain you wish to return the timestream for "' + sess.name + '" back to the absolute void?';
                                    const go = await UI.showDialog({ 
                                        title: 'B"H - Void Protocol', 
                                        message: confirmText, 
                                        okText: 'PURGE' 
                                    });
                                    if (go) {
                                        await VibeDB.deleteSession(sess.id);
                                        refresh();
                                        UI.showToast('Vessel dissolved.', 'info');
                                    }
                                }
                            }
                        ]
                    }
                ]
            });
            list.appendChild(card);
        });
    }
};
