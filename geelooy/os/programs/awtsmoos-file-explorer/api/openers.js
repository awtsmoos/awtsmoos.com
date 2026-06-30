// B"H
import { parentExplorerPath } from './path.js';

export async function openExplorerItem({ os, state, navigate, item }) {
  if (!item) return null;
  if (item.kind === 'folder') return await navigate(item.path);
  if (item.raw?.action === 'openPreview' && item.raw.url) return window.open(item.raw.url, '_blank', 'noopener');
  return await openFile({ os, state, item });
}

export async function openFile({ os, state, item, programName }) {
  const got = await os.vfs.read(item.path);
  const content = extractContent(got);
  const title = item.name || item.path.split('/').pop() || 'file';
  os.addWindow({ title, content, path:parentExplorerPath(item.path), os, programName:programName || programFor(item), extension:extensionFor(title) });
  return { item, content };
}

export function openInCode({ os, item }) {
  return openFile({ os, item, programName:'advancedCodeEditor' });
}

export function extractContent(got = {}) {
  if (typeof got === 'string') return got;
  return got.content ?? got.body ?? got.text ?? got.raw ?? JSON.stringify(got, null, 2);
}

function programFor(item) {
  if (isTextLike(item)) return 'advancedCodeEditor';
  return undefined;
}
function isTextLike(item) {
  return /^(js|mjs|cjs|css|html|htm|json|txt|md|xml|svg|log|sh|c|cpp|h|py|rb|go|rs|ts|tsx|jsx)$/i.test(item.extension || '');
}
function extensionFor(name = '') {
  const dot = String(name).lastIndexOf('.');
  return dot > -1 ? String(name).slice(dot).toLowerCase() : '';
}

/** B"H: opening is now one gate; folders navigate, text enters Code, previews become portals. */
