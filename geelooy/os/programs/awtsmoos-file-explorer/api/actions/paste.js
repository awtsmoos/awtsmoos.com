// B"H
import { getClipboard, clearCutClipboard } from './clipboardState.js';
import { nameOf, targetPath } from './paths.js';
export async function pasteIntoCurrent({ os, state }) { const clip = getClipboard(os); const sources = clip.paths || (clip.path ? [clip.path] : []); let count = 0; for (const src of sources) { const dest = targetPath(state, nameOf(src)); if (src !== dest) { await os.vfs[clip.action === 'cut' ? 'move' : 'copy'](src, dest, { principal:{ id:'explorer.paste' } }); count++; } } if (clip.action === 'cut') clearCutClipboard(os); return count; }
/** B"H: Paste is copy/move through VFS, never native shadow magic. */
