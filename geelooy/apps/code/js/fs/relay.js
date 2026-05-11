
// B"H
/**
 * @file relay.js
 * @brief The Ethereal Bridge (Refined & Silenced).
 */

import { State } from '../state.js';
import { PathHarmonizer } from './relay/PathHarmonizer.js';

export const RelayProvider = {
    async _request(item, action, content = null) {
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));
        if (!ws) throw new Error("Divine Connection Blocked: Workspace " + wsId + " vanished.");
        
        const url = ws.relayUrl || State.relayUrl;
        if (!url) throw new Error("Relay coordinate (URL) not established.");
        
        const absPath = PathHarmonizer.unify(ws.basePath || "/", item.path || "/");

        const params = new URLSearchParams();
        params.append('action', action);
        params.append('filepath', absPath);
        
        if (content !== null) {
            let text = content;
            if (content instanceof Blob) text = await content.text();
            params.append('content', String(text));
        }

        try {
            const response = await fetch(url.replace(/\/+$/, ''), {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => response.statusText);
                // B"H - We DO NOT console.error here, as 404s are normal for metadata checks!
                // We simply throw the error for the caller to handle gracefully.
                throw new Error("Relay Server Failure (" + response.status + "): " + errText);
            }

            return response;
        } catch (e) {
            // Keep network/fetch level errors visible, but not the HTTP 404s we just threw above.
            if (!e.message.includes("Relay Server Failure (404)")) {
                console.warn("[Relay] B\"H - Request Failed [" + action + " : " + absPath + "]: " + e.message);
            }
            throw e;
        }
    },

    async list(item) {
        const res = await this._request(item, 'list');
        const data = await res.json();
        
        return data.map(child => {
            const name = typeof child === 'string' ? child : child.name;
            const isDir = typeof child === 'string' ? !child.includes('.') : (child.isDirectory || child.type === 'directory');
            
            const childPath = (item.path === '/' ? '' : item.path) + '/' + name;
            
            return {
                name,
                kind: isDir ? 'directory' : 'file',
                path: childPath.replace(/\/+/g, '/'),
                workspaceId: item.workspaceId || item.id
            };
        });
    },

    async read(item) {
        const res = await this._request(item, 'read');
        return await res.blob();
    },

    async write(item, content) {
        await this._request(item, 'write', content);
    },

    async create(parent, name, kind) {
        const childPath = (parent.path === '/' ? '' : parent.path) + '/' + name;
        const normalizedChildPath = childPath.replace(/\/+/g, '/');
        
        if (kind === 'directory') {
            await this._request({ ...parent, path: normalizedChildPath }, 'mkdir');
        } else {
            await this._request({ ...parent, path: normalizedChildPath }, 'write', ''); 
        }
    },

    async delete(item) {
        await this._request(item, 'delete');
    }
};
