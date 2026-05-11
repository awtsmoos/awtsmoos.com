
// B"H
/**
 * @file VisualManifestor.js
 * @brief Crafts the visual shell for workspace roots.
 */

import { HTML } from '../../html-generator.js';

export const VisualManifestor = {
    /**
     * B"H - Manifests the header for a single world.
     */
    manifest(ws, displayName, subText, isLocked, callbacks) {
        const schema = {
            className: 'workspace-root',
            children: [
                {
                    className: 'workspace-header' + (isLocked ? ' locked' : ''),
                    dataset: { wsId: String(ws.id) },
                    onClick: callbacks.onClick,
                    onContextmenu: callbacks.onMenu,
                    children: [
                        subText ? { 
                            className: 'workspace-header-sub', 
                            text: subText 
                        } : null,
                        {
                            className: 'workspace-header-main',
                            children: [
                                { 
                                    tag: 'svg', 
                                    className: 'svg-icon',
                                    children: [
                                        { 
                                            tag: 'svg:use', 
                                            attrs: { 
                                                'href': '#icon-' + (isLocked ? 'settings' : 'folder') 
                                            } 
                                        }
                                    ]
                                },
                                { tag: 'span', text: displayName }
                            ]
                        }
                    ]
                }
            ]
        };

        return HTML(schema);
    }
};
