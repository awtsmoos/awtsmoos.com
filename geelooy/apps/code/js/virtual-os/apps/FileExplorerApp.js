
// B"H
/**
 * @file FileExplorerApp.js
 * @description
 * File Explorer window, designed to later host the full File Commander runtime.
 */

import { H } from '../ui/h.js';
import { launchVirtualWindow } from '../core/desktopBoot.js';
import { healExplorerPayload, listExplorerEntries } from './explorer/model.js';
import { normalizePath } from '../utils/path.js';

/**
 * @function renderEntries
 * @param {object[]} entries Entries.
 * @returns {object[]} Blueprints.
 */
function renderEntries(entries) {
    return entries.map((entry) => ({
        tag: 'button',
        className: 'explorer-entry',
        dataset: { path: entry.path, kind: entry.kind },
        attrs: { type: 'button', title: entry.path },
        children: [
            { tag: 'span', className: 'explorer-entry-icon', text: entry.kind === 'directory' ? '📁' : '📄' },
            { tag: 'span', className: 'explorer-entry-name', text: entry.name }
        ]
    }));
}

/**
 * @function parentPath
 * @param {string} path Path.
 * @returns {string} Parent.
 */
function parentPath(path) {
    const clean = normalizePath(path);
    if (clean === '/') return '/';
    return clean.slice(0, clean.lastIndexOf('/')) || '/';
}

/**
 * @async
 * @function renderFileExplorerApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {Promise<void>}
 */
export async function renderFileExplorerApp(windowState, container, desktopState, env) {
    const payload = healExplorerPayload(windowState, env);

    let entries = [];
    let errorText = '';

    try {
        entries = await listExplorerEntries(env, payload.cwd);
    } catch (error) {
        errorText = error.message || String(error);
    }

    const root = H({
        tag: 'div',
        className: 'vos-app vos-explorer-app',
        children: [
            {
                tag: 'div',
                className: 'vos-app-toolbar',
                children: [
                    { tag: 'button', className: 'vos-app-button', text: 'Up', dataset: { action: 'up' }, attrs: { type: 'button' } },
                    { tag: 'button', className: 'vos-app-button', text: 'Terminal Here', dataset: { action: 'terminal' }, attrs: { type: 'button' } },
                    { tag: 'button', className: 'vos-app-button', text: 'New Note', dataset: { action: 'note' }, attrs: { type: 'button' } },
                    { tag: 'span', className: 'vos-app-path', text: errorText || payload.cwd }
                ]
            },
            {
                tag: 'div',
                className: 'vos-app-body explorer-grid',
                children: renderEntries(entries)
            }
        ]
    });

    root.querySelector('[data-action="up"]').onclick = () => {
        payload.cwd = parentPath(payload.cwd);
        env.requestRender();
    };

    root.querySelector('[data-action="terminal"]').onclick = () => {
        launchVirtualWindow(desktopState, 'terminal', {
            x: 95 + desktopState.windows.length * 18,
            y: 80 + desktopState.windows.length * 14,
            payload: {
                terminalState: {
                    cwd: {
                        kind: 'workspace',
                        name: env.workspace.name,
                        path: payload.cwd,
                        workspaceId: env.workspace.id
                    },
                    output: [],
                    history: [],
                    env: {}
                }
            }
        });
        env.requestRender();
    };

    root.querySelector('[data-action="note"]').onclick = () => {
        launchVirtualWindow(desktopState, 'notepad', {
            x: 120 + desktopState.windows.length * 16,
            y: 80 + desktopState.windows.length * 12
        });
        env.requestRender();
    };

    root.querySelector('.explorer-grid').onclick = (event) => {
        const button = event.target.closest('.explorer-entry');
        if (!button) return;

        const path = normalizePath(button.dataset.path);
        const kind = button.dataset.kind;

        if (kind === 'directory') {
            payload.cwd = path;
            env.requestRender();
            return;
        }

        launchVirtualWindow(desktopState, 'notepad', {
            x: 120 + desktopState.windows.length * 16,
            y: 80 + desktopState.windows.length * 12,
            payload: {
                filePath: path,
                text: ''
            }
        });

        env.requestRender();
    };

    container.replaceChildren(root);
}
