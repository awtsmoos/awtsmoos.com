//B"H
import { openModal } from './modals.js';
import { updatePlayIcon } from './player.js';
import { SearchPanel } from './browser/search-panel.js';
import state from '../modules/state.js';

/**
 * B"H
 * UI init is the doorkeeper. The Awtsmoos sparks every control into a messenger:
 * player, search, studio, and now the bookshelf where remembered sichos rest.
 * @param {object} cb Application callbacks.
 */
export function initUI(cb) {
  console.log('VIEW: Initializing UI...');
  mountPlayerPolishStyles();
  mountDateSearch(cb);
  mountBookshelfShell();
  bindButtons(cb);
  bindCloseLayer(cb);
}

function bindButtons(cb) {
  const $ = id => document.getElementById(id);
  let button;
  if (button = $('btn-play')) button.onclick = event => {
    event.stopPropagation();
    cb.onPlayPause();
    updatePlayIcon(cb.isPlaying());
  };
  if (button = $('btn-next')) button.onclick = cb.onNext;
  if (button = $('btn-prev')) button.onclick = cb.onPrev;
  if (button = $('btn-slice')) {
    button.title = 'Studio / video tools';
    button.setAttribute('aria-label', 'Studio / video tools');
    button.onclick = event => {
      event.stopPropagation();
      cb.onOpenSliceModal?.();
    };
  }
  if (button = $('player-seeker')) button.onclick = event => seekFromBar(event, button, cb);
  if (button = $('btn-search')) button.onclick = () => openModal('modal-search');
  if (button = $('btn-bookshelf')) button.onclick = () => cb.onOpenBookshelf?.();
  if (button = $('btn-bookshelf-clear')) button.onclick = () => {
    if (confirm('CLEAR ALL BOOKMARKS?')) cb.onClearBookshelf?.();
  };
  if (button = $('btn-share')) button.onclick = cb.onShare;
  if (button = $('btn-settings')) button.onclick = () => openModal('modal-settings');
  if (button = $('btn-action-clear')) button.onclick = () => {
    if (confirm('DELETE ALL CACHED AUDIO?')) cb.onClearDB();
  };
  if (button = $('btn-generate-analyze')) button.onclick = () => cb.onAnalyzeVideo(
    parseFloat($('vid-start').value || 0),
    parseFloat($('vid-duration').value || 15),
    $('vid-res').value
  );
  if (button = $('btn-download-audio')) button.onclick = () => cb.onDownloadAudioSlice(state);
  if (button = $('btn-close-studio')) button.onclick = () => cb.onCloseStudio?.();
  if (button = $('back-tracks')) button.onclick = cb.onBack;
  if (button = $('back-folders')) button.onclick = cb.onBack;
}

function seekFromBar(event, bar, cb) {
  const rect = bar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  cb.onSeekFraction?.(percent);
}

function mountDateSearch(cb) {
  const modal = document.getElementById('modal-search');
  new SearchPanel(cb).mount(modal);
}

function mountBookshelfShell() {
  const tools = document.querySelector('.tools');
  if (tools && !document.getElementById('btn-bookshelf')) tools.insertBefore(bookButton(), tools.children[1] || null);
  const overlay = document.getElementById('overlay-layer');
  if (overlay && !document.getElementById('modal-bookshelf')) overlay.insertBefore(bookModal(), overlay.firstChild);
}

function bookButton() {
  const button = document.createElement('button');
  button.className = 'tool-btn';
  button.id = 'btn-bookshelf';
  button.title = 'Bookshelf Bookmarks';
  button.innerHTML = '<span class="tool-emoji">▰</span>';
  return button;
}

function bookModal() {
  const modal = document.createElement('div');
  modal.className = 'modal hidden bookshelf-modal';
  modal.id = 'modal-bookshelf';
  modal.innerHTML = `
    <h2>BOOKSHELF</h2>
    <div class="bookshelf-top">
      <button class="modal-btn danger" id="btn-bookshelf-clear">CLEAR BOOKMARKS</button>
      <button class="modal-btn modal-close">CLOSE</button>
    </div>
    <div id="bookshelf-list"></div>`;
  return modal;
}

function mountPlayerPolishStyles() {
  if (document.getElementById('reb-ui-polish')) return;
  const style = document.createElement('style');
  style.id = 'reb-ui-polish';
  style.textContent = `.tool-emoji{font-size:26px;line-height:1;color:currentColor}.bookshelf-modal{width:min(900px,94vw)!important}.bookshelf-top{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}.track-left,.folder-label{min-width:0;flex:1;display:flex;align-items:center;overflow:hidden}.t-name,.item-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.item-actions{display:flex;gap:8px;margin-left:10px;align-items:center;flex-shrink:0}.t-dur{font-family:monospace;color:#888}.mini-btn.saved{color:var(--c-cyan)!important;border-color:var(--c-cyan)!important}.ctrl-btn{position:relative;z-index:5;touch-action:manipulation}.ctrl-btn svg{pointer-events:none}.hidden{display:none!important}@media(max-width:768px){body{height:100dvh!important}.controls{order:1!important;display:grid!important;grid-template-columns:repeat(4,minmax(56px,1fr));gap:10px!important;width:100%;padding-bottom:0!important}.info{order:2!important}.ctrl-btn{width:100%!important;height:56px!important;border-radius:12px!important;background:#030b0c!important}.ctrl-btn svg{width:30px!important;height:30px!important}#btn-play{height:64px!important;background:rgba(0,243,255,.18)!important}#btn-slice:after{content:'STUDIO';position:absolute;bottom:2px;font-size:9px;letter-spacing:1px;color:currentColor}footer{padding:10px 12px calc(16px + env(safe-area-inset-bottom))!important;gap:9px!important;max-height:42vh!important;overflow:visible!important}.track-title{font-size:14px!important}.progress-container{height:18px!important}.time-display{font-size:12px!important}main{min-height:0!important}}`;
  document.head.appendChild(style);
}

function bindCloseLayer(cb) {
  document.querySelectorAll('.modal-close').forEach(button => {
    if (button.id !== 'btn-close-studio') button.onclick = () => closeAll(cb);
  });
  const overlay = document.getElementById('overlay-layer');
  if (overlay) overlay.onclick = event => {
    if (event.target === overlay) closeAll(cb);
  };
}

function closeAll(cb) {
  const studio = document.getElementById('modal-studio');
  if (studio && !studio.classList.contains('hidden') && cb?.onCloseStudio) {
    cb.onCloseStudio();
    return;
  }
  document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
  document.getElementById('overlay-layer')?.classList.add('hidden');
}
