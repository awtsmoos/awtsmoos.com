// B"H
import { toolbarButton } from './button.js';
export function toolbarGroup(name, defs, run) { const group = document.createElement('div'); group.className = `toolbar-group toolbar-${name}`; group.dataset.group = name; defs.forEach(def => group.appendChild(toolbarButton(def, run))); return group; }
/** B"H: button groups keep the toolbar from becoming one swollen file. */
