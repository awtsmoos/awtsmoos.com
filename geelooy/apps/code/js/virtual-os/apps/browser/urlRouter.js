
// B"H
/**
 * @file urlRouter.js
 * @description
 * Routes Virtual Browser addresses to real localhost, simulated localhost, or srcdoc.
 */

import { SimulatedServerRegistry } from '../../simulated/SimulatedServerRegistry.js';

/**
 * @function normalizeAddress
 * @param {string} address Address.
 * @returns {string} Normalized address.
 */
export function normalizeAddress(address) {
    const text = String(address || '').trim();
    if (!text) return 'about:blank';
    if (text === 'localhost') return 'http://localhost:3000/';
    if (text.startsWith('localhost:')) return `http://${text}`;
    if (text.startsWith('sim:')) return text.replace('sim:', 'http://simulated.localhost:');
    if (/^[a-z]+:\/\//i.test(text)) return text;
    return text;
}

/**
 * @function resolveBrowserAddress
 * @param {string} address Address.
 * @returns {object} Route object.
 */
export function resolveBrowserAddress(address) {
    const url = normalizeAddress(address);
    const simulated = SimulatedServerRegistry.resolve(url);

    if (simulated) {
        return {
            type: 'simulated',
            url,
            html: simulated.html,
            ok: simulated.ok
        };
    }

    if (url === 'about:blank') {
        return {
            type: 'srcdoc',
            url,
            html: '<!doctype html><html><body></body></html>'
        };
    }

    return {
        type: 'real-url',
        url
    };
}
