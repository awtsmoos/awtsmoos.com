// B"H
/**
 * @file tunnel-device.js
 * @brief Editor filesystem provider for the signed-in user's native tunnel devices.
 * @description The workspace root lists the account's live devices from
 * /api/tunnel/control/devices - the same source File Explorer and the OS
 * workspace read - and each device opens like a folder: list, read, and
 * write flow through the shared OS tunnel client, whose transport observes
 * pending control receipts until the device's terminal answer lands, so a
 * slow device can no longer masquerade as an empty folder or a blank file.
 */

import { InlineLogin } from '../session/inline-login.js';
import * as TunnelClient from '../../../../os/remote/tunnelControlClient.js';

function splitPath(path = '.') {
    // B"H - '.' is a segment like any other to a naive split, and the editor
    // hands the workspace root to providers as '.', './', '/', and '' on
    // different calls. Dropping empty and '.' segments makes every root
    // shape yield NO route (the device list), and only a real first segment
    // names a device.
    const segments = String(path || '.').split('/').filter(segment => segment && segment !== '.');
    if (!segments.length) return { route: '', inner: '.' };
    return { route: segments[0], inner: segments.slice(1).join('/') || '.' };
}

function errorText(error, fallback) {
    if (typeof error === 'string' && error) return error;
    return error?.message || error?.code || fallback;
}

function joinInner(inner, name) {
    const base = !inner || inner === '.' ? '' : String(inner).replace(/\/+$/, '');
    return base ? `${base}/${name}` : name;
}

function deviceEntry(parent, device) {
    const route = String(device.routeReference || device.tunnelId || '');
    return {
        ...parent,
        name: String(device.deviceName || device.tunnelName || route),
        displayName: String(device.tunnelName || device.deviceName || route),
        kind: 'directory',
        type: 'tunnel-device',
        originalType: 'tunnel-device',
        isDirectory: true,
        path: route,
        route,
        workspaceId: parent.workspaceId || parent.id
    };
}

function childEntry(parent, route, inner, entry) {
    const rawName = entry.name || String(entry.path || '').split('/').filter(Boolean).pop() || '';
    if (!rawName) return null;
    const remotePath = entry.path || joinInner(inner, rawName);
    const directory = entry.isDirectory === true || entry.type === 'directory' || entry.kind === 'directory';
    return {
        ...parent,
        ...entry,
        name: rawName,
        displayName: rawName,
        kind: directory ? 'directory' : 'file',
        type: 'tunnel-device',
        originalType: 'tunnel-device',
        isDirectory: directory,
        path: `${route}/${remotePath}`,
        route,
        workspaceId: parent.workspaceId || parent.id
    };
}

export function createTunnelDeviceProvider(options = {}) {
    const rawFetch = options.fetchImpl || fetch;
    const fetchImpl = typeof rawFetch === "function" ? rawFetch.bind(globalThis) : rawFetch;
    const ensureSession = options.ensureSession || (() => InlineLogin.ensure());
    const clientOptions = { fetchImpl };

    async function api(route, action, payload = {}) {
        if (!route) throw new Error('A tunnel device route is required.');
        const got = await TunnelClient.fsAction(route, { action, ...payload }, clientOptions);
        if (!got || got.ok === false) {
            throw new Error(errorText(got?.error || got?.message, `Tunnel ${action} failed`));
        }
        return got;
    }

    async function loadDevices() {
        const session = await ensureSession();
        if (session?.ok === false) throw new Error('Awtsmoos login required.');
        const data = await TunnelClient.devices(clientOptions);
        if (!data || data.ok === false) {
            throw new Error(errorText(data?.error, 'Could not load tunnel devices.'));
        }
        return (data.nativeDevices || []).filter(device =>
            device.connected !== false &&
            device.isAlive !== false &&
            (device.routeReference || device.tunnelId)
        );
    }

    return {
        async list(item) {
            // B"H - the workspace root reaches this provider wearing several
            // path shapes ('.', './', '/', or the workspace item itself with
            // no path). All of them split to NO route segment, and no route
            // is exactly what "list the devices" means — only a path whose
            // first segment is a device route goes to the tunnel. (Before:
            // '/' and './' fell through to the fs call and died on the
            // route guard, so the workspace never listed a single device.)
            const { route, inner } = splitPath(String(item?.path || '.'));
            if (!route) {
                const devices = await loadDevices();
                return devices.map(device => deviceEntry(item, device));
            }
            // B"H - follow the agent's list pages to the end (cursor /
            // nextCursor); one page is a window, not the whole folder.
            const entries = [];
            let cursor = 0;
            for (let page = 0; page < 60; page++) {
                const data = await api(route, 'list', { path: inner, maxChars: 200000, limit: 300, cursor });
                const batch = data.detailedItems || data.items || [];
                entries.push(...batch);
                if (!data.hasNextPage || !batch.length) break;
                const next = Number(data.nextCursor);
                cursor = Number.isFinite(next) && next > cursor ? next : cursor + batch.length;
            }
            return entries.map(entry => childEntry(item, route, inner, entry)).filter(Boolean);
        },

        async read(item) {
            const { route, inner } = splitPath(String(item?.path || ''));
            const data = await api(route, 'read', { path: inner, maxChars: 200000 });
            return data.content ?? data.text ?? '';
        },

        async write(item, content) {
            const { route, inner } = splitPath(String(item?.path || ''));
            return await api(route, 'write', { path: inner, content: String(content ?? '') });
        },

        async create(parentDir, name, kind) {
            if (kind === 'directory') {
                throw new Error('Creating folders on a tunnel device is not supported yet.');
            }
            const { route, inner } = splitPath(String(parentDir?.path || '.'));
            if (!route) {
                throw new Error('Open a device first — new files live inside a device, not at the workspace root.');
            }
            const path = inner && inner !== '.' ? `${inner}/${name}` : name;
            return await api(route, 'write', { path, content: '' });
        },

        async delete() {
            throw new Error('Deleting files on a tunnel device is not supported yet.');
        },

        api
    };
}

export const TunnelDeviceProvider = createTunnelDeviceProvider();
