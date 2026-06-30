// B"H
const NS = 'http://www.w3.org/2000/svg';

export const getChevronIcon = () => icon('chevron', 'Expand folder', '<path d="M9 5.5 15.5 12 9 18.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>');
export const getFolderIcon = () => icon('folder', 'Folder', '<path d="M3 7.4c0-1.35 1.05-2.4 2.4-2.4h4.25c.62 0 1.2.25 1.64.69l1.12 1.12c.34.34.8.53 1.28.53h4.91c1.35 0 2.4 1.05 2.4 2.4v.86H3V7.4Z" fill="#fbbf24"/><path d="M2.4 10h19.2v7.1c0 1.38-1.12 2.5-2.5 2.5H4.9a2.5 2.5 0 0 1-2.5-2.5V10Z" fill="#fde047"/><path d="M3 10h18.1M5.4 5h4.25c.62 0 1.2.25 1.64.69l1.12 1.12c.34.34.8.53 1.28.53h4.91c1.35 0 2.4 1.05 2.4 2.4v7.36c0 1.38-1.12 2.5-2.5 2.5H4.9a2.5 2.5 0 0 1-2.5-2.5V7.4C2.4 6.05 3.45 5 4.8 5h.6Z" fill="none" stroke="#d97706" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>');
export const getFileIcon = () => paperIcon('file', 'File', '#f8fafc', '#94a3b8');
export const getJsonIcon = () => codeIcon('json', 'JSON file', '#a78bfa', '#1e1b4b', '{}');
export const getTextIcon = () => codeIcon('text', 'Text file', '#e2e8f0', '#0f172a', 'TXT');
export const getImageIcon = () => icon('image', 'Image file', '<rect x="3" y="4" width="18" height="16" rx="4" fill="#67e8f9"/><path d="M6 17l4.2-4.4 2.7 2.6 2.4-2.9L19 17H6Z" fill="#075985"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fef3c7"/>');
export const getJsIcon = () => codeIcon('js', 'JavaScript file', '#f7df1e', '#111827', 'JS');
export const getCssIcon = () => codeIcon('css', 'CSS file', '#38bdf8', '#082f49', 'CSS');
export const getHtmlIcon = () => codeIcon('html', 'HTML file', '#fb923c', '#431407', 'HTML');

export function getIconForName(name = '', isFolder = false) {
  const value = String(name).toLowerCase();
  if (isFolder || value.endsWith('.folder')) return getFolderIcon();
  if (/\.(js|mjs|cjs)$/.test(value)) return getJsIcon();
  if (value.endsWith('.css')) return getCssIcon();
  if (/\.(html|htm)$/.test(value)) return getHtmlIcon();
  if (value.endsWith('.json')) return getJsonIcon();
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(value)) return getImageIcon();
  if (/\.(txt|md|log)$/.test(value)) return getTextIcon();
  return getFileIcon();
}

function paperIcon(kind, label, fill, stroke) {
  return icon(kind, label, `<path d="M6 2.8h8.2L20 8.6v11.1c0 .83-.67 1.5-1.5 1.5h-13c-.83 0-1.5-.67-1.5-1.5V4.3c0-.83.67-1.5 1.5-1.5H6Z" fill="${fill}" stroke="${stroke}" stroke-width="1.35"/><path d="M14 3v5.8h5.8" fill="none" stroke="${stroke}" stroke-width="1.35"/><path d="M8 13h8M8 16h6" fill="none" stroke="#cbd5e1" stroke-width="1.25" stroke-linecap="round"/>`);
}

function codeIcon(kind, label, fill, ink, letters) {
  return icon(kind, label, `<rect x="3" y="3" width="18" height="18" rx="4" fill="${fill}"/><path d="M6.5 6.5h11" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2" stroke-linecap="round"/><text x="12" y="15.4" text-anchor="middle" font-size="5.2" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-weight="900" fill="${ink}">${letters}</text>`);
}

function icon(kind, label, body) {
  return `<svg xmlns="${NS}" class="awts-icon awts-icon-${kind}" viewBox="0 0 24 24" role="img" aria-label="${label}">${body}</svg>`;
}

/** B"H: file glyphs are semantic sparks, stable enough for tests and soft enough for wonder. */
