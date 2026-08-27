
// B"H
/**
 * @file SettingsApp.js
 * @description
 * Virtual OS settings.
 */

import { H } from '../ui/h.js';
import { DesktopState } from '../core/DesktopState.js';

/**
 * @function renderSettingsApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {void}
 */
export function renderSettingsApp(windowState, container, desktopState, env) {
    const debugBox = H({
        tag: 'input',
        attrs: { type: 'checkbox' }
    });

    debugBox.checked = localStorage.getItem('awtsmoos.virtualOS.debug') === 'true';

    debugBox.addEventListener('change', () => {
        localStorage.setItem('awtsmoos.virtualOS.debug', debugBox.checked ? 'true' : 'false');
        desktopState.settings.debug = debugBox.checked;
        env.requestRender();
    });

    const gitSelect = H({
        tag: 'select',
        className: 'vos-app-input',
        children: [
            { tag: 'option', text: 'Off', attrs: { value: 'off' } },
            { tag: 'option', text: 'After each write', attrs: { value: 'after-each-write' } },
            { tag: 'option', text: 'After batch', attrs: { value: 'after-batch' } },
            { tag: 'option', text: 'Ask first', attrs: { value: 'ask' } }
        ]
    });

    gitSelect.value = localStorage.getItem('awtsmoos.vibe.git.mode') || 'off';

    gitSelect.addEventListener('change', () => {
        localStorage.setItem('awtsmoos.vibe.git.mode', gitSelect.value);
        desktopState.settings.autoGitMode = gitSelect.value;
        env.requestRender();
    });

    const resetButton = H({
        tag: 'button',
        className: 'vos-app-button',
        text: 'Reset this desktop layout',
        attrs: { type: 'button' }
    });

    resetButton.addEventListener('click', () => {
        const fresh = DesktopState.reset(desktopState.rootPath);
        Object.assign(desktopState, fresh);
        env.requestRender();
    });

    container.replaceChildren(H({
        tag: 'div',
        className: 'vos-app vos-settings-app',
        children: [
            {
                tag: 'div',
                className: 'vos-settings-section',
                children: [
                    { tag: 'div', className: 'vos-settings-title', text: 'Diagnostics' },
                    {
                        tag: 'label',
                        className: 'vos-settings-row',
                        children: [
                            { tag: 'span', text: 'Show Virtual OS debug overlay and verbose logs' },
                            debugBox
                        ]
                    }
                ]
            },
            {
                tag: 'div',
                className: 'vos-settings-section',
                children: [
                    { tag: 'div', className: 'vos-settings-title', text: 'Vibe GitHub Sync Policy' },
                    {
                        tag: 'div',
                        className: 'vos-settings-row',
                        children: [
                            { tag: 'span', text: 'Auto-update GitHub after writes' },
                            gitSelect
                        ]
                    }
                ]
            },
            {
                tag: 'div',
                className: 'vos-settings-section',
                children: [
                    { tag: 'div', className: 'vos-settings-title', text: 'Layout' },
                    resetButton
                ]
            }
        ]
    }));
}
