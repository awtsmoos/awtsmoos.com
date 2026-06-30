// B"H
import { addShortcut } from './shortcuts.js';
import { notifyDesktop } from './notifications.js';

export const DESKTOP_TEMPLATES = {
  developer:[
    { title:'Root Source', path:'awtsmoos://tunnels/awt-awtsmoos-2113/Documents/awtsmoos/git/awtsmoos.com', icon:'🧾', kind:'shortcut' },
    { title:'Virtual OS', path:'awtsmoos://tunnels/awtsmoos-virtual-os', icon:'☁️', kind:'shortcut' }
  ],
  explorer:[
    { title:'Desktop Folder', path:'desktop.folder', icon:'🖥️', kind:'shortcut' },
    { title:'Preview Artifacts', path:'awtsmoos://previews', icon:'🔭', kind:'shortcut' }
  ]
};

/** Templates pour useful doors onto the current desktop page without duplicating logic. */
export function installDesktopTemplate(name = 'developer', os) {
  const list = DESKTOP_TEMPLATES[name] || DESKTOP_TEMPLATES.developer;
  list.forEach(item => addShortcut(item));
  notifyDesktop(os, `Installed ${name} desktop template`, 'success');
  return list.length;
}
