
// B"H
/**
 * @file view-html.js
 * @brief THE VISUAL REVELATION.
 */

import { Tabs } from '../../tabs/index.js';
import { ItemResolver } from '../utils/itemResolver.js';
import { Dialog } from '../utils/dialog.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';

export default async function run(context) {
    let item = ItemResolver.resolve(context);

    // B"H - The Tikkun (Rectification): If the context resolved to a folder (likely from a stale contextTarget),
    // and a file tab is active, the user's true intent is to preview the active tab.
    if (item && item.kind === 'directory') {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && activeTab.item && activeTab.item.kind === 'file' && (activeTab.item.name.endsWith('.html') || activeTab.item.name.endsWith('.htm'))) {
            item = activeTab.item;
        }
    }

    if (!item || !item.path) {
        await Dialog.alert("B\"H\nCannot discern a file to preview. Please select an HTML file or tab.");
        return;
    }

    if (item.kind === 'directory' || item.kind === 'root') {
        await Dialog.alert("B\"H\nA domain (directory) cannot be previewed. Select a physical HTML file.");
        return;
    }

    console.log(`B"H - Unveiling light properties mapped to location -> ${item.path}`);

    try {
        const contentRaw = await FileSystemProvider.read(item);
        const content = contentRaw instanceof Blob ? await contentRaw.text() : String(contentRaw);
        
        Tabs.createPreview(item, content);

    } catch (e) {
        await Dialog.alert(`B\"H\nFailed to read the essence of ${item.name}: ${e.message}`);
    }
}
