
// B"H
/**
 * @file NotepadApp.js
 * @description
 * Simple Virtual OS notepad.
 */

import { HTML } from '../../html-generator.js';

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

export function renderNotepadApp(windowState, container, desktopState, env) {
    const payload = healPayload(windowState);

    const textarea = HTML({
        tag: 'textarea',
        className: 'vos-notepad-textarea',
        value: payload.text
    });

    textarea.addEventListener('input', () => {
        payload.text = textarea.value;
    });

    const saveButton = HTML({
        tag: 'button',
        className: 'vos-app-button',
        text: 'Save Memory',
        attrs: { type: 'button' },
        events: {
            click() {
                payload.text = textarea.value;
                env.requestRender();
            }
        }
    });

    container.replaceChildren(HTML({
        tag: 'div',
        className: 'vos-app vos-notepad-app',
        children: [
            {
                tag: 'div',
                className: 'vos-app-toolbar vos-notepad-toolbar',
                children: [
                    saveButton,
                    { tag: 'span', className: 'vos-app-path', text: 'local window note' }
                ]
            },
            textarea
        ]
    }));
}
