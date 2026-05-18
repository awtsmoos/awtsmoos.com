// B"H
/**
 * @file MerkavaHeadlessServer.js
 * @brief Mounts Chrome-free Merkava simulations into the Virtual OS server registry.
 */
import { MerkavaRuntimeBridge } from '../../vibe/runtime/MerkavaRuntimeBridge.js';
import { SimulatedServerRegistry } from './SimulatedServerRegistry.js';

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function resultPage(result) {
    const consoleText = JSON.stringify(result.console || [], null, 2);
    const domText = JSON.stringify(result.domSnapshot || null, null, 2);
    return [
        '<!doctype html>',
        '<html><head><meta charset="utf-8"><title>Merkava Headless</title></head>',
        '<body style="font-family:system-ui;background:#030711;color:#e8f7ff;padding:24px">',
        '<h1>B&quot;H Merkava Headless Runtime</h1>',
        '<p>Chrome-free simulation mounted inside the Virtual OS.</p>',
        '<p><strong>ok:</strong> ' + escapeHtml(result.ok) + ' <strong>score:</strong> ' + escapeHtml(result.score) + '</p>',
        '<h2>Console</h2><pre>' + escapeHtml(consoleText) + '</pre>',
        '<h2>DOM Snapshot</h2><pre>' + escapeHtml(domText) + '</pre>',
        '</body></html>'
    ].join('');
}

/**
 * B"H
 * Runs Merkava and registers the result as a simulated localhost page.
 *
 * @param {object} options Simulation options.
 * @returns {Promise<object>} Registered simulated server.
 */
export async function createMerkavaHeadlessServer(options = {}) {
    const port = options.port || 3999;
    const result = await MerkavaRuntimeBridge.simulate({
        runtime: options.runtime || 'browser',
        entry: options.entry || 'index.html',
        files: options.files || {
            'index.html': '<script>console.log("BH Virtual OS Merkava")</script>'
        }
    });

    return SimulatedServerRegistry.create(port, {
        name: options.name || 'Merkava Headless Runtime',
        html: resultPage(result),
        routes: {
            '/': resultPage(result),
            '/result.json': JSON.stringify(result, null, 2)
        }
    });
}
