
// B"H
/**
 * @file chats-ui.js
 * @brief The Project Timestreams Ledger (Scoped Refinement).
 */

import { VibeDB } from '../../db.js';
import { UI } from '../../../ui.js';
import { HTML } from '../../../html-generator.js';

export const ChatsUI = {
    /**
     * B"H - Only reveals the timestreams that share the exact physical subfolder.
     */
    async render(container, tab, controller) {
        const currentId = tab.vibeSession?.id;
        const currentPath = tab.item.path || '/';
        const wsId = tab.item.workspaceId;

        const allSessions = await VibeDB.getAllSessions();
        
        // RECTIFIED FILTERING: 
        // 1. Same Workspace ID.
        // 2. Same Physical Root Folder.
        const projectVibes = allSessions.filter(s => 
            String(s.workspaceId) === String(wsId) && 
            (s.path === currentPath || s.rootPath === currentPath)
        );

        projectVibes.sort((a,b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

        container.innerHTML = '';
        
        const listItems = projectVibes.length === 0 
            ? [{ tag: 'div', style: { padding: '30px', textAlign: 'center', opacity: 0.5 }, text: 'This folder has no previous Timestreams.' }]
            : projectVibes.map(s => this._createChatCard(s, tab, controller, container));

        container.appendChild(HTML({
            style: { display: 'flex', flexDirection: 'column', height: '100%', padding: '15px' },
            children: [
                {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
                    children: [
                        { tag: 'h3', style: { margin: 0, fontSize: '1.2em', color: 'var(--neon-cyan)', letterSpacing: '1px' }, text: 'FOLDER CHATS' },
                        {
                            tag: 'button', className: 'primary-btn', style: { minHeight: 0, padding: '5px 12px', fontSize: '10px' }, text: '+ GENESIS',
                            onClick: () => {
                                const root = controller.getRootItem(tab);
                                controller.open(root, true);
                            }
                        }
                    ]
                },
                {
                    className: 'chats-ledger-list',
                    style: { display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' },
                    children: listItems
                }
            ]
        }));
    },

    _createChatCard(s, tab, controller, container) {
        const isActive = s.id === tab.vibeSession?.id;
        const dateStr = new Date(s.lastUpdated || Date.now()).toLocaleString();
        
        const borderColor = isActive ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)';
        const opacity = isActive ? 1.0 : 0.7;

        return {
            className: 'vibe-manifest-card',
            style: { border: '1px solid ' + borderColor, opacity: opacity, position: 'relative' },
            onClick: (e) => {
                if (e.target.closest('.del-chat')) return;
                if (isActive) return;
                controller.open({
                    ...tab.item, name: s.name.replace('Vibe: ', ''), path: s.path, id: s.id
                });
            },
            children: [
                {
                    style: { display: 'flex', justifyContent: 'space-between' },
                    children: [
                        {
                            style: { flexGrow: 1, overflow: 'hidden' },
                            children: [
                                { tag: 'span', className: 'timestream-name', text: s.name.replace('Vibe: ', '') },
                                { tag: 'div', style: { fontSize: '0.65em', opacity: 0.4 }, text: dateStr }
                            ]
                        },
                        {
                            tag: 'button', className: 'icon-button del-chat', 
                            style: { color: 'var(--color-accent-danger)', padding: 0, width: '30px', height: '30px' },
                            html: '<svg class="svg-icon" style="width:16px; height:16px;"><use href="#icon-trash"></use></svg>',
                            onClick: async (e) => {
                                e.stopPropagation();
                                const conf = await UI.showDialog({ title: 'Purge Memory', message: 'Return "' + s.name + '" to the potential?', okText: 'PURGE' });
                                if (conf) {
                                    await VibeDB.deleteSession(s.id);
                                    this.render(container, tab, controller);
                                }
                            }
                        }
                    ]
                }
            ]
        };
    }
};
