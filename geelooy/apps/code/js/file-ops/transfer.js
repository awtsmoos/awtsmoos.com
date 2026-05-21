
// B"H
/**
 * @file transfer.js
 * @brief The Hub for Data Movement.
 */

import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { ContextGenerator } from './context-generator.js';
import { SelectionManager } from '../selection-manager.js';
import { Workspaces } from '../workspaces.js';
import { Tabs } from '../tabs/index.js';
import { Paster } from './transfer/Paster.js';

export const Transfer = {
    async generateMarkdownContext(items, basePath = "") {
        return await ContextGenerator.generate(items, basePath);
    },

    async copySelected() {
        const selectedPaths = Array.from(State.selectedItems);
        if (selectedPaths.length === 0) return UI.showToast("No items selected.", "info");

        const itemsToCopy = selectedPaths
            .map(p => State.domItemMap.get(p)?.item)
            .filter(Boolean);

        if (itemsToCopy.length === 0) return UI.showToast("Lost connection to selected vessels.", "error");

        State.fileClipboard = itemsToCopy;
        State.clipboardZip = null;
        
        UI.showToast(`${itemsToCopy.length} item(s) copied.`, 'success');
        SelectionManager.end();
    },

    async copyAllContents(items) {
        if (!items || items.length === 0) return;
        const taskId = `copy-ctx-${Date.now()}`;
        UI.startTask(taskId, "Preparing context...");
        try {
            const basePath = (items.length === 1 && items[0].kind === 'directory') ? items[0].path : "";
            const content = await this.generateMarkdownContext(items, basePath);
            await navigator.clipboard.writeText(content);
            UI.endTask(taskId, 'success', 'Copied to clipboard!');
        } catch (e) { UI.endTask(taskId, 'error', e.message); }
    },
    
    async downloadAllContents(items) {
        if (!items || items.length === 0) return;
        const taskId = `dl-ctx-${Date.now()}`;
        UI.startTask(taskId, "Generating Markdown...");
        try {
            const basePath = (items.length === 1 && items[0].kind === 'directory') ? items[0].path : "";
            const content = await this.generateMarkdownContext(items, basePath);
            const blob = new Blob([content], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `context_export_${Date.now()}.md.txt`;
            a.click();
            URL.revokeObjectURL(url);
            UI.endTask(taskId, 'success', 'Downloaded!');
        } catch (e) { UI.endTask(taskId, 'error', e.message); }
    },

    async deleteSelected() {
        const selected = Array.from(State.selectedItems).map(p => State.domItemMap.get(p)?.item).filter(Boolean);
        if (selected.length === 0) return;
        
        const confirmed = await UI.showDialog({ title: "Delete Selection", message: `Delete ${selected.length} items?`, okText: "Delete" });
        if (!confirmed) return;

        const taskId = `del-sel-${Date.now()}`;
        UI.startTask(taskId, "Deleting...");
        try {
            for (let i = 0; i < selected.length; i++) {
                const item = selected[i];
                UI.updateTask(taskId, (i / selected.length) * 100, `Purging: ${item.name}`);
                const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                if (tab) await Tabs.close(tab.id, true);
                await FileSystemProvider.delete(item);
            }
            const parents = new Set(selected.map(item => `${item.workspaceId}::${item.path.substring(0, item.path.lastIndexOf('/')) || '/'}`));
            for (const up of parents) {
                const entry = State.domItemMap.get(up);
                if (entry) await Workspaces.refreshNode(entry.item);
            }
            UI.endTask(taskId, 'success', 'Selection deleted.');
        } catch (e) { UI.endTask(taskId, 'error', e.message); }
        finally { SelectionManager.end(); }
    },

    async paste(destinationDir) {
        await Paster.execute(destinationDir);
    },

    async pullAndOverwrite(gitContextItem, gitInfo) {
        const { runPullFlow } = await import('../git/pull/flow.js');
        return await runPullFlow(gitContextItem, gitInfo);
    }
};
