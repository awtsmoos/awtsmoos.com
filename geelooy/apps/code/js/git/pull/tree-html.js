// B"H
/**
 * @file tree-html.js
 * Chapter 5: the visible tree sings with checkboxes, collapse gates, and choice.
 * Directories become kings over their children, yet every file keeps its own spark.
 */

import { buildChangeTree } from './path-tree.js';
import { ensurePullTreeStyles } from './tree-styles.js';

/**
 * B"H - Renders selectable external changes for the pull dialog.
 * @param {object} summary Added, modified, deleted path arrays.
 * @returns {string} HTML for the selectable directory tree.
 */
export function renderPullTree(summary) {
    ensurePullTreeStyles();
    const tree = buildChangeTree(summary);
    const body = [...tree.children.values()].map(renderNode).join('');
    return `
        <div id="git-pull-tree" class="awts-git-pull-tree">
            ${body || '<div style="opacity:.75;">No file-level changes listed.</div>'}
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
            <button type="button" id="git-pull-select-all" class="secondary-btn">Select All</button>
            <button type="button" id="git-pull-select-none" class="secondary-btn">Select None</button>
        </div>`;
}

function renderNode(node) {
    if (node.kind === 'file') return renderFile(node);
    const children = [...node.children.values()].map(renderNode).join('');
    return `
        <details open data-pull-dir="${escapeAttr(node.path)}" class="awts-pull-dir">
            <summary class="awts-pull-summary">
                <input type="checkbox" data-pull-dir-check="${escapeAttr(node.path)}" checked>
                <strong class="awts-pull-name">${escapeHtml(node.name)}</strong>
            </summary>
            <div class="awts-pull-children">${children}</div>
        </details>`;
}

function renderFile(node) {
    return `
        <label class="awts-pull-file">
            <input type="checkbox" data-pull-file="${escapeAttr(node.path)}" checked>
            <span>[${escapeHtml(node.status)}]</span>
            <span class="awts-pull-name">${escapeHtml(node.name)}</span>
        </label>`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
}
