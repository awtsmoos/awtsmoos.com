// B"H
import { loadShortcuts } from './shortcuts.js';
import { notifyDesktop, explainFailure } from './notifications.js';

export function desktopIcons() {
  return [
    icon('desktop-files', 'My Files / Desktop Files', '🖥️', 'folder', 'desktop.folder', null, { page:0, pinAllPages:true }),
    icon('code', 'Code', '🧬', 'tool', '/', os => os.addWindow({ title:'Code', path:'/', os, programName:'advancedCodeEditor' }), { page:0, badge:'app' }),
    icon('command', 'Command', '⌨️', 'tool', '/', os => os.addWindow({ title:'Command', path:'/', os, programName:'awtsmoosCommand' }), { page:0, badge:'shell' }),
    icon('awtsmoos-home', 'Awtsmoos Home', '🏠', 'folder', '/', null, { page:0 }),
    icon('pulse', 'Pulse', '⚡', 'tool', '/', os => os.addWindow({ title:'Developer Diagnostics', os, programName:'awtsmoosDiagnostics' }), { page:3, pinAllPages:true, badge:'live' }),
    icon('agents', 'Agents', '🤖', 'remote', 'awtsmoos://tunnels', null, { page:1 }),
    icon('connected-tunnels', 'Connected Tunnels', '🔌', 'remote', 'awtsmoos://tunnels', null, { page:1, badge:'vessels' }),
    icon('virtual-os', 'Awtsmoos Virtual OS', '☁️', 'remote', 'awtsmoos://tunnels/awtsmoos-virtual-os', null, { page:1 }),
    icon('previews', 'Preview Artifacts', '🔭', 'remote', 'awtsmoos://previews', null, { page:1 }),
    icon('map', 'Map', '🕸️', 'tool', '/', os => os.addWindow({ title:'Awtsmoos Map', path:'/', os, programName:'graphBrowser' }), { page:2 }),
    icon('inbox', 'Inbox', '✉️', 'folder', '/inbox', null, { page:2 }),
    icon('memory', 'Memory', '🧠', 'folder', '/memory', null, { page:2 }),
    icon('objects', 'Objects', '◇', 'folder', '/objects', null, { page:2 }),
    icon('reputation', 'Reputation', '✦', 'folder', '/reputation', null, { page:2 }),
    icon('diagnostics', 'Diagnostics', '🧰', 'tool', null, os => os.addWindow({ title:'Developer Diagnostics', os, programName:'awtsmoosDiagnostics' }), { page:3 }),
    ...loadShortcuts().map(s => icon(s.id, s.title, s.icon || '🔗', s.kind || 'shortcut', s.path, null, { ...s, badge:s.badge || 'link' }))
  ];
}
function icon(id, title, glyph, kind, path, action, meta = {}) { return { id, title, icon:glyph, kind, path, ...meta, open:action || (os => os.addWindow({ title, path, os, programName:'awtsmoosFileExplorer' })) }; }
export function openDesktopIcon(os, item) { try { const result = item?.open?.(os); notifyDesktop(os, `Opening ${item?.title || 'desktop item'}`, 'open'); return result; } catch (error) { explainFailure(os, `Open ${item?.title || 'desktop item'}`, error); throw error; } }
/** B"H: desktop icons are page-aware gates with badges and meaningful feedback. */
