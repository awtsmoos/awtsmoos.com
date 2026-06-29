// B"H
import awtsmoosStyle from './style.js';
import { copyPublicOrLocalUrl, openLocalFile, publishLocalFile } from '../../session/localFileAccess.js';
export default ({ fileName, content, system, path, os } = {}) => {
  const activeOs = os || system?.os; const id = 'awtsmoosBinaryViewer'; const root = document.createElement('div'); root.classList.add('awtsmoos-viewer-container');
  const self = { id, div:root, content:() => content, fileName:() => fileName, init:() => {}, onresize() {} };
  const toast = (text, type, tag, options) => system?.makeToast?.(text, type, tag, options);
  const menuBar = document.createElement('div'); menuBar.classList.add('menu-bar');
  menuBar.appendChild(createMenu('Awtsmoos', new Map([
    ['Open in New Tab', async () => { openLocalFile(content, fileName); activeOs?.recordGraphEvent?.('file.preview', { path, fileName, mode:'local' }); await toast('Opened local IndexedDB preview. Log in for a permanent public alias URL.', 'info', 'local'); }],
    ['Get Public URL', async () => copyPublicOrLocalUrl({ path, fileName, content, os:activeOs, toast })],
    ['Publish Local File', async () => publishLocalFile({ path, fileName, content, os:activeOs, toast })],
    ['Download', () => download(content, fileName, activeOs, path)]
  ])));
  const holder = document.createElement('div'); holder.classList.add('content-holder'); renderContent(holder, content); root.append(menuBar, holder); ensureStyle(id, awtsmoosStyle); setTimeout(() => holder.style.height = `calc(100% - ${menuBar.offsetHeight}px)`, 0); return self;
};
function renderContent(holder, content) { if (!(content instanceof Blob)) return holder.appendChild(textNode(`Raw Text Display:

${content}`)); const url = URL.createObjectURL(content); if (content.type.startsWith('image/')) holder.appendChild(media('img', url)); else if (content.type === 'application/pdf') holder.appendChild(media('iframe', url)); else if (content.type.startsWith('video/')) holder.appendChild(media('video', url, true)); else if (content.type.startsWith('audio/')) holder.appendChild(media('audio', url, true)); else { const reader = new FileReader(); const pre = textNode(''); reader.onload = e => pre.textContent = e.target.result; reader.readAsText(content); holder.appendChild(pre); } }
function media(tag, url, controls = false) { const el = document.createElement(tag); el.src = url; if (controls) el.controls = true; el.style.cssText = tag === 'iframe' ? 'width:100%;height:100%;border:none' : 'max-width:100%;max-height:100%;object-fit:contain'; return el; }
function textNode(text) { const pre = document.createElement('pre'); pre.textContent = text; return pre; }
function download(content, fileName, os, path) { const blob = content instanceof Blob ? content : new Blob([content ?? '']); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url); os?.recordGraphEvent?.('file.download', { path, fileName }); }
function createMenu(name, actions) { const menu = document.createElement('div'); menu.classList.add('menu-item'); menu.textContent = name; const options = document.createElement('div'); options.classList.add('awtsmoos-options'); actions.forEach((func, action) => { const item = document.createElement('div'); item.textContent = action; item.addEventListener('click', func); options.appendChild(item); }); menu.addEventListener('click', e => { e.stopPropagation(); options.style.display = options.style.display === 'block' ? 'none' : 'block'; }); menu.appendChild(options); return menu; }
function ensureStyle(id, css) { if (document.querySelector(`.${id}`)) return; const style = document.createElement('style'); style.textContent = css; style.classList.add(id); document.head.appendChild(style); }
/** B"H: binary preview, publish, and download are graph-visible and real-upload aware. */
