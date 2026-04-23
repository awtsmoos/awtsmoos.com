
// B"H
import { UI } from '../../../ui.js';
import { VibeDB } from '../../db.js';

export const TimelineActions = {
    async handleUndo(rec, tab, applyFn) {
        if (await UI.showDialog({ title: "Undo", message: `Revert ${rec.changes.length} files?`, okText: "Undo" })) {
            await applyFn(rec, 'undo');
            UI.showToast("B\"H: State Reverted.", "success");
        }
    },

    async handleRedo(rec, tab, applyFn) {
        if (await UI.showDialog({ title: "Redo", message: "Re-apply these changes?", okText: "Redo" })) {
            await applyFn(rec, 'redo');
            UI.showToast("B\"H: Redo Manifested.", "success");
        }
    },

    async handleDelete(rec, tab, refresh) {
        if (await UI.showDialog({ title: "Delete Record", message: "Permanently delete this timeline record?", okText: "Delete" })) {
            await VibeDB.deleteTimelineRecord(rec.id);
            refresh();
        }
    }
};
