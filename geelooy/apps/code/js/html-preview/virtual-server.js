
// B"H
/**
 * @file virtual-server.js
 * @brief The Divine Gateway and the Mashpia (Giver) for the Simulation.
 * 
 * THE POEM OF THE VIRTUAL DISK:
 * The simulation dreams of servers, of networks far and wide,
 * But all the truths it seeks to know are hidden deep inside.
 * The Virtual Server catches prayers sent out into the night,
 * And answers them with local sparks of manifested light.
 * It reads the text, it reads the byte, it knows the mime and name,
 * Ensuring that the virtual world and real world are the same.
 * 
 * If a path is sought and nowhere found, and extensions are not seen,
 * We serve the index to the screen, to keep the React dream!
 */

import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';
import { PathResolver } from './resolver.js';
import { MimeUtil } from '../mime-util.js';

export const VirtualServer = {
    /**
     * @async
     * @function fetch
     * @description Resolves a simulated request into actual workspace data, with SPA fallback.
     */
    async fetch(workspaceId, referrer, reqPath) {
        const absPath = PathResolver.resolve(referrer, reqPath);
        const ws = State.workspaces.find(w => String(w.id) === String(workspaceId));
        
        if (!ws) throw new Error(`B"H - Workspace ${workspaceId} has vanished from reality.`);
        
        let item = { ...ws, path: absPath, kind: 'file', workspaceId };
        console.log(`[VirtualServer] B"H - Retrieving Essence: ${absPath}`);
        
        let content;
        let finalPath = absPath;

        try {
            content = await FileSystemProvider.read(item);
        } catch (e) {
            // B"H - SPA ROUTING FALLBACK
            // If the requested path has no file extension, we assume it is a client-side route
            // and serve the index.html from the root of the workspace.
            const fileName = absPath.split('/').pop();
            
            if (!fileName.includes('.')) {
                console.log(`[VirtualServer] B"H - Path [${absPath}] unmanifested. Falling back to Root index.html for SPA routing.`);
                finalPath = '/index.html';
                item = { ...ws, path: finalPath, kind: 'file', workspaceId };
                try {
                    content = await FileSystemProvider.read(item);
                } catch (fallbackErr) {
                    throw new Error(`[VirtualServer] B"H - SPA Fallback failed. No index.html found at root.`);
                }
            } else {
                throw e; // The void remains void.
            }
        }
        
        const mimeInfo = MimeUtil.getInfo(finalPath);
        const mime = mimeInfo.mime;
        
        let text = '';
        let buffer = null;

        if (content instanceof Blob) {
            buffer = await content.arrayBuffer();
            if (mime.includes('text') || mime.includes('json') || mime.includes('javascript')) {
                text = new TextDecoder().decode(buffer);
            }
        } else if (typeof content === 'string') {
            text = content;
        } else if (content && content.base64Content) {
            text = atob(content.base64Content);
            const bytes = new Uint8Array(text.length);
            for(let i=0; i<text.length; i++) bytes[i] = text.charCodeAt(i);
            buffer = bytes.buffer;
        }

        return { text, buffer, mime, absPath: finalPath };
    }
};
