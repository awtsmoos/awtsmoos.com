
// B"H
/**
 * @file TimelineLedger.js
 * @brief Assembles the array of pre-mutation states for time travel (Undo/Redo).
 */

import { FileSystemProvider } from '../../../../fs-provider.js';
import { VibeDB } from '../../../db.js';

export const TimelineLedger = {
    activeTimelineLedger: [],
    volumetricBytesPushed: 0,

    /**
     * B"H
     * Records the state of a file BEFORE the AI alters it.
     */
    async recordStateBeforeChange(physicalRepresentationObj, shiftObject) {
        let priorStoredContent = null;
        try {
            const bytesRaw = await FileSystemProvider.read(physicalRepresentationObj);
            priorStoredContent = (bytesRaw instanceof Blob) ? await bytesRaw.text() : String(bytesRaw);
        } catch(ignorableAbsenceException) {}
        
        const prospectiveBytesValue = shiftObject.operation === 'delete' ? null : shiftObject.content;
        this.volumetricBytesPushed += prospectiveBytesValue ? prospectiveBytesValue.length : 0;
        
        this.activeTimelineLedger.push({
            path: shiftObject.path,
            operation: shiftObject.operation,
            oldContent: priorStoredContent,
            newContent: prospectiveBytesValue
        });
    },

    /**
     * B"H
     * Sinks the accumulated memory into IndexedDB.
     */
    async pushToDatabase(timestreamTokenId, parentWorldId) {
        if (this.activeTimelineLedger.length > 0) {
            // B"H - Auto-Label Generation
            const summaryLabel = this.activeTimelineLedger.map(c => c.path.split('/').pop()).join(', ');
            
            await VibeDB.saveTimelineRecord({
                id: String(Date.now()),
                sessionId: timestreamTokenId,
                workspaceId: parentWorldId,
                timestamp: Date.now(),
                sizeBytes: this.volumetricBytesPushed,
                summary: summaryLabel, // The injected label
                changes: [...this.activeTimelineLedger]
            });
        }
        this.activeTimelineLedger = [];
        this.volumetricBytesPushed = 0;
    }
};
