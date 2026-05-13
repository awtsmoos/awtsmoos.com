
// B"H
/**
 * @file TestingExecutor.js
 * @brief Executes headless simulator tools.
 */

import { BackgroundTester } from '../testing/BackgroundTester.js';
import { NodeManager } from '../../../node/manager.js';
import { FileSystemExecutor } from './FileSystemExecutor.js';

export const TestingExecutor = {
    async execute(name, args, ws, coreType, resolvePath, tabId) {
        if (name === "run_ui_test") {
            const absPath = args.html_entry_path ? resolvePath(args.html_entry_path) : null;
            const targetUrl = args.target_url || null;
            
            if (!absPath && !targetUrl) {
                return `[B"H Error] You must provide either 'html_entry_path' or 'target_url' to run the test.`;
            }

            return await BackgroundTester.runSimulation(ws, coreType, absPath, targetUrl, args.test_plan, tabId);
        }
        if (name === "run_node_script") {
            const absPath = resolvePath(args.entry_path);
            return await NodeManager.executeForReport({
                ...ws,
                path: absPath,
                kind: 'file',
                type: coreType
            }, tabId, args.timeout_ms || 10000);
        }
        if (name === "run_command_batch") {
            const commandList = Array.isArray(args.commands) ? args.commands : [];
            if (commandList.length === 0) {
                return '[B"H Error] commands must be a non-empty array.';
            }
            const results = [];
            for (let i = 0; i < commandList.length; i += 1) {
                const command = String(commandList[i] || '').trim();
                if (!command) continue;
                const output = await FileSystemExecutor.execute(
                    'run_terminal_command',
                    { command, cwd: i === 0 ? args.cwd : undefined },
                    ws,
                    coreType,
                    resolvePath,
                    null,
                    null
                );
                results.push({ command, output });
            }
            return JSON.stringify({ results }, null, 2);
        }
        throw new Error("Unhandled Testing Schema");
    }
};
