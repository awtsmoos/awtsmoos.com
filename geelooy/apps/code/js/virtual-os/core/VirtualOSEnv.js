
// B"H
/**
 * @file VirtualOSEnv.js
 * @description
 * Builds the environment object passed into every tiny desktop app.
 */

import { DesktopState } from './DesktopState.js';
import { App } from '../../app.js';

export function buildVirtualOSEnv(manager, tab, workspace, workspaceType, desktopState) {
    const requestRender = () => {
        DesktopState.save(desktopState);
        App.saveSessionDebounced();
        manager.render(tab);
    };

    return {
        workspace,
        workspaceType,
        requestRender
    };
}
