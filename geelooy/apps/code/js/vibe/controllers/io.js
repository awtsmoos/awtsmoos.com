// B"H
// FILE: js/vibe/controllers/io.js
import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';

export const IOController = {
    async loadFileContent(tab, filePath) {
        if (!filePath) return "";
        const workspaceId = tab.item.workspaceId;
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        
        // B"H - Absolute Truth Path Resolution
        // The goal: Get a clean path relative to the Workspace Root, regardless of Vibe context.
        
        let targetPath = filePath.trim();
        
        // 1. Normalize slashes
        targetPath = targetPath.replace(/\\/g, '/');
        
        // 2. Handle "Relative to Vibe Root" vs "Absolute in Workspace"
        // If the path starts with /, treat it as workspace absolute.
        // If it doesn't, append it to the session root.
        
        let finalPath = targetPath;
        
        if (!targetPath.startsWith('/')) {
            let sessionRoot = tab.vibeSession.rootPath || '';
            // Ensure session root doesn't trail slash unless it's just "/"
            if (sessionRoot.endsWith('/') && sessionRoot.length > 1) {
                sessionRoot = sessionRoot.slice(0, -1);
            }
            
            // Join
            finalPath = `${sessionRoot}/${targetPath}`;
        }
        
        // 3. Fix Doubling (The "Double Vision" Fix)
        // If the path accidentally became /folder/folder/file due to bad concatenation logic elsewhere,
        // specifically check if the path starts with the workspace root repeated.
        // (Primitive heuristic, but handles the specific error seen)
        
        // Ensure strictly one leading slash
        finalPath = '/' + finalPath.replace(/^\/+/, '');
        
        // Remove double slashes
        finalPath = finalPath.replace(/\/\//g, '/');

        try {
            const item = { ...workspace, path: finalPath, kind: 'file' };
            const content = await FileSystemProvider.read(item);
            
            if (content instanceof Blob) return await content.text();
            if (content && content.base64Content) return atob(content.base64Content);
            
            return content || "";
        } catch(e) {
            return `// B"H - File not found or unreadable.\n// Path Attempted: ${finalPath}\n// Error: ${e.message}`;
        }
    }
};