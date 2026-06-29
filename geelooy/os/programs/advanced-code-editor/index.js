// B"H
export default ({ os, content = {}, path = '/', title = 'Advanced Code Editor' } = {}) => {
  const root = document.createElement('div'); root.className = 'advanced-code-editor-shell'; root.style.cssText = 'height:100%;display:flex;flex-direction:column;background:#111;color:#eee';
  const iframe = document.createElement('iframe'); iframe.src = '/apps/code/?embed=awtsmoos-os'; iframe.title = title; iframe.style.cssText = 'border:0;flex:1;width:100%;height:100%'; root.appendChild(iframe);
  const basePath = content.osPath || path || '/'; const onMessage = event => handleMessage(event, { os, iframe, basePath }); window.addEventListener('message', onMessage);
  iframe.addEventListener('load', () => post(iframe, 'awtsmoos-os-ready', { basePath }));
  return { div:root, onclose:() => window.removeEventListener('message', onMessage) };
};
async function handleMessage(event, ctx) { const msg = event.data || {}; if (!String(msg.type || '').startsWith('awtsmoos-os:')) return; const id = msg.id || `reply:${Date.now()}`; try { const data = await runCommand(msg, ctx); post(ctx.iframe, 'awtsmoos-os:reply', { id, ok:true, data }); } catch (error) { post(ctx.iframe, 'awtsmoos-os:reply', { id, ok:false, error:error.message }); } }
async function runCommand(msg, { os, basePath }) { const payload = msg.payload || {}; const path = vfsPath(payload.path || payload.osPath || basePath); if (msg.type === 'awtsmoos-os:list') return await os.vfs.list(path); if (msg.type === 'awtsmoos-os:read') return await os.vfs.read(filePath(path, payload.fileName)); if (msg.type === 'awtsmoos-os:write') return await os.vfs.write(filePath(path, payload.fileName), payload.content ?? '', { userId:'current' }); if (msg.type === 'awtsmoos-os:mkdir') return await os.vfs.mkdir(filePath(path, payload.name || payload.fileName), { userId:'current' }); if (msg.type === 'awtsmoos-os:remove') return await os.vfs.remove(filePath(path, payload.fileName || payload.name), { userId:'current' }); if (msg.type === 'awtsmoos-os:move') return await os.vfs.move(vfsPath(payload.from), vfsPath(payload.to), { userId:'current' }); throw new Error(`Unsupported OS editor command ${msg.type}`); }
function post(iframe, type, payload) { iframe.contentWindow?.postMessage?.({ type, payload }, '*'); }
function vfsPath(path = '/') { return String(path).startsWith('awtsmoos://') ? path : `/${String(path || '/').replace(/^\/+/, '')}`; }
function filePath(path, name = '') { if (!name) return path; return String(path).startsWith('awtsmoos://') ? `${path.replace(/\/+$/, '')}/${name}` : `/${[path, name].join('/').split('/').filter(Boolean).join('/')}`; }
/** B"H: the embedded code editor bridge now delegates every filesystem act to VFS. */
