
// B"H
/**
 * @file open-terminal-here.js
 */

import { Tabs } from '../../tabs/index.js';
import { ContextParser } from '../utils/context-parser.js';

export const OpenTerminalHereAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item) return;

        let targetPath = item.path;
        if (item.kind === 'file') {
            // Strip filename to get directory
            const lastSlash = targetPath.lastIndexOf('/');
            targetPath = lastSlash >= 0 ? targetPath.substring(0, lastSlash) : '/';
        }

        console.log("B\"H - Terminal: Anchoring void at ->", targetPath);

        const terminalItem = {
            id: `term-${targetPath}`,
            name: `Terminal: ${item.name}`,
            path: targetPath,
            kind: 'directory',
            type: 'terminal',
            workspaceId: item.workspaceId
        };

        return Tabs.create(terminalItem);
    }
};
