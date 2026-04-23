
// B"H
/**
 * @file Paster.js
 * @brief The Executor of the Paste Ritual.
 */

import { State } from '../../state.js';
import { UI } from '../../ui.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { Exporter } from '../exporter.js';
import { LocalFastCopy } from './LocalFastCopy.js';
import { FallbackCopy } from './FallbackCopy.js';

export const Paster = {
    async execute(destinationDir) {
        if (!State.fileClipboard?.length && !State.clipboardZip) {
            UI.showToast("Clipboard empty.", "warning");
            return;
        }
        
        const taskId = `paste-${Date.now()}`;
        UI.startTask(taskId, "Analyzing clipboard...");

        try {
            // --- SCENARIO 1: LAZY ZIP PASTE ---
            if (State.clipboardZip) {
                const blob = State.clipboardZip.type === 'lazy-zip' 
                    ? await Exporter.createZipBlob(State.clipboardZip.items) 
                    : State.clipboardZip.blob;
                    
                const path = `${destinationDir.path === '/' ? '' : destinationDir.path}/${State.clipboardZip.name}`;
                await FileSystemProvider.write({ ...destinationDir, path, kind: 'file' }, await blob.arrayBuffer());
                
                UI.endTask(taskId, 'success', 'ZIP Pasted.');
            } 
            
            // --- SCENARIO 2: STANDARD COPY/PASTE ---
            else {
                const sourceItems = State.fileClipboard.map(p => {
                    if (typeof p === 'string') return State.domItemMap.get(p)?.item;
                    return p;
                }).filter(Boolean);
                
                if (sourceItems.length === 0) {
                    throw new Error("Source items lost from memory.");
                }

                // Calculate Progress Logic
                let totalFiles = 0;
                for (const src of sourceItems) {
                    if (src.kind === 'file') totalFiles++;
                    else {
                        const all = await FileSystemProvider.listAllFiles(src);
                        totalFiles += all.length;
                    }
                }
                
                let processedFiles = 0;
                const onProgress = (path) => {
                    processedFiles++;
                    const percent = (processedFiles / Math.max(1, totalFiles)) * 100;
                    UI.updateTask(taskId, percent, `Pasting: ${path.split('/').pop()}`);
                };

                // The Attempt at Transfer
                for (const src of sourceItems) {
                    let fastSuccess = false;
                    
                    // Attempt Lightning Fast Copy if both are Local
                    const srcType = src.originalType || src.type;
                    const destType = destinationDir.originalType || destinationDir.type;
                    
                    if (srcType === 'local' && destType === 'local') {
                        fastSuccess = await LocalFastCopy.execute(src, destinationDir, onProgress);
                    }
                    
                    // If fast path failed or is inapplicable, use Universal Fallback
                    if (!fastSuccess) {
                        await FallbackCopy.execute(src, destinationDir, onProgress);
                    }
                }

                UI.endTask(taskId, 'success', `B"H - ${totalFiles} items manifested.`);
            }
        } catch (e) {
            console.error(e);
            UI.endTask(taskId, 'error', `Paste failed: ${e.message}`);
        } finally {
            await Workspaces.refreshNode(destinationDir);
        }
    }
};
