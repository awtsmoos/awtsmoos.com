
// B"H
/**
 * @file ProjectHistorySync.js
 * @brief Anchoring spiritual memory to physical stone.
 */

import { VibeDB } from '../db.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { UI } from '../../ui.js';

export const ProjectHistorySync = {
    async exportFullBundle(tab) {
        const session = tab.vibeSession;
        if (!session) return;
        
        UI.showLoading("Compiling History Bundle...");
        try {
            const records = await VibeDB.getTimelineRecords(session.id);
            const bundle = {
                vibe: session,
                timeline: records,
                exportedAt: Date.now()
            };
            
            const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `History_${session.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            UI.hideLoading();
            UI.showToast("B\"H - History Bundle Exported.", "success");
        } catch (e) {
            UI.showToast("Export failed: " + e.message, "error");
        }
    },

    async importBundle(tab, file) {
        if (!file) return;
        UI.showLoading("Reconstituting Timeline...");
        try {
            const data = JSON.parse(await file.text());
            if (data.timeline) {
                for (const rec of data.timeline) {
                    // Update session ID to current one if importing into existing session
                    rec.sessionId = tab.vibeSession.id;
                    await VibeDB.saveTimelineRecord(rec);
                }
            }
            UI.showToast("B\"H - Timestream Re-aligned.", "success");
            return true;
        } catch (e) {
            UI.showToast("Import error: " + e.message, "error");
            return false;
        } finally { UI.hideLoading(); }
    },

    async syncToDisk(tab) {
        const session = tab.vibeSession;
        const taskId = `history-sync-${Date.now()}`;
        UI.startTask(taskId, "Syncing to Disk...");

        try {
            const records = await VibeDB.getTimelineRecords(session.id);
            const historyBundle = { timeline: records, timestamp: Date.now() };
            const rootPath = session.path || session.rootPath || "/";
            const historyPath = `${rootPath === '/' ? '' : rootPath}/.awtsmoos/history.json`;
            const workspaceId = tab.item.workspaceId;
            const state = await import('../../state.js');
            const ws = state.State.workspaces.find(w => w.id === workspaceId);

            await FileSystemProvider.write({ ...ws, path: historyPath, kind: 'file', workspaceId }, JSON.stringify(historyBundle, null, 2));
            UI.endTask(taskId, 'success', 'B"H - Disk Anchor Secured.');
        } catch (e) { UI.endTask(taskId, 'error', e.message); }
    }
};
