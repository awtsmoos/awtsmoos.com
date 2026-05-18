
// B"H
import { UI } from '../../ui.js';
import { ZipState } from '../state.js';
import { ZipFile } from '/scripts/awtsmoos/zip/encoder.js';
import { Tabs } from '../../tabs/index.js';
import { ZipRenderer } from '../render.js';
import { ZipUtils } from './utils.js';

export const ZipSave = {
    async save(zipTab) {
        const state = zipTab.zipState;
        if (!state) return;
        
        UI.showLoading("Recompressing ZIP...");
        
        try {
            const encoder = new ZipFile();
            const originalEntries = state.entries;
            const processedPaths = new Set();

            for (const entry of originalEntries) {
                if (state.deletedPaths.has(entry.filename)) continue;

                processedPaths.add(entry.filename);

                if (entry.isDir) {
                    encoder.addFolder(entry.filename);
                    continue;
                }
                
                let data;
                if (state.modifications.has(entry.filename)) {
                    const content = state.modifications.get(entry.filename);
                    data = await ZipUtils.normalizeContent(content);
                } else {
                    const blob = await entry.getData();
                    data = new Uint8Array(await blob.arrayBuffer());
                }
                
                encoder.addFile(entry.filename, data);
            }

            for (const [filename, info] of state.newEntries) {
                if (processedPaths.has(filename) || state.deletedPaths.has(filename)) continue; 

                if (info.isDir) {
                    encoder.addFolder(filename);
                } else {
                    let content = state.modifications.get(filename);
                    if (!content) content = new Uint8Array(0);
                    
                    const data = await ZipUtils.normalizeContent(content);
                    encoder.addFile(filename, data);
                }
                processedPaths.add(filename);
            }
            
            for (const [filename, content] of state.modifications) {
                if (processedPaths.has(filename) || state.deletedPaths.has(filename)) continue;
                const data = await ZipUtils.normalizeContent(content);
                encoder.addFile(filename, data);
            }
            
            const newBlob = encoder.build();
            
            zipTab.content = newBlob;
            zipTab.rawContent = newBlob; 

            await import('../../tabs/persistence.js').then(m => 
                m.TabsPersistence.save(zipTab, Tabs, { skipZipRecompression: true })
            );
            
            await ZipState.refresh(zipTab, newBlob);
            
            import('./index.js').then(m => ZipRenderer.render(zipTab, m.ZipOps));
            UI.showToast("Archive updated and saved.", "success");
            
        } catch(e) {
            UI.showToast("Failed to save ZIP: " + e.message, 'error');
        } finally {
            UI.hideLoading();
        }
    }
};
