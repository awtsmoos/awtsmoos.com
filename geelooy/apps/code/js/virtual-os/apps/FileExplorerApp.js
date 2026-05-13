// B"H
/**
 * @file FileExplorerApp.js
 * @description Explorer app with list/grid mode and live file editing with HTML preview.
 */

import { FileSystemProvider } from '../../fs-provider.js';

function normalize(path = '/') {
    return path.startsWith('/') ? path : `/${path}`;
}

export async function renderFileExplorerApp(windowState, container, desktopState, env) {
    const payload = windowState.payload || (windowState.payload = { cwd: desktopState.rootPath, view: 'list' });
    const cwd = normalize(payload.cwd || desktopState.rootPath);
    payload.cwd = cwd;
    const entries = await FileSystemProvider.readDir({ ...env.workspace, type: env.workspaceType, path: cwd, kind: 'directory' });
    container.innerHTML = `
        <div class="app-toolbar">
            <button data-act="up">Up</button>
            <button data-act="toggle">${payload.view === 'list' ? 'Grid' : 'List'} View</button>
            <span>${cwd}</span>
        </div>
        <div class="explorer-grid ${payload.view}">
            ${entries.map((entry) => `<button class="explorer-entry" data-path="${entry.path}" data-kind="${entry.kind}">${entry.kind === 'directory' ? '📁' : '📄'} ${entry.name}</button>`).join('')}
        </div>
        <div class="explorer-editor hidden">
            <div class="explorer-editor-head"></div>
            <textarea class="explorer-textarea"></textarea>
            <button data-act="save">Save</button>
            <iframe class="explorer-preview hidden" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
        </div>
    `;
    const editorWrap = container.querySelector('.explorer-editor');
    const textarea = container.querySelector('.explorer-textarea');
    const editorHead = container.querySelector('.explorer-editor-head');
    const preview = container.querySelector('.explorer-preview');

    container.querySelector('[data-act="up"]').onclick = () => {
        payload.cwd = cwd === '/' ? '/' : cwd.slice(0, cwd.lastIndexOf('/')) || '/';
        env.requestRender();
    };
    container.querySelector('[data-act="toggle"]').onclick = () => {
        payload.view = payload.view === 'list' ? 'grid' : 'list';
        env.requestRender();
    };
    container.querySelector('[data-act="save"]').onclick = async () => {
        if (!payload.editPath) return;
        await FileSystemProvider.write({ ...env.workspace, type: env.workspaceType, path: payload.editPath, kind: 'file' }, textarea.value);
        if (/\.html?$/i.test(payload.editPath)) preview.srcdoc = textarea.value;
    };
    container.querySelector('.explorer-grid').onclick = async (event) => {
        const button = event.target.closest('.explorer-entry');
        if (!button) return;
        const path = button.dataset.path;
        const kind = button.dataset.kind;
        if (kind === 'directory') {
            payload.cwd = normalize(path);
            env.requestRender();
            return;
        }
        payload.editPath = normalize(path);
        const raw = await FileSystemProvider.read({ ...env.workspace, type: env.workspaceType, path: payload.editPath, kind: 'file' });
        const text = raw instanceof Blob ? await raw.text() : String(raw);
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
