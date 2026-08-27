
// B"H
/**
 * @file simulated.js
 * @description
 * Terminal commands for simulated localhost servers.
 */

import { SimulatedServerRegistry } from '../../virtual-os/simulated/SimulatedServerRegistry.js';

export const SimulatedCommands = {
    async simserve(shell, args) {
        const port = args[0] || '3000';
        const name = args.slice(1).join(' ') || `Awtsmoos Sim Server ${port}`;

        SimulatedServerRegistry.create(port, { name });

        return [
            `B"H simulated server listening.`,
            `URL: http://simulated.localhost:${port}/`,
            `Tip: open the Virtual Browser and go to sim:${port}`
        ].join('\n');
    },

    async simservers() {
        const list = SimulatedServerRegistry.list();

        if (!list.length) return 'No simulated servers are running.';

        return list.map((srv) => {
            return `:${srv.port} ${srv.name} requests=${srv.logs.length}`;
        }).join('\n');
    },

    async simstop(shell, args) {
        const port = args[0] || '3000';
        SimulatedServerRegistry.remove(port);
        return `Stopped simulated server :${port}`;
    }
};
