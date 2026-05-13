
// B"H
/**
 * @file env.js
 * @description
 * Runtime environment passed into Virtual OS apps.
 */

import { App } from '../../app.js';
import { DesktopState } from './DesktopState.js';
import { log } from '../diagnostics/VirtualOSLog.js';

/**
 * @function makeVirtualEnv
 * @param {object} manager VirtualOS manager.
 * @param {object} tab Active tab.
 * @param {object} workspace Resolved workspace.
 * @param {object} state Desktop state.
 * @returns {object} Environment.
 */
export function makeVirtualEnv(manager, tab, workspace, state) {
    return {
        workspace,
        workspaceType: workspace.originalType || workspace.type,
        requestRender() {
            log('requestRender', {
                tabId: tab.id,
                windows: state.windows.length,
                rootPath: state.rootPath
            });

            DesktopState.save(state);
            App.saveSessionDebounced();
            manager.render(tab);
        }
    };
}
