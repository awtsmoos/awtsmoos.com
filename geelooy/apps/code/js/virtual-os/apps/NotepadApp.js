
// B"H
/**
 * @file NotepadApp.js
 * @description
 * Simple Virtual OS notepad and file editor vessel.
 */

import { H } from '../ui/h.js';
import { FileSystemProvider } from '../../fs-provider.js';

/**
 * @function healPayload
 * @param {object} windowState Window state.
 * @returns {object} Payload.
 */
function healPayload(windowState) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.text = typeof payload.text === 'string'
        ? payload.text
        : 'B"H\n\nAwtsmoos Notepad\n\nType here. This note lives inside this virtual window payload.';

    windowState.payload = payload;
    return payload;
}

/**
 * @function makeProviderItem
 * @param {object} env Environment.
 * @param {string} path Path.
 * @returns {object} Provider item.
 */
function makeProviderItem(env, path) {
    return {
        ...env.workspace,
        type: env.workspaceType,
        path,
        kind: 'file',
        workspaceId: env.workspace.id
    };
}

/**
 * @function renderNotepadApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {void}
 */
export function renderNotepadApp(windowState, container, desktopState, env) {
    const payload = healPayload(windowState);

    const textarea = H({
        tag: 'textarea',
        className: 'vos-notepad-textarea',
        value: payload.text
    });

    textarea.addEventListener('input', () => {
        payload.text = textarea.value;
    });

    const saveButton = H({
        tag: 'button',
        className: 'vos-app-button',
        text: payload.filePath ? 'Save File' : 'Save Memory',
        attrs: { type: 'button' }
    });

    saveButton.addEventListener('click', async () => {
        payload.text = textarea.value;

        if (payload.filePath) {
            await FileSystemProvider.write(makeProviderItem(env, payload.filePath), payload.text);
        }

        env.requestRender();
    });

    container.replaceChildren(H({
        tag: 'div',
        className: 'vos-app vos-notepad-app',
        children: [
            {
                tag: 'div',
                className: 'vos-app-toolbar vos-notepad-toolbar',
                children: [
                    saveButton,
                    { tag: 'span', className: 'vos-app-path', text: payload.filePath || 'local window note' }
                ]
            },
            textarea
        ]
    }));
}
