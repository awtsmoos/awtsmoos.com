
// B"H
import { parentPath, normalizePath } from '../lib/path.js';
import {
    healExplorerPayload,
    listExplorerEntries,
    readExplorerFile,
    writeExplorerFile
} from './explorer/model.js';
import { renderExplorerDom } from './explorer/view.js';

export async function renderFileExplorerApp(windowState, container, desktopState, env) {
    const payload = healExplorerPayload(windowState, desktopState);
    let entries = [];
    let errorText = '';

    try {
        entries = await listExplorerEntries(env, payload.cwd);
    } catch (error) {
        errorText = error.message || String(error);
    }

    renderExplorerDom(container, payload, entries, errorText);

    const editorWrap = container.querySelector('.explorer-editor');
    const textarea = container.querySelector('.explorer-textarea');
    const editorHead = container.querySelector('.explorer-editor-head');
    const preview = container.querySelector('.explorer-preview');

    container.querySelector('[data-act="up"]').onclick = () => {
        payload.cwd = parentPath(payload.cwd);
        env.requestRender();
    };

    container.querySelector('[data-act="toggle"]').onclick = () => {
        payload.view = payload.view === 'list' ? 'grid' : 'list';
        env.requestRender();
    };

    container.querySelector('[data-act="save"]').onclick = async () => {
        if (!payload.editPath) return;
        await writeExplorerFile(env, payload.editPath, textarea.value);
        if (/\.html?$/i.test(payload.editPath)) preview.srcdoc = textarea.value;
    };

    container.querySelector('.explorer-grid').onclick = async (event) => {
        const button = event.target.closest('.explorer-entry');
        if (!button) return;

        const path = normalizePath(button.dataset.path);
        const kind = button.dataset.kind;

        if (kind === 'directory') {
            payload.cwd = path;
            env.requestRender();
            return;
        }

        payload.editPath = path;

        const text = await readExplorerFile(env, path);
        textarea.value = text;
        editorHead.textContent = path;
        editorWrap.classList.remove('hidden');

        if (/\.html?$/i.test(path)) {
            preview.srcdoc = text;
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }
    };
}
