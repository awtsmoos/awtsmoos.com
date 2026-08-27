
// B"H
/**
 * @file TaskManagerApp.js
 * @description
 * Inspect and manage windows.
 */

import { H } from '../ui/h.js';
import { DesktopState } from '../core/DesktopState.js';

/**
 * @function renderTaskManagerApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {void}
 */
export function renderTaskManagerApp(windowState, container, desktopState, env) {
    const rows = desktopState.windows.map((win) => ({
        tag: 'tr',
        children: [
            { tag: 'td', text: win.title || win.appId },
            { tag: 'td', text: win.appId },
            { tag: 'td', text: win.isMinimized ? 'minimized' : 'visible' },
            { tag: 'td', text: String(win.zIndex || 0) },
            {
                tag: 'td',
                children: [
                    {
                        tag: 'button',
                        className: 'vos-app-button',
                        text: 'Focus',
                        attrs: { type: 'button' },
                        events: {
                            click() {
                                DesktopState.focusWindow(desktopState, win.id);
                                env.requestRender();
                            }
                        }
                    },
                    {
                        tag: 'button',
                        className: 'vos-app-button',
                        text: 'Close',
                        attrs: { type: 'button' },
                        events: {
                            click() {
                                DesktopState.closeWindow(desktopState, win.id);
                                env.requestRender();
                            }
                        }
                    }
                ]
            }
        ]
    }));

    container.replaceChildren(H({
        tag: 'div',
        className: 'vos-app vos-task-manager-app',
        children: [
            {
                tag: 'div',
                className: 'vos-app-toolbar',
                children: [
                    { tag: 'span', className: 'vos-app-path', text: `Windows: ${desktopState.windows.length}` }
                ]
            },
            {
                tag: 'div',
                className: 'vos-app-body',
                children: [{
                    tag: 'table',
                    className: 'vos-task-table',
                    children: [
                        {
                            tag: 'thead',
                            children: [{
                                tag: 'tr',
                                children: [
                                    { tag: 'th', text: 'Title' },
                                    { tag: 'th', text: 'App' },
                                    { tag: 'th', text: 'State' },
                                    { tag: 'th', text: 'Z' },
                                    { tag: 'th', text: 'Actions' }
                                ]
                            }]
                        },
                        { tag: 'tbody', children: rows }
                    ]
                }]
            }
        ]
    }));
}
