
// B"H
/**
 * @file FileExplorerApp.js
 * @description
 * Explorer app with list/grid mode and live file editing with HTML preview.
 * This version speaks the actual FileSystemProvider API: list/read/write.
 * It no longer calls the non-existent readDir method.
 */

import { FileSystemProvider } from '../../fs-provider.js';

/**
 * @function normalize
 * @param {string} path The path to normalize.
 * @returns {string} Absolute slash-prefixed path.
 */
function normalize(path = '/') {
    const text = String(path || '/').replaceAll('\\', '/');
    return text.startsWith('/') ? text : `/${text}`;
}

/**
 * @function joinPath
 * @param {string} base Parent directory.
 * @param {string} name Child name.
 * @returns {string} Joined absolute path.
 */
function joinPath(base, name) {
    const cleanBase = normalize(base).replace(/\/+$/, '');
    return normalize(`${cleanBase || ''}/${name}`);
}

/**
 * @function escapeHtml
 * @param {unknown} value Raw value.
 * @returns {string} Escaped HTML.
 */
function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/**
 * @function makeItem
 * @param {object} env Virtual OS environment.
 * @param {string} path Absolute path.
 * @param {string} kind File kind.
 * @returns {object} Provider-ready item.
 */
function makeItem(env, path, kind = 'directory') {
    return {
        ...env.workspace,
        type: env.workspaceType,
        originalType: env.workspace.originalType || env.workspace.type,
        path: normalize(path),
        kind
    };
}

/**
 * @async
 * @function readEntries
 * @param {object} env Virtual OS environment.
 * @param {string} cwd Current directory.
 * @returns {Promise<object[]>} Normalized entries.
 */
async function readEntries(env, cwd) {
    const result = await FileSystemProvider.list(makeItem(env, cwd, 'directory'));
    const entries = Array.isArray(result) ? result : (result.entries || []);

    return entries.map((entry) => ({
        ...entry,
        name: entry.name || entry.path?.split('/').filter(Boolean).pop() || 'Untitled',
        kind: entry.kind || entry.type || 'file',
        path: normalize(entry.path || joinPath(cwd, entry.name || 'Untitled'))
    }));
}

/**
 * @async
 * @function renderFileExplorerApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount node.
 * @param {object} desktopState Desktop state.
 * @param {object} env Workspace environment.
 * @returns {Promise<void>}
 */
export async function renderFileExplorerApp(windowState, container, desktopState, env) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.cwd = normalize(payload.cwd || desktopState.rootPath || '/');
    payload.view = payload.view === 'grid' ? 'grid' : 'list';
    windowState.payload = payload;

    let entries = [];
    let errorText = '';

    try {
        entries = await readEntries(env, payload.cwd);
    } catch (error) {
        errorText = error.message || String(error);
    }

    container.innerHTML = `
        <div class="vos-explorer-app ${payload.view === 'grid' ? 'grid-mode' : 'list-mode'}">
            <div class="explorer-toolbar">
                <button data-act="up">Up</button>
                <button data-act="toggle">${payload.view === 'list' ? 'Grid' : 'List'} View</button>
                <span class="explorer-path">${escapeHtml(payload.cwd)}</span>
            </div>

            ${errorText ? `<div class="explorer-error">Error: ${escapeHtml(errorText)}</div>` : ''}

            <div class="explorer-grid">
                ${entries.map((entry) => `
                    <button
                        class="explorer-entry"
                        data-path="${escapeHtml(entry.path)}"
                        data-kind="${escapeHtml(entry.kind)}"
                    >
                        <span class="explorer-entry-icon">${entry.kind === 'directory' ? '📁' : '📄'}</span>
                        <span class="explorer-entry-name">${escapeHtml(entry.name)}</span>
                    </button>
                `).join('')}
            </div>

            <div class="explorer-editor hidden">
                <div class="explorer-editor-head"></div>
                <textarea class="explorer-textarea" spellcheck="false"></textarea>
                <div class="explorer-editor-actions">
                    <button data-act="save">Save</button>
                </div>
                <iframe class="explorer-preview hidden"></iframe>
            </div>
        </div>
    `;

    const editorWrap = container.querySelector('.explorer-editor');
    const textarea = container.querySelector('.explorer-textarea');
    const editorHead = container.querySelector('.explorer-editor-head');
    const preview = container.querySelector('.explorer-preview');

    container.querySelector('[data-act="up"]').onclick = () => {
        const cwd = normalize(payload.cwd);
        payload.cwd = cwd === '/' ? '/' : cwd.slice(0, cwd.lastIndexOf('/')) || '/';
        env.requestRender();
    };

    container.querySelector('[data-act="toggle"]').onclick = () => {
        payload.view = payload.view === 'list' ? 'grid' : 'list';
        env.requestRender();
    };

    container.querySelector('[data-act="save"]').onclick = async () => {
        if (!payload.editPath) return;

        await FileSystemProvider.write(
            makeItem(env, payload.editPath, 'file'),
            textarea.value
        );

        if (/\.html?$/i.test(payload.editPath)) preview.srcdoc = textarea.value;
    };

    container.querySelector('.explorer-grid').onclick = async (event) => {
        const button = event.target.closest('.explorer-entry');
        if (!button) return;

        const path = normalize(button.dataset.path);
        const kind = button.dataset.kind;

        if (kind === 'directory') {
            payload.cwd = path;
            env.requestRender();
            return;
        }

        payload.editPath = path;

        const raw = await FileSystemProvider.read(makeItem(env, payload.editPath, 'file'));
        const text = raw instanceof Blob ? await raw.text() : String(raw ?? '');

        textarea.value = text;
        editorHead.textContent = payload.editPath;
        editorWrap.classList.remove('hidden');

        if (/\.html?$/i.test(payload.editPath)) {
            preview.srcdoc = text;
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }
    };
}
