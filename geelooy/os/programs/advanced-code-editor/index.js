// B"H
import { createVfsBridge, postOpenFile } from './vfsBridge.js';

export default ({ os, content = '', path = '/', title = 'Advanced Code Editor', fileName = title } = {}) => {
  const root = document.createElement('div');
  root.className = 'advanced-code-editor-shell';
  root.style.cssText = 'height:100%;display:flex;flex-direction:column;background:#101827;color:#e8f6ff';
  const iframe = document.createElement('iframe');
  iframe.src = '/apps/code/?embed=awtsmoos-os';
  iframe.title = title;
  iframe.style.cssText = 'border:0;flex:1;width:100%;height:100%;background:#0b1020';
  root.appendChild(iframe);
  const basePath = normalizeBasePath(path);
  const initialFile = { basePath, fileName, title, content:contentText(content), path:joinPath(basePath, fileName) };
  const detach = createVfsBridge({ os, iframe, basePath, initialFile });
  iframe.addEventListener('load', () => postOpenFile(iframe, basePath, initialFile));
  return { div:root, onclose:detach };
};

function contentText(content) { return typeof content === 'string' ? content : content?.content ?? JSON.stringify(content || '', null, 2); }
function normalizeBasePath(path = '/') { return String(path || '/').startsWith('awtsmoos://') ? path : `/${String(path || '/').replace(/^\/+/, '')}`; }
function joinPath(path, name = '') { if (!name) return path; return String(path).startsWith('awtsmoos://') ? `${path.replace(/\/+$/, '')}/${name}` : `/${[path, name].join('/').split('/').filter(Boolean).join('/')}`; }

/** B"H: Code windows now resend the same initial file when the embedded app announces readiness. */
