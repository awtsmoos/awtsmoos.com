// B"H
/**
 * @file context-generator.js
 * @brief The Architect of Contextual Revelation.
 */

import { FileSystemProvider } from '../fs-provider.js';

export const ContextGenerator = {
    /**
     * @async
     * @function generate
     * @description Gathers essence within a path. PURE DATA ONLY.
     */
    async generate(items, basePath = "", onProgress = null) {
        let combinedContent = ''; 
        const baseStr = (basePath === "/" ? "" : basePath);

        const getRelative = (fullPath) => {
            if (!baseStr) return fullPath.startsWith("/") ? fullPath.substring(1) : fullPath;
            if (fullPath === baseStr) return "";
            if (fullPath.startsWith(baseStr + "/")) return fullPath.substring(baseStr.length + 1);
            return fullPath;
        };

        const processItem = async (item) => {
            if (!item || !item.kind) return;
            const itemPath = item.path || "/";
            const relPath = getRelative(itemPath);

            if (item.kind === 'file') {
                const ext = itemPath.split('.').pop().toLowerCase();
                if (['png','jpg','jpeg','gif','zip','pdf','exe','bin','mp4','woff','ttf','map','svg'].includes(ext)) return;
                
                // B"H - Spark the UI tracker
                if (onProgress) onProgress(`Absorbing: ${relPath || item.name}`);

                try {
                    const content = await FileSystemProvider.read(item);
                    let text = '';
                    if (typeof content === 'string') text = content;
                    else if (content instanceof Blob) text = await content.text();
                    else if (content && content.base64Content) text = atob(content.base64Content);
                    
                    combinedContent += `### File: \`${relPath || item.name}\`\n\n\`\`\`\n${text.trim()}\n\`\`\`\n\n---\n\n`;
                } catch(e) {}
            } else if (item.kind === 'directory') {
                if (['node_modules', '.git', '.awtsmoos-repo'].includes(item.name)) return;
                if (relPath) combinedContent += `## Directory: \`${relPath}\`\n\n`;

                try {
                    const result = await FileSystemProvider.list(item);
                    const children = result.entries || [];
                    for (const child of children) {
                        const childPath = (itemPath === "/" ? "" : itemPath) + "/" + child.name;
                        await processItem({ ...item, ...child, path: childPath });
                    }
                } catch(e) {}
            }
        };

        for (const item of items) {
            await processItem(item);
        }
        
        return combinedContent;
    }
};