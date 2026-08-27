
// B"H
/**
 * @file index.js
 * @description
 * Tiny public Virtual OS entrypoint.
 */

import { DOM } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { DesktopState } from './core/DesktopState.js';
import { normalizePath } from './utils/path.js';
import { renderVirtualOS } from './core/renderCycle.js';
import { always, warn } from './diagnostics/VirtualOSLog.js';

export const VirtualOSManager = {
    async open(startItem) {
        const path = normalizePath(startItem?.path || '/');

        always('Open requested', {
            name: startItem?.name,
            path,
            workspaceId: startItem?.workspaceId,
            id: startItem?.id
        });

        return Tabs.create({
            id: `virtual-os-${Date.now()}`,
            name: `Virtual OS: ${startItem?.name || 'Root'}`,
            path,
            type: 'virtual-os',
            kind: 'directory',
            workspaceId: startItem?.workspaceId || startItem?.id || null,
            content: DesktopState.restore(path)
        });
    },

    async render(tab) {
        const container = DOM.virtualOSWrapper || document.getElementById('virtual-os-wrapper');

        if (!container) {
            warn('Render aborted: #virtual-os-wrapper missing');
            return;
        }

        await renderVirtualOS(this, container, tab);
    }
};
