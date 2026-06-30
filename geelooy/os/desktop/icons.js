// B"H
export function desktopIcons() {
  return [
    icon('desktop-files', 'My Files / Desktop Files', '🖥️', 'folder', 'desktop.folder'),
    icon('awtsmoos-home', 'Awtsmoos Home', '🏠', 'folder', '/'),
    icon('connected-tunnels', 'Connected Tunnels', '🔌', 'remote', 'awtsmoos://tunnels'),
    icon('virtual-os', 'Awtsmoos Virtual OS', '☁️', 'remote', 'awtsmoos://tunnels/awtsmoos-virtual-os'),
    icon('code', 'Code', '🧬', 'tool', '/', os => os.addWindow({ title:'Code', path:'/', os, programName:'advancedCodeEditor' })),
    icon('command', 'Command', '⌨️', 'tool', '/', os => os.addWindow({ title:'Command', path:'/', os, programName:'awtsmoosCommand' })),
    icon('diagnostics', 'Diagnostics', '🧰', 'tool', null, os => os.addWindow({ title:'Developer Diagnostics', os, programName:'awtsmoosDiagnostics' })),
    icon('previews', 'Preview Artifacts', '🔭', 'remote', 'awtsmoos://previews')
  ];
}
function icon(id, title, glyph, kind, path, action) { return { id, title, icon:glyph, kind, path, action, open:action || (os => os.addWindow({ title, path, os, programName:'awtsmoosFileExplorer' })) }; }
export function openDesktopIcon(os, item) { return item?.open?.(os); }
/** B"H: Icons are gates; when clicked, the Awtsmoos in code answers with roads. */
