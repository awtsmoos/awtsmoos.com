
// B"H
/**
 * @file virtual-server.js
 * @brief The Divine Gateway for the Simulation.
 * 
 * THE POEM OF THE VIRTUAL DISK:
 * The simulation dreams of servers, of networks far and wide,
 * But all the truths it seeks to know are hidden deep inside.
 * The Virtual Server catches prayers sent out into the night,
 * And answers them with local sparks of manifested light.
 * It reads the text, it reads the byte, it knows the mime and name,
 * Ensuring that the virtual world and real world are the same.
 */

import { FileSystemProvider } from '../fs-provider.js';
import { State } from '../state.js';
import { PathResolver } from './resolver.js';
import { MimeUtil } from '../mime-util.js';

export const VirtualServer = {
    /**
     * @async
     * @function fetch
     * @description Resolves a simulated request into actual workspace data.
     * @param {string} workspaceId - The world ID.
     * @param {string} referrer - The path of the requesting vessel.
     * @param {string} reqPath - The requested relative or absolute path.
     * @returns {Promise<Object>} The resolved content and metadata.
     */
    async fetch(workspaceId, referrer, reqPath) {
        const absPath = PathResolver.resolve(referrer, reqPath);
        const ws = State.workspaces.find(w => String(w.id) === String(workspaceId));
        
        if (!ws) throw new Error(`Workspace ${workspaceId} has vanished from reality.`);
        
        const item = { ...ws, path: absPath, kind: 'file', workspaceId };
        console.log(`[VirtualServer] B"H - Retrieving Essence: ${absPath}`);
        
        const content = await FileSystemProvider.read(item);
        const mime = MimeUtil.getInfo(absPath).mime;
        
        let text = '';
        let buffer = null;

        if (content instanceof Blob) {
            buffer = await content.arrayBuffer();
            // We only decode text for scripts/html/json to prevent binary corruption in text fields
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

        return { text, buffer, mime, absPath };
    }
};
