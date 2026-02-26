
// B"H
// FILE: js/terminal/commands/node-cmd.js

import { NodeSystem } from '../../node/index.js';

export const NodeCommands = {
    async node(shell, args) {
        if (args.length === 0) return "Awtsmoos Node.js Simulator v1.0.0. Usage: node <file.js>";
        
        const file = args[0];
        const item = await shell.resolveItem(file);
        
        // B"H - Memorize the script for automatic resurrection
        shell.state.activeNodeScript = file;
        
        const pid = await NodeSystem.spawn(item, shell.tab.id);
        return null; 
    }
};
