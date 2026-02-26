
// B"H
import { FileOperations } from '../../file-operations.js';

export const DATA_TRANSFER_ACTIONS = {
    'copy-all-contents': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.copyAllContents([item]);
    },
    'download-all-contents': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.downloadAllContents([item]);
    },
    'copy-zip-single': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.copyAsZip([item]);
    },
    'download-zip-single': (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) FileOperations.downloadAsZip([item]);
    },
    'start-selection': (ctx) => {
        import('../../selection-manager.js').then(m => m.SelectionManager.start(ctx?.item || ctx?.payload?.item || ctx));
    },
    'delete-workspace': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) import('../commands/delete-workspace.js').then(m => m.default(ctx));
    },
    'git-actions': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) import('../commands/git-actions.js').then(m => m.default(ctx));
    },
    'switch-branch': async (ctx) => {
        const item = ctx?.item || ctx?.payload?.item || ctx;
        if(item) import('../../git/branches.js').then(m => m.GitBranches.switchBranch(item));
    }
};
