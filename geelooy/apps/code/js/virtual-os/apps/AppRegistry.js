// B"H
/**
 * @file AppRegistry.js
 * @description Declares launchable Virtual OS applications in a data-first registry.
 */

import { renderFileExplorerApp } from './FileExplorerApp.js';
import { renderTerminalApp } from './TerminalApp.js';
import { renderBrowserApp } from './BrowserApp.js';
import { renderQuotaApp } from './QuotaApp.js';
import { renderEvaluatorApp } from './EvaluatorApp.js';

export const AppRegistry = {
    explorer: {
        id: 'explorer',
        title: 'File Explorer',
        width: 760,
        height: 520,
        renderer: renderFileExplorerApp
    },
    terminal: {
        id: 'terminal',
        title: 'Terminal',
        width: 760,
        height: 420,
        renderer: renderTerminalApp
    },
    browser: {
        id: 'browser',
        title: 'Web Tester',
        width: 860,
        height: 560,
        renderer: renderBrowserApp
    },
    quota: {
        id: 'quota',
        title: 'Provider Quotas',
        width: 780,
        height: 460,
        renderer: renderQuotaApp
    },
    evaluator: {
        id: 'evaluator',
        title: 'Eval Dashboard',
        width: 800,
        height: 500,
        renderer: renderEvaluatorApp
    }
};
