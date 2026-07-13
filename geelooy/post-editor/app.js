// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorApp
 * @description
 * Awtsmoos.com publishes observed creation coordinates into the shared ribbon;
 * the Awtsmoos then opens controls only through the editor's existing covenant.
 */
import { publishRouteContext } from '../scripts/awtsmoos/social/shell/contextRibbon.js';
import { readPostEditorConfig } from './modules/config.js';
import { renderPostEditor } from './modules/render.js';
import { createPostEditorShellContext } from './modules/shellContext.js';

const root = document.querySelector('#post-editor-root');
const config = readPostEditorConfig(location);
publishRouteContext(createPostEditorShellContext(config));
renderPostEditor(root, config);
