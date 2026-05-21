// B"H
/**
 * @file selection-dialog.js
 * Chapter 7: the user beholds the remote decree and chooses which sparks descend.
 * No overwrite enters blindly; every path may bow, stand, or wait.
 */

import { UI } from '../../ui.js';
import { renderPullTree } from './tree-html.js';
import { bindPullTreeEvents } from './tree-events.js';
import { collectSelectedPullPaths } from './path-tree.js';

/**
 * B"H - Shows external changes and returns selected paths for pull.
 * @param {object} report External change report.
 * @param {string} phrase Human summary sentence.
 * @returns {Promise<Set<string>|null>} Selected file paths, or null when cancelled.
 */
export async function choosePullPaths(report, phrase) {
    const contentHTML = `
        <p style="white-space:pre-wrap;">${escapeHtml(phrase)}</p>
        <p style="opacity:.8;">Choose exactly which remote files/directories to pull.</p>
        ${renderPullTree(report.summary || {})}`;

    const okPromise = UI.showDialog({
        title: 'Pull Remote Changes',
        contentHTML,
        okText: 'Pull Selected & Overwrite',
        cancelText: 'Cancel'
    });

    const dialog = document.getElementById('generic-dialog');
    const panel = dialog?.querySelector('.dialog-content');
    if (panel) {
        panel.style.maxWidth = '760px';
        panel.style.width = '92vw';
        panel.style.overflow = 'visible';
    }
    bindPullTreeEvents(dialog);
    const ok = await okPromise;
    if (!ok) return null;

    const selected = collectSelectedPullPaths(dialog);
    if (selected.size === 0) {
        UI.showToast('No files selected for pull.', 'warning');
        return null;
    }
    return selected;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
