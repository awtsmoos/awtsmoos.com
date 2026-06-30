// B"H
export function createVfsBridge({ os, iframe, basePath, initialFile = {} }) {
  async function handleMessage(event) {
    const msg = event.data || {};
    if (!String(msg.type || '').startsWith('awtsmoos-os:')) return;
    if (msg.type === 'awtsmoos-os:ready') return postOpenFile(iframe, basePath, initialFile);
    const id = msg.id || `reply:${Date.now()}`;
    try { post(iframe, 'awtsmoos-os:reply', { id, ok:true, data:await runCommand(msg, { os, basePath }) }); }
    catch (error) { post(iframe, 'awtsmoos-os:reply', { id, ok:false, error:error.message }); }
  }
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}

export async function runCommand(msg, { os, basePath }) {
  const payload = msg.payload || {};
  const path = vfsPath(payload.path || payload.osPath || basePath);
  if (msg.type === 'awtsmoos-os:list') return await os.vfs.list(path);
  if (msg.type === 'awtsmoos-os:read') return await os.vfs.read(filePath(path, payload.fileName));
  if (msg.type === 'awtsmoos-os:write') return await os.vfs.write(filePath(path, payload.fileName), payload.content ?? '', { userId:'code-embed' });
  if (msg.type === 'awtsmoos-os:mkdir') return await os.vfs.mkdir(filePath(path, payload.name || payload.fileName), { userId:'code-embed' });
  if (msg.type === 'awtsmoos-os:remove') return await os.vfs.remove(filePath(path, payload.fileName || payload.name), { userId:'code-embed' });
  if (msg.type === 'awtsmoos-os:move') return await os.vfs.move(vfsPath(payload.from), vfsPath(payload.to), { userId:'code-embed' });
  throw new Error(`Unsupported OS editor command ${msg.type}`);
}

export function postOpenFile(iframe, basePath, payload = {}) { post(iframe, 'awtsmoos-os:open-file', { basePath, ...payload }); }
function post(iframe, type, payload) { iframe.contentWindow?.postMessage?.({ type, payload }, '*'); }
function vfsPath(path = '/') { return String(path).startsWith('awtsmoos://') ? path : `/${String(path || '/').replace(/^\/+/, '')}`; }
function filePath(path, name = '') { if (!name) return path; return String(path).startsWith('awtsmoos://') ? `${path.replace(/\/+$/, '')}/${name}` : `/${[path, name].join('/').split('/').filter(Boolean).join('/')}`; }

/** B"H: when Code says ready, the exact original file is sent again. */
