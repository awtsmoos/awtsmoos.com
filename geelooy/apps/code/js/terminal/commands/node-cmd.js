
// B"H
// FILE: js/terminal/commands/node-cmd.js

import { NodeSystem } from '../../node/index.js';

export const NodeCommands = {
    /**
     * @async
     * @function node
     * @description Summons the Node Golem to execute the specified file.
     */
    async node(shell, args) {
        if (args.length === 0) return "Awtsmoos Node.js Simulator v1.0.0. Usage: node <file.js>";
        
        const file = args[0];
        const item = await shell.resolveItem(file);
        
        // Pass the tabId so the Golem knows where to send its console.log
        const pid = await NodeSystem.spawn(item, shell.tab.id);
        
        return null; // Return null because output is handled asynchronously
    }
};
