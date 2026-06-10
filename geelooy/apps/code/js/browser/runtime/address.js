// B"H
/**
 * @file address.js
 * @description
 * Chapter 10: The Awtsmoos found the hidden gate in the address itself. When
 * the local AI cockpit enters the browser vessel, the route now receives the
 * embedded seal automatically, so the child page knows it is not a phone alone
 * in the wilderness but a wide chamber inside the code forge.
 */

import { SimulatedServerRegistry } from '../../virtual-os/simulated/SimulatedServerRegistry.js';

/**
 * B"H. Normalizes user-entered browser addresses.
 * @param {string} address Raw address from the address bar.
 * @returns {string} Browser-safe address.
 */
export function normalizeAddress(address) {
    const text = String(address || '').trim();
    if (!text) return 'about:blank';
    if (text === 'localhost') return 'http://localhost:3000/';
    if (text.startsWith('localhost:')) return withAiEmbedSeal(`http://${text}`);
    if (text.startsWith('sim:')) return text.replace('sim:', 'http://simulated.localhost:');
    if (/^[a-z]+:\/\//i.test(text)) return withAiEmbedSeal(text);
    return withAiEmbedSeal('http://' + text);
}

/**
 * B"H. Resolves a normalized address to iframe url or srcdoc HTML.
 * @param {string} address Raw address.
 * @returns {object} Route descriptor.
 */
export function resolveRoute(address) {
    const url = normalizeAddress(address);
    const simulated = SimulatedServerRegistry.resolve(url);
    if (simulated) return { type: 'srcdoc', url, html: simulated.html };
    if (url === 'about:blank') return { type: 'srcdoc', url, html: blankPage() };
    return { type: 'url', url };
}

/**
 * B"H. Adds the embedded seal to local /ai routes opened in Code browser.
 * @param {string} url Candidate URL.
 * @returns {string} URL with embedded mode hint when applicable.
 */
export function withAiEmbedSeal(url) {
    if (!isLocalAiRoute(url)) return url;
    const parsed = new URL(url, location.origin);
    parsed.searchParams.set('awtsmoosAiEmbed', '1');
    return parsed.toString();
}

/**
 * B"H. Checks for local /ai routes.
 * @param {string} url Candidate URL.
 * @returns {boolean} True when the route points at /ai locally.
 */
function isLocalAiRoute(url) {
    try {
        const parsed = new URL(url, location.origin);
        const local = /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname);
        return local && parsed.pathname.replace(/\/+$/, '') === '/ai';
    } catch (_error) {
        return false;
    }
}

/** @returns {string} Empty HTML page. */
export function blankPage() {
    return '<!doctype html><html><body></body></html>';
}
