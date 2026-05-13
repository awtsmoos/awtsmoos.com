
// B"H
/**
 * @file AppRegistry.js
 * @description
 * Registry of Virtual OS apps, unified with data tables.
 */

import { VIRTUAL_OS_APP_DATA } from '../data/apps.js';
import { renderFileExplorerApp } from './FileExplorerApp.js';
import { renderTerminalApp } from './TerminalApp.js';
import { renderBrowserApp } from './BrowserApp.js';
import { renderNotepadApp } from './NotepadApp.js';
import { renderSettingsApp } from './SettingsApp.js';
import { renderTaskManagerApp } from './TaskManagerApp.js';
import { renderGitControlApp } from './GitControlApp.js';

const RENDERERS = {
    explorer: renderFileExplorerApp,
    terminal: renderTerminalApp,
    browser: renderBrowserApp,
    notepad: renderNotepadApp,
    settings: renderSettingsApp,
    'task-manager': renderTaskManagerApp,
    'git-control': renderGitControlApp
};

export const AppRegistry = Object.fromEntries(
    VIRTUAL_OS_APP_DATA.map((app) => [
        app.id,
        {
            ...app,
            renderer: RENDERERS[app.id]
        }
    ])
);
