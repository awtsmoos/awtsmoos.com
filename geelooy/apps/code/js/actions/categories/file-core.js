
// B"H
import { FileActions } from '../files.js';
import { Tabs } from '../../tabs/index.js';
import { FileCommander } from '../../file-commander.js';
import { Terminal } from '../../terminal/index.js';
import { FileOperations } from '../../file-operations.js';
import { State } from '../../state.js';

export const CORE_FILE_ACTIONS = {
    'save': (ctx) => FileActions.save(),
    'new-temp-file': () => FileActions.newTempFile(),
    'open-file': () => FileActions.openLocalFile(),
    'open-file-tab': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) Tabs.create(item);
    },
    'open-file-commander-tab': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileCommander.open(item);
    },
    'open-terminal-tab': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) Terminal.open(item);
    },
    'copy-item': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        const { UI } = await import('../../ui.js');
        if (State.isSelectionModeActive && State.selectedItems.size > 0) {
            FileOperations.copySelected();
        } else if (item) {
            State.fileClipboard = [item];
            State.clipboardZip = null;
            UI.showToast(`Copied: ${item.name}`, "success");
        }
    },
    'paste': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.paste(item);
    },
    'duplicate-item': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.duplicateItem(item);
    },
    'download-file': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.downloadFile(item);
    },
    'new-file': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        import('../commands/new-file.js').then(m => m.default(item));
    },
    'new-folder': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        import('../commands/new-folder.js').then(m => m.default(item));
    },
    'rename': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        import('../commands/rename.js').then(m => m.default(item));
    },
    'delete': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        import('../commands/delete.js').then(m => m.default(item));
    }
};
