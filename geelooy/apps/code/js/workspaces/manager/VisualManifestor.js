
// B"H
/**
 * @file VisualManifestor.js
 * @brief Crafts the visual shell for workspace roots.
 */

import { HTML } from '../../html-generator.js';

const WORKSPACE_STYLE = Object.freeze({
    local: { icon: 'laptop', tone: 'cyan', label: 'Local File System' },
    github: { icon: 'github', tone: 'violet', label: 'GitHub Repository' },
    indexeddb: { icon: 'brain', tone: 'magenta', label: 'IndexedDB Storage' },
    opfs: { icon: 'save', tone: 'blue', label: 'OPFS Storage' },
    relay: { icon: 'link', tone: 'cyan', label: 'Relay Server' },
    ssh: { icon: 'ssh', tone: 'lime', label: 'SSH Workspace' },
    'awtsmoos-os': { icon: 'brain-circuit', tone: 'gold', label: 'Awtsmoos OS' }
});

function styleFor(ws = {}, isLocked = false) {
    if (isLocked) return { icon: 'settings', tone: 'locked', label: 'Access Locked' };
    return WORKSPACE_STYLE[ws.type] || { icon: 'folder', tone: 'plain', label: String(ws.type || 'Workspace').toUpperCase() };
}

export const VisualManifestor = {
    /**
     * B"H - Manifests the header for a single world.
     */
    manifest(ws, displayName, subText, isLocked, callbacks) {
        const style = styleFor(ws, isLocked);
        const schema = {
            className: `workspace-root workspace-root-${style.tone}`,
            children: [
                {
                    className: `workspace-header workspace-header-${style.tone}` + (isLocked ? ' locked' : ''),
                    dataset: { wsId: String(ws.id), workspaceType: String(ws.type || '') },
                    onClick: callbacks.onClick,
                    onContextmenu: callbacks.onMenu,
                    children: [
                        subText ? {
                            className: 'workspace-header-sub',
                            text: subText || style.label
                        } : null,
                        {
                            className: 'workspace-header-main',
                            children: [
                                {
                                    className: `workspace-type-icon workspace-type-icon-${style.tone}`,
                                    children: [
                                        {
                                            tag: 'svg',
                                            className: 'svg-icon',
                                            children: [
                                                {
                                                    tag: 'svg:use',
                                                    attrs: { href: '#icon-' + style.icon }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    className: 'workspace-title-stack',
                                    children: [
                                        { tag: 'span', className: 'workspace-display-name', text: displayName },
                                        { tag: 'small', className: 'workspace-kind-label', text: style.label }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        return HTML(schema);
    }
};
