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
    const segments = String(path || '.').split('/').filter(Boolean);
    if (!segments.length) return { route: '', inner: '.' };
    return { route: segments[0], inner: segments.slice(1).join('/') || '.' };
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
            throw new Error(got?.error || got?.message || `Tunnel ${action} failed`);
        }
        return got;
    }

    async function loadDevices() {
        const session = await ensureSession();
        if (session?.ok === false) throw new Error('Awtsmoos login required.');
        const data = await TunnelClient.devices(clientOptions);
        if (!data || data.ok === false) {
            throw new Error(data?.error || 'Could not load tunnel devices.');
        }
        return (data.nativeDevices || []).filter(device =>
            device.connected !== false &&
            device.isAlive !== false &&
            (device.routeReference || device.tunnelId)
        );
    }

    return {
        async list(item) {
            const raw = String(item?.path || '.');
            if (!raw || raw === '.') {
                const devices = await loadDevices();
                return devices.map(device => deviceEntry(item, device));
            }
            const { route, inner } = splitPath(raw);
            const data = await api(route, 'list', { path: inner, maxChars: 200000 });
            const entries = data.detailedItems || data.items || [];
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
