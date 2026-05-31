// B"H
/**
 * @file address.js
 * @description
 * Chapter 11: The Awtsmoos held the address bar like a river-mouth. Localhost,
 * sim routes, about:blank, and raw domains each received a clean channel.
 */

import { SimulatedServerRegistry } from '../../virtual-os/simulated/SimulatedServerRegistry.js';

/** @param {string} address Raw address. @returns {string} Browser-safe address. */
export function normalizeAddress(address) {
    const text = String(address || '').trim();
    if (!text) return 'about:blank';
    if (text === 'localhost') return 'http://localhost:3000/';
    if (text.startsWith('localhost:')) return `http://${text}`;
    if (text.startsWith('sim:')) return text.replace('sim:', 'http://simulated.localhost:');
    if (/^[a-z]+:\/\//i.test(text)) return text;
    return 'http://' + text;
}

/** @param {string} address Raw address. @returns {object} Route descriptor. */
export function resolveRoute(address) {
    const url = normalizeAddress(address);
    const simulated = SimulatedServerRegistry.resolve(url);
    if (simulated) return { type: 'srcdoc', url, html: simulated.html };
    if (url === 'about:blank') return { type: 'srcdoc', url, html: blankPage() };
    return { type: 'url', url };
}

/** @returns {string} Empty HTML page. */
export function blankPage() {
    return '<!doctype html><html><body></body></html>';
}
