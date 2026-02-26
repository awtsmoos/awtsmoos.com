
// B"H
// FILE: js/terminal/commands/network-cmd.js

import { VirtualNetwork } from '../../network/index.js';
import { FileSystemProvider } from '../../fs-provider.js';

export const NetworkCommands = {
    async curl(shell, args) {
        if (args.length === 0) throw new Error("curl: try 'curl --help' or 'curl <url>'");
        const url = args.find(a => !a.startsWith('-'));
        if (!url) throw new Error("curl: missing URL");

        shell.print(`> GET ${url}`);

        try {
            const res = await VirtualNetwork.request(url, { method: 'GET' });
            return typeof res.data === 'string' ? res.data : new TextDecoder().decode(res.data);
        } catch(e) {
            throw new Error(`curl: Failed to fetch: ${e.message}`);
        }
    },

    async wget(shell, args) {
        if (args.length === 0) throw new Error("wget: missing URL");
        const url = args.find(a => !a.startsWith('-'));
        if (!url) throw new Error("wget: missing URL");

        try {
            const res = await VirtualNetwork.request(url, { method: 'GET' });
            const content = typeof res.data === 'string' ? res.data : new TextDecoder().decode(res.data);
            
            const fileName = url.split('/').pop() || 'index.html';
            let item;
            try { item = await shell.resolveItem(fileName); }
            catch(e) { await FileSystemProvider.create(shell.cwd, fileName, 'file'); item = await shell.resolveItem(fileName); }
            
            await FileSystemProvider.write(item, content);
            return `Saved to '${fileName}'`;
        } catch(e) {
            throw new Error(`wget: Connection refused or failed: ${e.message}`);
        }
    }
};
