
// B"H
/**
 * @file relay.js
 * @brief The Ethereal Bridge (now with explicit offline signals).
 */

import { State } from '../state.js';
import { PathHarmonizer } from './relay/PathHarmonizer.js';

function relayError(message, options = {}) {
    const err = new Error(message);
    err.code = options.code || 'RELAY_ERROR';
    err.relayUrl = options.relayUrl || '';
    err.absPath = options.absPath || '';
    err.action = options.action || '';
    return err;
}

function isNetworkFailure(e) {
    const msg = String(e?.message || e).toLowerCase();
    return msg.includes('failed to fetch') ||
        msg.includes('networkerror') ||
        msg.includes('err_connection_refused') ||
        msg.includes('net::err_connection_refused');
}

function humanAction(action) {
    return {
        list: 'list folder',
        read: 'read file',
        write: 'write file',
        mkdir: 'create folder',
        delete: 'delete path'
    }[action] || action;
}

export const RelayProvider = {
    async _request(item, action, content = null) {
        const wsId = item.workspaceId || item.id;
        const ws = State.workspaces.find(w => String(w.id) === String(wsId));
        if (!ws) throw relayError("Workspace " + wsId + " is no longer mounted.", { code: 'RELAY_WORKSPACE_MISSING', action });
        
        const url = ws.relayUrl || State.relayUrl;
        if (!url) throw relayError("Relay URL is not configured.", { code: 'RELAY_NO_URL', action });
        
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
                throw relayError("Relay server rejected "> humanAction(action) + " (" + response.status + "). " + errText, {
                    code: 'RELAY_HTTP_ERROR', relayUrl: url, absPath, action
                });
            }

            return response;
        } catch (e) {
            if (e.code && String(e.code).startsWith('RELAY_')) throw e;

            if (isNetworkFailure(e)) {
                throw relayError('RELAY_OFFLINE: could not reach the relay server at ' + url + '. The local relay server is probably not running.', {
                    code: 'RELAY_OFFLINE', relayUrl: url, absPath, action
                });
            }

            throw relayError('Relay request failed while trying to ' + humanAction(action) + ': ' + (e.message || e), {
                code: 'RELAY_REQUEST_FAILED', relayUrl: url, absPath, action
            });
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
