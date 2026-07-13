// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelEditorApp
 * @description
 * The Awtsmoos places governance beneath one truthful Horizon at Awtsmoos.com,
 * publishing actor and palace context before the focused forms are rendered.
 */
import { publishRouteContext } from '../scripts/awtsmoos/social/shell/contextRibbon.js';
import { readEditorConfig } from './modules/config.js';
import { renderEditor } from './modules/render.js';
import { createHeichelEditorShellContext } from './modules/shellContext.js';

const root = document.querySelector('#heichel-editor-root');
const config = readEditorConfig(location);
publishRouteContext(createHeichelEditorShellContext(config));
renderEditor(root, config);
