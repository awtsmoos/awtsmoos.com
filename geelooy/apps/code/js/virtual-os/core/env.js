
// B"H
/**
 * @file env.js
 * @description
 * Runtime environment passed into every desktop app.
 */

import { App } from '../../app.js';
import { DesktopState } from './DesktopState.js';
import { log } from '../diagnostics/VirtualOSLog.js';

/**
 * @function makeVirtualEnv
 * @param {object} manager VirtualOSManager.
 * @param {object} tab Active tab.
 * @param {object} workspace Resolved workspace.
 * @param {object} state Desktop state.
 * @returns {object} Runtime env.
 */
export function makeVirtualEnv(manager, tab, workspace, state) {
    return {
        workspace,
        workspaceType: workspace.originalType || workspace.type,
        requestRender() {
            log('Request render invoked', { tabId: tab.id, windows: state.windows.length });
            DesktopState.save(state);
            App.saveSessionDebounced();
            manager.render(tab);
        }
    };
}
