
// B"H
/**
 * @file network.js
 * @brief The Network Traffic Observer.
 */

import { HTML } from '../../html-generator.js';

export const NetworkPanel = {
    /**
     * @function init
     * @description Manifests the network table and populates it with persistent history.
     */
    init(container, state) {
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.height = '100%';

        const header = HTML({
            className: 'dt-network-header',
            style: { 
                display: 'flex', 
                background: 'var(--color-bg-secondary)', 
                borderBottom: '1px solid var(--color-border)', 
                padding: '8px 10px', 
                fontWeight: 'bold', 
                fontSize: '0.85em', 
                width: '100%',
                color: 'var(--color-text-tertiary)',
                alignItems: 'center'
            },
            children: [
                { style: { width: '60px' }, text: 'Status' },
                { style: { width: '70px' }, text: 'Method' },
                { style: { flexGrow: '1' }, text: 'File / URL' },
                { style: { width: '80px' }, text: 'Type' },
                { style: { width: '80px', textAlign: 'right', marginRight: '10px' }, text: 'Time' },
                // B"H - The Erasure Button
                { 
                    tag: 'button', 
                    text: '⊘', 
                    title: 'Clear Network Log',
                    style: { background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px' },
                    onClick: () => {
                        state.networkReqs = [];
                        renderRequests();
                    }
                }
            ]
        });

        const listContainer = HTML({
            id: 'dt-network-list',
            style: { flexGrow: '1', overflowY: 'auto', background: 'var(--color-bg-deep)', width: '100%' }
        });

        container.appendChild(header);
        container.appendChild(listContainer);

        /**
         * @function renderRequests
         * @description Draws all requests currently held in the state.
         */
        const renderRequests = () => {
            listContainer.innerHTML = '';
            if (!state.networkReqs || state.networkReqs.length === 0) {
                listContainer.innerHTML = '<div style="padding:20px; color:gray; text-align:center; font-style:italic;">No network activity recorded.</div>';
                return;
            }

            state.networkReqs.forEach(req => {
                const statusColor = req.status >= 200 && req.status < 300 ? 'var(--neon-lime)' : (req.status >= 400 ? 'var(--color-accent-danger)' : 'white');
                
                const row = HTML({
                    style: { 
                        display: 'flex', 
                        padding: '6px 10px', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        fontFamily: 'var(--font-code)', 
                        fontSize: '0.8em',
                        alignItems: 'center'
                    },
                    children: [
                        { style: { width: '60px', color: statusColor, fontWeight: 'bold' }, text: req.status || '???' },
                        { style: { width: '70px', color: 'var(--neon-cyan)' }, text: req.method },
                        { 
                            style: { flexGrow: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '10px' }, 
                            attributes: { title: req.url },
                            text: req.url 
                        },
                        { style: { width: '80px', color: 'var(--color-text-tertiary)' }, text: req.type },
                        { style: { width: '80px', textAlign: 'right', opacity: '0.7' }, text: `${Math.round(req.duration || 0)}ms` }
                    ]
                });
                listContainer.appendChild(row);
            });

            // Keep scrolled to bottom
            listContainer.scrollTop = listContainer.scrollHeight;
        };

        state.onNetworkLog = renderRequests;
        renderRequests();
    }
};
