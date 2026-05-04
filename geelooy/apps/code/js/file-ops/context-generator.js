
// B"H
/**
 * @file context-generator.js
 * @brief The Architect of Contextual Revelation and the Absolute Boundary.
 * 
 * CHAPTER LVIII: THE UNIFIED INSTRUCTION
 */

import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';
import { PromptAssembler } from '../vibe/modules/prompts/directives/PromptAssembler.js';

export const ContextGenerator = {
    /**
     * @async
     * @function generate
     * @description Gathers essence strictly within the defined basePath, prefixed with holy instructions.
     */
    async generate(items, basePath = "") {
        let combinedContent = 'B"H\n\n'; 
        
        // --- INJECTING MODULAR DIVINE INSTRUCTIONS ---
        const firstItem = items[0];
        if (firstItem) {
            // Find a directory context to pass to the assembler
            const dirContext = firstItem.kind === 'directory' ? firstItem : {
                ...firstItem,
                path: firstItem.path.substring(0, firstItem.path.lastIndexOf('/')) || "/",
                kind: 'directory'
            };

            combinedContent += PromptAssembler.assemble(dirContext);
            combinedContent += `## EXTRACTED CONTEXT (FILE CONTENTS):\n\n`;
        }
        
        // Normalize the base boundary to prevent trailing slash errors
        const baseStr = (basePath === "/" ? "" : basePath);
        console.log(`[ContextGenerator] B"H - Bounding Box locked to: "${baseStr}"`);

        /**
         * @function getRelative
         * @description Extracts the clean relative path just like the external vibe coder.
         */
        const getRelative = (fullPath) => {
            if (!baseStr) return fullPath.startsWith("/") ? fullPath.substring(1) : fullPath;
            if (fullPath === baseStr) return "";
            if (fullPath.startsWith(baseStr + "/")) return fullPath.substring(baseStr.length + 1);
            return fullPath;
        };

        const processItem = async (item) => {
            if (!item || !item.kind) return;
            
            const itemPath = item.path || "/";
            
            // B"H - ABSOLUTE STRICTURE
            // If the item is not inside the target folder, banish it completely.
            if (baseStr && !itemPath.startsWith(baseStr)) {
                console.log(`[ContextGenerator] B"H - Blocked out of scope: ${itemPath}`);
                return;
            }

            const relPath = getRelative(itemPath);

            if (item.kind === 'file') {
                const ext = itemPath.split('.').pop().toLowerCase();
                if (['png','jpg','jpeg','gif','zip','pdf','exe','bin','mp4','woff','ttf','map','svg'].includes(ext)) return;

                // Log exactly what is being appended based on relative path
                console.log(`[ContextGenerator] B"H - Appending file to context: ${relPath || item.name}`);
                
                try {
                    const content = await FileSystemProvider.read(item);
                    let text = '';
                    if (typeof content === 'string') text = content;
                    else if (content instanceof Blob) text = await content.text();
                    else if (content && content.base64Content) text = atob(content.base64Content);
                    
                    combinedContent += `### File: \`${relPath || item.name}\`\n\n\`\`\`\n${text.trim()}\n\`\`\`\n\n---\n\n`;
                } catch(e) {
                    console.warn(`[ContextGenerator] B"H - Read failed for ${relPath}:`, e);
                }
            } else if (item.kind === 'directory') {
                // Do not descend into massive unholy black holes
                if (['node_modules', '.git', '.awtsmoos-repo', 'dist', 'build'].includes(item.name)) return;

                if (relPath) {
                    combinedContent += `## Directory: \`${relPath}\`\n\n`;
                }

                try {
                    const result = await FileSystemProvider.list(item);
                    const children = result.entries ||[];
                    for (const child of children) {
                        const childPath = (itemPath === "/" ? "" : itemPath) + "/" + child.name;
                        await processItem({ 
                            ...item, // Preserve workspace identity
                            ...child, 
                            path: childPath 
                        });
                    }
                } catch(e) {
                    console.error(`[ContextGenerator] B"H - List failed for ${itemPath}:`, e);
                }
            }
        };

        for (const item of items) {
            // Ensure initial entry points also obey the boundary
            if (baseStr && !(item.path || "/").startsWith(baseStr)) {
                console.log(`[ContextGenerator] B"H - Root item out of scope!`);
                continue;
            }
            await processItem(item);
        }
        
        return combinedContent;
    }
};
