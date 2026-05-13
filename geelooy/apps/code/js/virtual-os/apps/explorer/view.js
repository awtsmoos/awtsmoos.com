
// B"H
import { escapeHtml } from '../../lib/html.js';

export function renderExplorerDom(container, payload, entries, errorText = '') {
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
                    <button class="explorer-entry" data-path="${escapeHtml(entry.path)}" data-kind="${escapeHtml(entry.kind)}">
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
}
