
// B"H
/**
 * @file GitControlApp.js
 * @description
 * GitHub sync policy and repo status surface.
 */

import { H } from '../ui/h.js';

/**
 * @function renderGitControlApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {void}
 */
export function renderGitControlApp(windowState, container, desktopState, env) {
    const mode = localStorage.getItem('awtsmoos.vibe.git.mode') || 'off';

    container.replaceChildren(H({
        tag: 'div',
        className: 'vos-app vos-git-control-app',
        children: [
            {
                tag: 'div',
                className: 'vos-app-toolbar',
                children: [
                    { tag: 'span', className: 'vos-app-path', text: env.workspace.name || 'Workspace' }
                ]
            },
            {
                tag: 'div',
                className: 'vos-git-card',
                children: [
                    { tag: 'div', className: 'vos-settings-title', text: 'GitHub Auto Update' },
                    { tag: 'div', className: 'vos-git-status-line', text: `Current policy: ${mode}` },
                    { tag: 'div', className: 'vos-git-status-line', text: 'Vibe write hooks may use this policy after file writes.' },
                    { tag: 'div', className: 'vos-git-status-line', text: 'Secret safety checks should block .env, private keys, and service account JSON.' }
                ]
            }
        ]
    }));
}
