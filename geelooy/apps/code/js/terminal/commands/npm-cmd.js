
// B"H
// FILE: js/terminal/commands/npm-cmd.js

import { FileSystemProvider } from '../../fs-provider.js';

export const NPMCommands = {
    /**
     * @async
     * @function npm
     * @description The Book of Names (package.json) manager.
     */
    async npm(shell, args) {
        if (args.length === 0) return "Usage: npm init | npm run <script>";
        
        const action = args[0];

        if (action === 'init') {
            const safeName = shell.cwd.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            const pkg = {
                name: safeName || "awtsmoos-project",
                version: "1.0.0",
                description: "Manifested by Awtsmoos",
                main: "index.js",
                scripts: { 
                    start: "node index.js",
                    test: "echo \"Error: no test specified\" && exit 1" 
                },
                author: "",
                license: "ISC"
            };
            
            const item = { ...shell.cwd, path: shell.cwd.path + (shell.cwd.path==='/'?'':'/') + 'package.json', kind: 'file' };
            await FileSystemProvider.write(item, JSON.stringify(pkg, null, 2));
            return `Wrote to ${item.path}:\n\n` + JSON.stringify(pkg, null, 2);
        }

        if (action === 'run') {
            const scriptName = args[1];
            if (!scriptName) throw new Error("npm run: missing script name");

            try {
                const item = { ...shell.cwd, path: shell.cwd.path + (shell.cwd.path==='/'?'':'/') + 'package.json', kind: 'file' };
                const pkgStr = await FileSystemProvider.read(item);
                const pkg = JSON.parse((pkgStr instanceof Blob) ? await pkgStr.text() : pkgStr);
                
                if (pkg.scripts && pkg.scripts[scriptName]) {
                    shell.print(`> ${pkg.name}@${pkg.version} ${scriptName}`);
                    shell.print(`> ${pkg.scripts[scriptName]}\n`);
                    await shell.execute(pkg.scripts[scriptName]);
                    return null;
                } else {
                    throw new Error(`Missing script: "${scriptName}"`);
                }
            } catch (e) {
                throw new Error("npm ERR! " + e.message);
            }
        }

        return `npm ERR! Unknown command: ${action}`;
    }
};
