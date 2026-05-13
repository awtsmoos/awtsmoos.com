
// B"H
/**
 * @file VirtualOSEnv.js
 * @description
 * Creates the environment passed into Virtual OS apps.
 */

import { App } from '../../app.js';
import { DesktopState } from './DesktopState.js';

/**
 * @function buildVirtualOSEnv
 * @param {object} manager VirtualOSManager.
 * @param {object} tab Active tab.
 * @param {object} workspace Root workspace.
 * @param {string} workspaceType Provider type.
 * @param {object} desktopState Desktop state.
 * @returns {object} Environment.
 */
export function buildVirtualOSEnv(manager, tab, workspace, workspaceType, desktopState) {
    return {
        workspace,
        workspaceType,
        requestRender() {
            DesktopState.save(desktopState);
            App.saveSessionDebounced();
            manager.render(tab);
        }
    };
}
