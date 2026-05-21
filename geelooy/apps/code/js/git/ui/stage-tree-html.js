// B"H
/**
 * @file stage-tree-html.js
 * Chapter 9: directories rise as collapsible chambers in the Git sanctuary.
 * Each chamber can move all its children from waiting to chosen, or back again.
 */

import { buildStageTree } from './stage-tree.js';

/**
 * B"H - Renders stage items as a collapsible directory tree.
 * @param {Array<object>} items Git change items.
 * @param {string} action Either stage or unstage.
 * @returns {string} Tree HTML.
 */
export function renderStageTree(items, action) {
    const tree = buildStageTree(items);
    const html = [...tree.children.values()].map(node => renderNode(node, action)).join('');
    return html || emptyText(action);
}

function renderNode(node, action) {
    if (node.kind === 'file') return renderFile(node.item, action);
    const hook = action === 'stage' ? 'gitStageDir' : 'gitUnstageDir';
    const safePath = JSON.stringify(node.path);
    const children = [...node.children.values()].map(child => renderNode(child, action)).join('');
    return `
        <details open class="git-dir-group" style="margin-left:6px; margin-bottom:4px;">
            <summary style="cursor:pointer; user-select:none; display:flex; gap:6px; align-items:center;">
                <strong>${escapeHtml(node.name)}</strong>
                <button class="git-action-btn" onclick='event.preventDefault(); window.${hook}(${safePath})' style="margin-left:auto; background:none; border:1px solid var(--color-border); color:white; border-radius:4px; padding:1px 6px; cursor:pointer;">
                    ${action === 'stage' ? '+ dir' : '- dir'}
                </button>
            </summary>
            <div style="margin-left:14px;">${children}</div>
        </details>`;
}

function renderFile(item, action) {
    const colorMap = { added: 'var(--neon-lime)', deleted: 'var(--color-accent-danger)', modified: 'var(--neon-cyan)' };
    const color = colorMap[item.status] || 'white';
    const label = String(item.status || '?').toUpperCase()[0];
    const hook = action === 'stage' ? 'gitStage' : 'gitUnstage';
    const safePath = JSON.stringify(item.path);
    const name = escapeHtml(String(item.path).split('/').pop());
    const title = escapeHtml(item.path);
    return `
        <div class="git-file-item" title="${title}" style="display:flex; align-items:flex-start; gap:6px; padding:5px; margin-bottom:3px; background:rgba(255,255,255,0.03); border-left:2px solid ${color};">
            <div style="flex:1; min-width:0; font-family:var(--font-code); font-size:.85em; overflow-wrap:anywhere;">
                <span style="color:${color}; font-weight:bold; margin-right:6px;">${label}</span>${name}
            </div>
            <button class="git-action-btn" onclick='window.${hook}(${safePath})' style="flex:0 0 auto; background:none; border:1px solid var(--color-border); color:white; border-radius:4px; padding:2px 8px; cursor:pointer;">
                ${action === 'stage' ? '+' : '-'}
            </button>
        </div>`;
}

function emptyText(action) {
    return `<div style="padding:10px; color:gray; font-style:italic;">${action === 'stage' ? 'No changes.' : 'Nothing staged.'}</div>`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
