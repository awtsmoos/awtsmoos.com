
// B"H
/**
 * @file TestingExecutor.js
 * @brief Executes headless simulator tools.
 */

import { BackgroundTester } from '../testing/Simulator.js';

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
        throw new Error("Unhandled Testing Schema");
    }
};
