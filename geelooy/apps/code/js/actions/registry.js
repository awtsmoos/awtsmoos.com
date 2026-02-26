
// B"H
/**
 * @file registry.js
 * @brief The total integration of all system deeds.
 */

import { VibeAction } from './definitions/vibe.js';
import { ViewHtmlAction } from './definitions/view-html.js';
import { RevealInWorkspaceAction } from './definitions/reveal-in-workspace.js';
import { DeleteItemAction } from './definitions/delete-item.js';
import { RenameItemAction } from './definitions/rename-item.js';
import { CreateFileAction } from './definitions/create-file.js';
import { CreateFolderAction } from './definitions/create-folder.js';
import { DownloadAction } from './definitions/download.js';
import { BrowseInCommanderAction } from './definitions/browse-in-commander.js';
import { OpenTerminalHereAction } from './definitions/open-terminal-here.js';
import { OpenTerminalTabAction } from './definitions/open-terminal-tab.js';
import { OpenFileCommanderTabAction } from './definitions/open-file-commander-tab.js';
import { RefreshAction } from './definitions/refresh.js';
import { CopyNameAction } from './definitions/copy-name.js';
import { CopyRelativePathAction } from './definitions/copy-relative-path.js';
import { CopyMarkdownAction } from './definitions/copy-markdown.js';
import { DownloadMDContextAction } from './definitions/download-md-context.js';
import { CopyZipAction } from './definitions/copy-zip.js';
import { DownloadZipAction } from './definitions/download-zip.js';
import { SelectMultipleAction } from './definitions/select-multiple.js';

const ACTION_MAP = new Map([
    // --- System Tabs ---
    ['open-terminal-tab', OpenTerminalTabAction],['open-file-commander-tab', OpenFileCommanderTabAction],

    // --- Navigation & Viewing ---['vibe-code', VibeAction],
    ['view-html', ViewHtmlAction],
    ['preview', ViewHtmlAction],
    
    // B"H - Unified Reveal logic
    ['reveal-in-workspace', RevealInWorkspaceAction],
    ['show-in-workspace', RevealInWorkspaceAction], 
    
    ['browse-in-commander', BrowseInCommanderAction],
    ['open-terminal-here', OpenTerminalHereAction],
    ['refresh', RefreshAction],
    
    // --- Creation ---
    ['new-file', CreateFileAction],['create-file', CreateFileAction],
    ['new-folder', CreateFolderAction],['create-folder', CreateFolderAction],
    
    // --- Modification ---
    ['delete', DeleteItemAction],['delete-item', DeleteItemAction],
    ['rename', RenameItemAction],['rename-item', RenameItemAction],
    
    // --- Export & Data ---
    ['download', DownloadAction],['download-item', DownloadAction],['copy-name', CopyNameAction],['copy-relative-path', CopyRelativePathAction],['copy-all-as-markdown', CopyMarkdownAction],['download-md-context', DownloadMDContextAction],
    ['copy-as-zip', CopyZipAction],['download-zip', DownloadZipAction],
    
    // --- Utility ---
    ['select-multiple', SelectMultipleAction]
]);

export const ActionRegistry = {
    resolve(id) {
        const action = ACTION_MAP.get(id);
        if (!action) {
            console.warn(`B\"H - Registry: The deed [${id}] is unknown to the Creator's ledger.`);
            return null;
        }
        return action;
    }
};
