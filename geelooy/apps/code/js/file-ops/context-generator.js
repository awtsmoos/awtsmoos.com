// B"H
// FILE: js/file-ops/context-generator.js
import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';

/**
 * --- CONTEXT GENERATOR ---
 * The architect of the "Codebase Scroll". 
 * B"H - Distills a physical directory into a Markdown essence.
 */
export const ContextGenerator = {
    async generate(items, basePath = "") {
        let combinedContent = 'B"H\n\n'; 
        
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

        const processItem = async (item) => {
            if (!item || !item.kind) return;
            const displayPath = getRelative(item.path) || item.name;

            if (item.kind === 'file') {
                const ext = item.name.split('.').pop().toLowerCase();
                if (['png', 'jpg', 'zip', 'pdf', 'exe', 'bin', 'mp4'].includes(ext)) return;

                try {
                    const content = await FileSystemProvider.read(item);
                    let textContent = '';
                    if (typeof content === 'string') textContent = content;
                    else if (content instanceof Blob) textContent = await content.text();
                    else if (content && content.base64Content) textContent = atob(content.base64Content);

                    combinedContent += `### File: \`${displayPath}\`\n\n\`\`\`\n${textContent.trim()}\n\`\`\`\n\n---\n\n`;
                } catch(e) {
                    console.warn(`[Context] Skip ${item.path}: ${e.message}`);
                }
            } else if (item.kind === 'directory') {
                combinedContent += `## Directory: \`${displayPath}\`\n\n`;
                try {
                    const result = await FileSystemProvider.list(item);
                    const children = Array.isArray(result) ? result : (result.entries || []);
                    for (const child of children) {
                        const ws = State.workspaces.find(w => w.id === (item.workspaceId ?? item.id));
                        if (ws) await processItem({ ...ws, ...child, workspaceId: ws.id });
                    }
                } catch(e) { console.error(`[Context] List failed: ${displayPath}`, e); }
            }
        };

        for (const item of items) await processItem(item);
        return combinedContent;
    }
};
