// B"H
/**
 * @file SimulatedNodeBridge.js
 * @description Terminal helper commands for simulated localhost servers.
 */

import { SimulatedServerRegistry } from './SimulatedServerRegistry.js';
import { createMerkavaHeadlessServer } from './MerkavaHeadlessServer.js';

/**
 * @function maybeHandleSimulatedCommand
 * @param {string} command Terminal command.
 * @returns {Promise<string|null>} Output or null.
 */
export async function maybeHandleSimulatedCommand(command) {
    const text = String(command || '').trim();

    if (text === 'simservers') {
        const list = SimulatedServerRegistry.list();
        if (!list.length) return 'No simulated servers are running.';
        return list.map((srv) => `:${srv.port} ${srv.name}`).join('\n');
    }

    const merkavaMatch = text.match(/^merkava-simserve(?:\s+(\d+))?$/);
    if (merkavaMatch) {
        const port = merkavaMatch[1] || '3999';
        await createMerkavaHeadlessServer({ port });
        return `B"H Merkava headless server listening at http://simulated.localhost:${port}/`;
    }

    const startMatch = text.match(/^simserve\s+(\d+)(?:\s+(.+))?$/);
    if (startMatch) {
        const port = startMatch[1];
        const name = startMatch[2] || `Awtsmoos Sim Server ${port}`;
        SimulatedServerRegistry.create(port, { name });
        return `B"H simulated server listening at http://simulated.localhost:${port}/`;
    }

    const stopMatch = text.match(/^simstop\s+(\d+)$/);
    if (stopMatch) {
        SimulatedServerRegistry.remove(stopMatch[1]);
        return `Stopped simulated server :${stopMatch[1]}`;
    }

    const nodeServerMatch = text.match(/^node\s+(.+server.+\.js)$/i);
    if (nodeServerMatch) {
        const port = '3000';
        SimulatedServerRegistry.create(port, {
            name: nodeServerMatch[1],
            html: [
                '<!doctype html>',
                '<html>',
                '<head><meta charset="utf-8"><title>Simulated Node</title></head>',
                '<body style="font-family:system-ui;background:#030711;color:#e8f7ff;padding:32px">',
                '<h1>B&quot;H Simulated Node Server</h1>',
                '<p>Command: node ' + nodeServerMatch[1].replaceAll('<', '&lt;') + '</p>',
                '<p>Visit http://simulated.localhost:3000/ in the Virtual Browser.</p>',
                '</body>',
                '</html>'
            ].join('')
        });

        return 'B"H simulated node server listening at http://simulated.localhost:3000/';
    }

    return null;
}
