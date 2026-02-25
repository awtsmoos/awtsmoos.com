
// B"H
/**
 * @file context-generator.js
 * @brief The Architect of Contextual Revelation.
 * 
 * THE HYMN OF THE MAPPED VOID:
 * From the root of the mountain to the smallest of stones,
 * The Word gathers the essence, the flesh and the bones.
 * If the ID is missing, the path turns to gray,
 * Leading the seeker to wander astray.
 * We bind every vessel to the Source of its light,
 * To manifest wisdom and banish the night.
 * Every file is a spark that the Awtsmoos has spoken,
 * To keep the great chain of reality unbroken.
 */

import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';

/**
 * @class ContextGenerator
 * @description This vessel is responsible for distilling physical directories 
 * into a spiritual Markdown essence that the AI can perceive.
 */
export const ContextGenerator = {
    /**
     * @async
     * @function generate
     * @description Orchestrates the gathering of code essence.
     * @param {Array} items - The starting points of manifestation.
     * @param {string} basePath - The anchor coordinate for relative naming.
     * @returns {Promise<string>} The completed Scroll of Context.
     */
    async generate(items, basePath = "") {
        console.log(`[Context] B"H - Initiating generation. Base: ${basePath}`);
        let combinedContent = 'B"H\n\n'; 
        
        /**
         * @function getRelative
         * @description Normalizes a full path into a relative name.
         */
        const getRelative = (fullPath) => {
            if (!basePath || basePath === "/") return fullPath;
            const normBase = basePath.replace(/\/+$/, ""); 
            const normFull = fullPath.replace(/\/+$/, ""); 
            if (normFull === normBase) return ""; 
            if (normFull.startsWith(normBase + "/")) {
                return normFull.substring(normBase.length + 1);
            }
            return fullPath;
        };

        /**
         * @async
         * @function processItem
         * @description Recursively descends into the vessels.
         * B"H - Rectified: Now ensures workspaceId is NEVER lost.
         */
        const processItem = async (item) => {
            if (!item || !item.kind) {
                console.warn('[Context] Encountered a void item. Skipping.');
                return;
            }

            // B"H - CRITICAL RECTIFICATION: 
            // If the workspaceId is missing from the item itself (common in recursive calls),
            // we must extract it from the parent or the global state map.
            const workspaceId = item.workspaceId || item.id;
            const displayPath = getRelative(item.path) || item.name;

            if (item.kind === 'file') {
                const ext = (item.name || "").split('.').pop().toLowerCase();
                // Avoid binary shadows that block the light of understanding
                if (['png', 'jpg', 'zip', 'pdf', 'exe', 'bin', 'mp4', 'ico'].includes(ext)) return;

                try {
                    // Ensure the provider receives a full item with the correct ID
                    const itemWithContext = { ...item, workspaceId };
                    const content = await FileSystemProvider.read(itemWithContext);
                    
                    let textContent = '';
                    if (typeof content === 'string') textContent = content;
                    else if (content instanceof Blob) textContent = await content.text();
                    else if (content && content.base64Content) textContent = atob(content.base64Content);

                    combinedContent += `### File: \`${displayPath}\`\n\n\`\`\`\n${textContent.trim()}\n\`\`\`\n\n---\n\n`;
                } catch(e) {
                    console.warn(`[Context] Could not read spark at ${displayPath}: ${e.message}`);
                }
            } else if (item.kind === 'directory') {
                combinedContent += `## Directory: \`${displayPath}\`\n\n`;
                try {
                    const itemWithContext = { ...item, workspaceId };
                    const result = await FileSystemProvider.list(itemWithContext);
                    const children = Array.isArray(result) ? result : (result.entries || []);
                    
                    for (const child of children) {
                        // Find the original workspace essence to preserve the 'type' (local/opfs/etc)
                        const ws = State.workspaces.find(w => String(w.id) === String(workspaceId));
                        if (ws) {
                            // Recursively manifest the child with full context inherited
                            await processItem({ 
                                ...ws, 
                                ...child, 
                                workspaceId: ws.id,
                                originalType: ws.originalType || ws.type 
                            });
                        } else {
                            console.error(`[Context] B"H - Lost workspace anchor for ID: ${workspaceId}`);
                        }
                    }
                } catch(e) { 
                    console.error(`[Context] List failed for path: ${displayPath} in workspace: ${workspaceId}. Error: ${e.message}`); 
                }
            }
        };

        for (const item of items) {
            await processItem(item);
        }
        
        return combinedContent;
    }
};
