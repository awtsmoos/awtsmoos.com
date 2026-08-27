
// B"H
import { FileOperations } from '../file-operations.js';
import { SelectionState } from './state.js';

export const SelectionActions = {
    handle(action, onEnd) {
        const items = SelectionState.getItems();
        if (items.length === 0 && action !== 'cancel') return;
        
        const map = {
            'copy': () => FileOperations.copySelected(), // Selection ends internally
            'copy-md': () => { FileOperations.copyAllContents(items); onEnd(); },
            'download-md': () => { FileOperations.downloadAllContents(items); onEnd(); },
            'copy-zip': () => { FileOperations.copyAsZip(items); onEnd(); },
            'download-zip': () => { FileOperations.downloadAsZip(items); onEnd(); },
            'delete': () => FileOperations.deleteSelected(), // Selection ends internally
            'cancel': () => onEnd()
        };
        
        if (map[action]) map[action]();
    }
};
