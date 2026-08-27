// B"H
/**
 * @file flow.js
 * Chapter 3: before overwrite, judgment; after judgment, mercy with progress.
 * The Awtsmoos lets the user see the remote storm before it descends.
 */

import { UI } from '../../ui.js';
import { Workspaces } from '../../workspaces.js';
import { checkExternalChanges } from './external-changes.js';
import { choosePullPaths } from './selection-dialog.js';
import { overwriteFromRemote } from './overwrite.js';

/**
 * B"H - Runs the pull UX: preflight, optional overwrite, progress, refresh.
 * @param {object} item Local repo item or item inside a repo.
 * @param {object} gitInfo Parsed clone metadata.
 * @param {object} options Optional callbacks such as onPulled.
 * @returns {Promise<object|null>} Pull report or null when cancelled/no changes.
 */
export async function runPullFlow(item, gitInfo, options = {}) {
    const taskId = `git-pull-${Date.now()}`;
    UI.startTask(taskId, 'Checking remote changes...');

    try {
        const report = await checkExternalChanges(gitInfo);
        const phrase = describeReport(report);
        UI.updateTask(taskId, 15, phrase);

        if (!report.hasExternalChanges && report.summary.total === 0) {
            UI.endTask(taskId, 'success', 'Already up to date.');
            UI.showToast('Git pull: already up to date.', 'success');
            return null;
        }

        const selectedPaths = await choosePullPaths(report, phrase);
        if (!selectedPaths) {
            UI.endTask(taskId, 'info', 'Pull cancelled.');
            return null;
        }

        const result = await overwriteFromRemote(item, gitInfo, report, (message, percent) => {
            UI.updateTask(taskId, percent, message);
        }, { selectedPaths });

        const skipped = result.skipped?.length || 0;
        const status = skipped ? 'warning' : 'success';
        const message = skipped
            ? `Pulled ${result.written} file(s), removed ${result.removed}, skipped ${skipped}.`
            : `Pulled ${result.written} file(s), removed ${result.removed}.`;

        UI.endTask(taskId, status, message);
        UI.showToast(skipped ? 'Git pull completed with skipped files.' : 'Git pull completed.', skipped ? 'warning' : 'success');
        await Workspaces.refreshNode(item).catch(() => {});
        if (typeof options.onPulled === 'function') await options.onPulled(result, report);
        return result;
    } catch (error) {
        console.error('[GitPull]', error);
        UI.endTask(taskId, 'error', 'Pull failed: ' + error.message);
        throw error;
    }
}

/**
 * B"H - Converts the report into a human status line.
 * @param {object} report External change report.
 * @returns {string} Status sentence.
 */
export function describeReport(report) {
    const s = report.summary || { added: [], modified: [], deleted: [], total: 0 };
    if (!report.hasExternalChanges && s.total === 0) return 'No external changes found.';
    return [
        `External changes found on ${report.branch}.`,
        `Added: ${s.added.length}`,
        `Modified: ${s.modified.length}`,
        `Deleted: ${s.deleted.length}`
    ].join(' ');
}
