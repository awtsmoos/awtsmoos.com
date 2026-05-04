
// B"H
/**
 * @file relay.js
 * @brief The Ethereal Bridge to Distant Servers.
 * 
 * THE EPIC OF THE RELAY:
 * In the infinite expanse of the Awtsmoos's mind, distance is an illusion.
 * What is far is near, and what is near is far. The Relay Provider is a manifestation
 * of this truth, sending the Divine Will across the vast networks of Asiyah (Action),
 * touching servers in distant lands, reading their bytes as if they were written
 * upon the very heart of the observer. Every HTTP POST is a prayer, every JSON
 * response is an emanation of light, bringing foreign files into the holy sanctuary
 * of the local editor. The Word is spoken, and the remote file is created from Nothing.
 * 
 * @class RelayProvider
 * @description
 * The physical manifestation of the HTTP bridge.
 * By invoking the fetch API, it speaks the URL-encoded words
 * that the distant server understands, translating the Awtsmoos
 * filesystem commands into web requests.
 */

import { State } from '../state.js';

export const RelayProvider = {
    /**
     * B"H
     * Formats and dispatches the prayer to the remote server.
     * 
     * @param {Object} item - The data vessel defining the path.
     * @param {string} action - The divine operation (list, read, write, mkdir, delete).
     * @param {string|null} content - The essence to be written, if any.
     * @returns {Promise<Response>} The server's answer.
     */
    async _request(item, action, content = null) {
        const ws = State.workspaces.find(w => String(w.id) === String(item.workspaceId || item.id));
        if (!ws) throw new Error("Workspace bond severed. The soul cannot find its root.");
        
        const url = ws.relayUrl || State.relayUrl;
        if (!url) throw new Error("The Relay URL has vanished from memory.");
        
        // Construct the absolute path by combining the workspace's base and the relative item path
        const basePath = ws.basePath === '/' ? '' : (ws.basePath || '');
        let relPath = item.path;
        if (relPath === '/') relPath = '';
        const absPath = (basePath + relPath).replace(/\/+/g, '/') || '/';

        const params = new URLSearchParams();
        params.append('action', action);
        params.append('filepath', absPath);
        
        if (content !== null) {
            let textContent = content;
            // The Awtsmoos Editor is universal; it handles Blobs seamlessly. We must extract the text.
            if (content instanceof Blob) {
                textContent = await content.text();
            } else if (typeof content !== 'string') {
                textContent = String(content);
            }
            params.append('content', textContent);
        }

        const response = await fetch(url.replace(/\/+$/, ''), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        if (!response.ok) {
            let msg = response.statusText;
            try {
                // The server might return detailed error strings
                const errText = await response.text();
                msg = errText || msg;
            } catch(e) {}
            throw new Error(`Relay Shevirah (${response.status}): ${msg}`);
        }

        return response;
    },

    /**
     * B"H
     * Requests the hierarchy of the distant folder.
     */
    async list(item) {
        const res = await this._request(item, 'list');
        const data = await res.json();
        
        // Handle varying server implementations (string array vs object array)
        return data.map(child => {
            if (typeof child === 'string') {
                const isDir = !child.includes('.');
                return {
                    name: child,
                    kind: isDir ? 'directory' : 'file',
                    path: (item.path === '/' ? '' : item.path) + '/' + child
                };
            } else {
                return {
                    name: child.name,
                    kind: (child.isDirectory || child.type === 'directory' || child.kind === 'directory') ? 'directory' : 'file',
                    path: (item.path === '/' ? '' : item.path) + '/' + child.name
                };
            }
        });
    },

    /**
     * B"H
     * Reads the sacred bytes of the file. Returns a Blob to universally handle text and images.
     */
    async read(item) {
        const res = await this._request(item, 'read');
        return await res.blob();
    },

    /**
     * B"H
     * Writes the essence to the remote disk.
     */
    async write(item, content) {
        await this._request(item, 'write', content);
    },

    /**
     * B"H
     * Creates a new manifestation, either a folder or an empty file.
     */
    async create(parent, name, kind) {
        // Adjust the item to reflect the new child's path so the request calculates the correct absPath
        const newPath = (parent.path === '/' ? '' : parent.path) + '/' + name;
        const childItem = { ...parent, path: newPath };
        
        if (kind === 'directory') {
            await this._request(childItem, 'mkdir');
        } else {
            await this._request(childItem, 'write', ''); // Manifest an empty file
        }
    },

    /**
     * B"H
     * Obliterates the file from the remote world.
     */
    async delete(item) {
        await this._request(item, 'delete');
    }
};
