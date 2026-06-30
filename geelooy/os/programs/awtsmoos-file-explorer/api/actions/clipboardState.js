// B"H
export function setClipboard(os, action, paths = []) { os.clipboard = { action, paths, path:paths[0] || null, name:(paths[0] || '').split('/').pop() || null }; return os.clipboard; }
export function getClipboard(os) { return os?.clipboard || {}; }
export function clearCutClipboard(os) { if (os?.clipboard?.action === 'cut') os.clipboard = { action:null, paths:null, path:null, name:null }; }
/** B"H: clipboard state becomes explicit instead of hidden button fog. */
