// B"H
const NS = 'http://www.w3.org/2000/svg';

export const getChevronIcon = () => icon('chevron', 'Expand folder', `
  <path d="M9 5.5 15.5 12 9 18.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
`);

export const getFolderIcon = () => icon('folder', 'Folder', `
  <path class="awts-icon-shadow" d="M3 7.4c0-1.35 1.05-2.4 2.4-2.4h4.25c.62 0 1.2.25 1.64.69l1.12 1.12c.34.34.8.53 1.28.53h4.91c1.35 0 2.4 1.05 2.4 2.4v.86H3V7.4Z" fill="#fbbf24" opacity=".9"/>
  <path class="awts-icon-fill" d="M2.4 10h19.2v7.1c0 1.38-1.12 2.5-2.5 2.5H4.9a2.5 2.5 0 0 1-2.5-2.5V10Z" fill="#fde047"/>
  <path class="awts-icon-line" d="M3 10h18.1M5.4 5h4.25c.62 0 1.2.25 1.64.69l1.12 1.12c.34.34.8.53 1.28.53h4.91c1.35 0 2.4 1.05 2.4 2.4v7.36c0 1.38-1.12 2.5-2.5 2.5H4.9a2.5 2.5 0 0 1-2.5-2.5V7.4C2.4 6.05 3.45 5 4.8 5h.6Z" fill="none" stroke="#d97706" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
`);

export const getFileIcon = () => icon('file', 'File', `
  <path class="awts-icon-paper" d="M6 2.8h8.2L20 8.6v11.1c0 .83-.67 1.5-1.5 1.5h-13c-.83 0-1.5-.67-1.5-1.5V4.3c0-.83.67-1.5 1.5-1.5H6Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.35"/>
  <path class="awts-icon-fold" d="M14 3v5.8h5.8" fill="none" stroke="#94a3b8" stroke-width="1.35" stroke-linejoin="round"/>
  <path class="awts-icon-line" d="M8 13h8M8 16h6" fill="none" stroke="#cbd5e1" stroke-width="1.25" stroke-linecap="round"/>
`);

export const getJsIcon = () => codeIcon('js', 'JavaScript file', '#f7df1e', '#111827', 'JS');
export const getCssIcon = () => codeIcon('css', 'CSS file', '#38bdf8', '#082f49', 'CSS');
export const getHtmlIcon = () => codeIcon('html', 'HTML file', '#fb923c', '#431407', 'HTML');

export function getIconForName(name = '', isFolder = false) {
  const value = String(name).toLowerCase();
  if (isFolder || value.endsWith('.folder')) return getFolderIcon();
  if (value.endsWith('.js') || value.endsWith('.mjs') || value.endsWith('.cjs')) return getJsIcon();
  if (value.endsWith('.css')) return getCssIcon();
  if (value.endsWith('.html') || value.endsWith('.htm')) return getHtmlIcon();
  return getFileIcon();
}

function codeIcon(kind, label, fill, ink, letters) {
  return icon(kind, label, `
    <rect class="awts-icon-code-bg" x="3" y="3" width="18" height="18" rx="4" fill="${fill}"/>
    <path class="awts-icon-code-glint" d="M6.5 6.5h11" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2" stroke-linecap="round"/>
    <text x="12" y="15.4" text-anchor="middle" font-size="5.2" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-weight="900" fill="${ink}">${letters}</text>
  `);
}

function icon(kind, label, body) {
  return `<svg xmlns="${NS}" class="awts-icon awts-icon-${kind}" viewBox="0 0 24 24" role="img" aria-label="${label}">${body}</svg>`;
}

/**
 * B"H
 * Icon glyphs are semantic sparks: stable import path, stable class contract,
 * and no side effects, so the explorer can render even before the graph sings.
 */
