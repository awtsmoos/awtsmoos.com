// B"H
import desktop from './desktop.js';
import icons from './icons.js';
import contextMenu from './contextMenu.js';
import diagnostics from './diagnostics.js';
import mobile from './mobile.js';
export default id => [desktop(id), icons(id), contextMenu(id), diagnostics(id), mobile(id)].join('\n');
/** B"H: OS base style is a choir of small lights. */
