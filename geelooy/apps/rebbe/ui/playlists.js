//B"H
import * as Store from '../store.js';

let callbacks = {};
let pendingItems = [];
let selectedTracks = new Map();

/**
 * B"H
 * Mounts the playlist throne. The Awtsmoos gathers scattered audio sparks into
 * ordered crowns with clearer buttons, export language, cache controls, and a
 * cleaner studio glow sharing the same command style.
 * @param {object} cb Application callbacks for play/cache/download flows.
 * @returns {void}
 */
export function initPlaylists(cb = {}) { callbacks = cb; mountStyle(); mountShell(); bindGlobalButtons(); }
export async function openPlaylists() { await renderPlaylistHome(); openPlaylistModal('modal-playlists'); }
export async function openAddToPlaylist(items = []) { pendingItems = items.filter(Boolean).map(item => ({ ...item, addedAt: Date.now() })); await renderPlaylistPicker(); openPlaylistModal('modal-playlist-add'); }
export function playlistTrackItem(track, event = {}) { return { type: 'track', year: String(event.year || ''), folder: event.folder || '', title: track.title || track.name || event.title || 'Audio', path: track.path || '', url: track.url || '', fallbackUrls: track.fallbackUrls || [], duration: track.duration || 0, track, event }; }
export function playlistEventItem(event = {}, tracks = []) { return tracks.length ? tracks.map(track => playlistTrackItem(track, event)) : [{ type: 'event', year: String(event.year || ''), folder: event.folder || '', title: event.title || event.folder || 'Event', event }]; }
export function togglePlaylistSelection(item, checked) { const key = Store.playlistItemKey(item); checked ? selectedTracks.set(key, item) : selectedTracks.delete(key); renderSelectionBar(); }
export function selectedPlaylistItems() { return [...selectedTracks.values()]; }
export function clearPlaylistSelection() { selectedTracks.clear(); document.querySelectorAll('[data-playlist-pick]').forEach(input => { input.checked = false; }); renderSelectionBar(); }

function mountShell() {
  const tools = document.querySelector('.tools');
  if (tools && !document.getElementById('btn-playlists')) { const b = document.createElement('button'); b.className = 'tool-btn'; b.id = 'btn-playlists'; b.title = 'Custom Playlists'; b.innerHTML = '<span class="tool-emoji">♫</span>'; tools.insertBefore(b, tools.children[2] || null); }
  const overlay = document.getElementById('overlay-layer');
  if (!overlay) return;
  if (!document.getElementById('modal-playlists')) overlay.insertAdjacentHTML('beforeend', playlistModalHtml());
  if (!document.getElementById('modal-playlist-add')) overlay.insertAdjacentHTML('beforeend', addModalHtml());
}

function bindGlobalButtons() {
  document.getElementById('btn-playlists')?.addEventListener('click', openPlaylists);
  document.getElementById('playlist-create-now')?.addEventListener('click', createAndAddPending);
  document.querySelectorAll('.playlist-new-btn').forEach(btn => btn.addEventListener('click', createEmptyPlaylist));
}

async function createEmptyPlaylist() { const title = prompt('Playlist name?'); if (!title) return; await Store.savePlaylist({ title, items: [] }); await renderPlaylistHome(); }
async function createAndAddPending() { const input = document.getElementById('playlist-new-name'); const title = input?.value.trim(); if (!title) return; const playlist = await Store.savePlaylist({ title, items: pendingItems }); input.value = ''; await renderPlaylistPicker(); await renderPlaylistHome(); toast(`Added ${pendingItems.length} item(s) to ${playlist.title}`); }

async function renderPlaylistHome() {
  const root = document.getElementById('playlist-home');
  if (!root) return;
  const playlists = await Store.listPlaylists();
  root.innerHTML = playlists.length ? `<div class="playlist-home-actions"><button class="mini-btn" id="playlist-continue-last">CONTINUE LAST</button><button class="mini-btn playlist-new-btn">NEW PLAYLIST</button></div>${playlists.map(playlistCard).join('')}` : emptyHtml();
  root.querySelector('#playlist-continue-last')?.addEventListener('click', () => callbacks.onContinueLastPlaylist?.());
  root.querySelector('.playlist-new-btn')?.addEventListener('click', createEmptyPlaylist);
  bindHome(root);
  hydrateCardStats(root, playlists);
}

function bindHome(root) {
  root.querySelectorAll('[data-open-playlist]').forEach(btn => btn.onclick = () => openPlaylist(btn.dataset.openPlaylist));
  root.querySelectorAll('[data-delete-playlist]').forEach(btn => btn.onclick = () => deletePlaylist(btn.dataset.deletePlaylist));
  root.querySelectorAll('[data-duplicate-playlist]').forEach(btn => btn.onclick = () => duplicatePlaylist(btn.dataset.duplicatePlaylist));
  root.querySelectorAll('[data-play-playlist]').forEach(btn => btn.onclick = () => callbacks.onPlayPlaylist?.(btn.dataset.playPlaylist));
  root.querySelectorAll('[data-shuffle-playlist]').forEach(btn => btn.onclick = () => callbacks.onPlayPlaylist?.(btn.dataset.shufflePlaylist, { shuffle: true }));
  root.querySelectorAll('[data-cache-playlist]').forEach(btn => btn.onclick = () => callbacks.onCachePlaylist?.(btn.dataset.cachePlaylist));
  root.querySelectorAll('[data-download-playlist]').forEach(btn => btn.onclick = () => callbacks.onDownloadPlaylist?.(btn.dataset.downloadPlaylist));
  root.querySelectorAll('[data-move-list]').forEach(btn => btn.onclick = () => movePlaylist(Number(btn.dataset.moveList), Number(btn.dataset.delta)));
}

async function hydrateCardStats(root, playlists) { for (const pl of playlists) { const stats = await Store.playlistStats(pl); const node = root.querySelector(`[data-card-stats="${css(pl.id)}"]`); if (node) node.textContent = `${stats.itemCount} tracks · ${fmtTime(stats.duration)} · ${stats.cachedCount} cached · ${fmtBytes(stats.cachedBytes)} · last ${date(stats.lastPlayedAt)}`; } }
async function movePlaylist(from, delta) { await Store.reorderPlaylist(null, from, from + delta); await renderPlaylistHome(); }
async function deletePlaylist(id) { if (!confirm('Delete this playlist?')) return; await Store.removePlaylist(id); await renderPlaylistHome(); }
async function duplicatePlaylist(id) { await Store.duplicatePlaylist(id); await renderPlaylistHome(); }

async function openPlaylist(id) {
  const playlist = await Store.getPlaylist(id);
  const root = document.getElementById('playlist-home');
  if (!root || !playlist) return;
  root.innerHTML = detailHtml(playlist);
  bindDetail(root, playlist);
  const stats = await Store.playlistStats(playlist);
  root.querySelector('#playlist-detail-stats').textContent = `${stats.itemCount} tracks · ${fmtTime(stats.duration)} · ${stats.cachedCount} cached · ${fmtBytes(stats.cachedBytes)} · last ${date(stats.lastPlayedAt)}`;
}

function bindDetail(root, playlist) {
  root.querySelector('#playlist-back').onclick = renderPlaylistHome;
  root.querySelector('#playlist-save-title').onclick = () => savePlaylistEdits(playlist);
  root.querySelector('#playlist-play').onclick = () => callbacks.onPlayPlaylist?.(playlist.id);
  root.querySelector('#playlist-shuffle').onclick = () => callbacks.onPlayPlaylist?.(playlist.id, { shuffle: true });
  root.querySelector('#playlist-loop-list').onclick = () => callbacks.onSetPlaylistLoop?.(playlist.id, 'playlist');
  root.querySelector('#playlist-loop-track').onclick = () => callbacks.onSetPlaylistLoop?.(playlist.id, 'track');
  root.querySelector('#playlist-cache-missing').onclick = () => callbacks.onCachePlaylist?.(playlist.id);
  root.querySelector('#playlist-refresh-cache').onclick = () => callbacks.onRefreshCachedPlaylist?.(playlist.id);
  root.querySelector('#playlist-remove-cache').onclick = () => callbacks.onRemoveCachedPlaylist?.(playlist.id);
  root.querySelector('#playlist-zip').onclick = () => callbacks.onDownloadPlaylist?.(playlist.id);
  root.querySelector('#playlist-merge').onclick = () => mergeInto(playlist.id);
  root.querySelectorAll('[data-remove-key]').forEach(btn => btn.onclick = () => removeItem(playlist.id, btn.dataset.removeKey));
  root.querySelectorAll('[data-move-up]').forEach(btn => btn.onclick = () => moveItem(playlist.id, Number(btn.dataset.moveUp), -1));
  root.querySelectorAll('[data-move-down]').forEach(btn => btn.onclick = () => moveItem(playlist.id, Number(btn.dataset.moveDown), 1));
  root.querySelectorAll('[data-play-from]').forEach(btn => btn.onclick = () => callbacks.onPlayPlaylist?.(playlist.id, { index: Number(btn.dataset.playFrom) }));
}

async function savePlaylistEdits(playlist) { const title = document.getElementById('playlist-title-edit')?.value; const description = document.getElementById('playlist-desc-edit')?.value; const artwork = document.getElementById('playlist-art-edit')?.value; await Store.savePlaylist({ ...playlist, title, description, artwork }); await openPlaylist(playlist.id); }
async function removeItem(id, key) { await Store.removeItemFromPlaylist(id, key); await openPlaylist(id); }
async function moveItem(id, from, delta) { await Store.reorderPlaylistItem(id, from, from + delta); await openPlaylist(id); }
async function mergeInto(targetId) { const other = prompt('Paste playlist id to merge into this playlist'); if (!other) return; await Store.mergePlaylists(targetId, [other]); await openPlaylist(targetId); }

async function renderPlaylistPicker() {
  const root = document.getElementById('playlist-picker');
  if (!root) return;
  const playlists = await Store.listPlaylists();
  root.innerHTML = `<div class="playlist-pending"><b>${pendingItems.length}</b> selected item(s)</div>` + (playlists.length ? playlists.map(pickerCard).join('') : '<div class="playlist-empty small">No playlists yet. Create one above.</div>');
  root.querySelectorAll('[data-add-existing]').forEach(btn => btn.onclick = () => addToExisting(btn.dataset.addExisting));
}
async function addToExisting(id) { const playlist = await Store.addItemsToPlaylist(id, pendingItems); await renderPlaylistPicker(); toast(`Added to ${playlist?.title || 'playlist'}`); }

function renderSelectionBar() {
  let bar = document.getElementById('playlist-selection-bar');
  if (!bar) { bar = document.createElement('div'); bar.id = 'playlist-selection-bar'; document.body.appendChild(bar); }
  const count = selectedTracks.size;
  bar.classList.toggle('hidden', !count);
  bar.innerHTML = count ? `<div class="playlist-selection-inner"><b>${count}</b><span>selected for playlist</span><button id="playlist-selection-add">ADD</button><button id="playlist-selection-clear">CLEAR</button></div>` : '';
  document.getElementById('playlist-selection-add')?.addEventListener('click', () => openAddToPlaylist(selectedPlaylistItems()));
  document.getElementById('playlist-selection-clear')?.addEventListener('click', clearPlaylistSelection);
}

function playlistModalHtml() { return `<div class="modal hidden playlist-modal" id="modal-playlists" role="dialog" aria-modal="true"><div class="modal-head playlist-head"><span>CUSTOM PLAYLISTS</span><button class="modal-close" aria-label="Close playlists">×</button></div><div class="modal-body playlist-body"><div class="playlist-hero"><div class="playlist-mosaic">♫</div><div><div class="playlist-kicker">offline / parallel export / ordered playback</div><h2>Your Sicho Rivers</h2></div><button class="btn-action playlist-new-btn">NEW PLAYLIST</button></div><div id="playlist-home"></div></div></div>`; }
function addModalHtml() { return `<div class="modal hidden playlist-modal compact" id="modal-playlist-add" role="dialog" aria-modal="true"><div class="modal-head playlist-head"><span>ADD TO PLAYLIST</span><button class="modal-close" aria-label="Close add to playlist">×</button></div><div class="modal-body playlist-body"><div class="playlist-create-row"><input class="cyber-input" id="playlist-new-name" placeholder="New playlist name"><button class="btn-action" id="playlist-create-now">CREATE + ADD</button></div><div id="playlist-picker"></div></div></div>`; }
function playlistCard(pl, index) { const count = (pl.items || []).length; return `<article class="playlist-card"><div class="playlist-orb">${art(pl)}</div><div class="playlist-card-main"><h3>${esc(pl.title)}</h3><p data-card-stats="${esc(pl.id)}">${count} item(s)</p><div class="playlist-actions"><button class="mini-btn" data-open-playlist="${esc(pl.id)}">DETAILS</button><button class="mini-btn" data-play-playlist="${esc(pl.id)}">PLAY</button><button class="mini-btn" data-shuffle-playlist="${esc(pl.id)}">SHUFFLE</button><button class="mini-btn" data-cache-playlist="${esc(pl.id)}">CACHE</button><button class="mini-btn" data-download-playlist="${esc(pl.id)}">EXPORT ZIP</button><button class="mini-btn" data-duplicate-playlist="${esc(pl.id)}">COPY</button><button class="mini-btn" data-move-list="${index}" data-delta="-1">↑</button><button class="mini-btn" data-move-list="${index}" data-delta="1">↓</button><button class="mini-btn danger" data-delete-playlist="${esc(pl.id)}">DELETE</button></div></div></article>`; }
function detailHtml(pl) { const items = pl.items || []; return `<button class="mini-btn" id="playlist-back">← ALL PLAYLISTS</button><div class="playlist-detail-hero"><div class="playlist-art-mosaic">${items.slice(0, 4).map(item => `<span>${esc((item.title || '?').slice(0, 1))}</span>`).join('') || '<span>♫</span>'}</div><div><input class="cyber-input" id="playlist-title-edit" value="${esc(pl.title)}"><input class="cyber-input" id="playlist-desc-edit" value="${esc(pl.description || '')}" placeholder="Description"><input class="cyber-input" id="playlist-art-edit" value="${esc(pl.artwork || '')}" placeholder="Artwork URL or note"><button class="btn-action" id="playlist-save-title">SAVE</button></div></div><div id="playlist-detail-stats" class="playlist-detail-stats">Loading stats...</div><div class="playlist-detail-actions"><button class="mini-btn" id="playlist-play">PLAY</button><button class="mini-btn" id="playlist-shuffle">SHUFFLE</button><button class="mini-btn" id="playlist-loop-list">LOOP LIST</button><button class="mini-btn" id="playlist-loop-track">LOOP TRACK</button><button class="mini-btn" id="playlist-cache-missing">CACHE MISSING</button><button class="mini-btn" id="playlist-refresh-cache">REFRESH CACHE</button><button class="mini-btn danger" id="playlist-remove-cache">REMOVE CACHE</button><button class="mini-btn" id="playlist-zip">EXPORT ZIP + MANIFEST</button><button class="mini-btn" id="playlist-merge">MERGE</button></div><div class="playlist-track-list">${items.map(trackRow).join('') || '<div class="playlist-empty small">This playlist is empty.</div>'}</div>`; }
function trackRow(item, i) { const key = Store.playlistItemKey(item); return `<div class="playlist-track-row" draggable="true"><span class="playlist-index">${String(i + 1).padStart(2, '0')}</span><span class="playlist-track-title">${esc(item.title || item.path || 'Untitled')}</span><button class="mini-btn" data-play-from="${i}">PLAY</button><button class="mini-btn" data-move-up="${i}">↑</button><button class="mini-btn" data-move-down="${i}">↓</button><button class="mini-btn danger" data-remove-key="${esc(key)}">REMOVE</button></div>`; }
function pickerCard(pl) { return `<button class="playlist-picker-card" data-add-existing="${esc(pl.id)}"><b>${esc(pl.title)}</b><span>${(pl.items || []).length} items</span></button>`; }
function emptyHtml() { return '<div class="playlist-empty">NO CUSTOM PLAYLISTS YET<br><small>Create one from search results, events, or selected tracks.</small></div>'; }
function openPlaylistModal(id) { document.getElementById('overlay-layer')?.classList.remove('hidden'); document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); const modal = document.getElementById(id); modal?.classList.remove('hidden'); modal?.querySelector('button,input')?.focus(); }
function toast(message) { if (callbacks.onToast) callbacks.onToast(message); else console.log(message); }
function date(value) { return value ? new Date(value).toLocaleDateString() : 'never'; }
function fmtBytes(bytes) { if (!bytes) return '0 B'; const units = ['B', 'KB', 'MB', 'GB']; let i = 0; let n = bytes; while (n > 1024 && i < units.length - 1) { n /= 1024; i++; } return `${n.toFixed(i ? 1 : 0)} ${units[i]}`; }
function fmtTime(seconds) { const s = Math.round(seconds || 0); return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`; }
function art(pl) { return esc(pl.artwork ? '▣' : String((pl.title || 'P')[0]).toUpperCase()); }
function css(v) { return String(v).replace(/"/g, '\\"'); }
function esc(v) { return String(v ?? '').replace(/[&<>"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[ch])); }

function mountStyle() {
  if (document.getElementById('playlist-style-awtsmoos')) return;
  const style = document.createElement('style');
  style.id = 'playlist-style-awtsmoos';
  style.textContent = `.playlist-modal{width:min(1100px,96vw)!important;max-height:92dvh;border:1px solid rgba(0,243,255,.8)!important;border-radius:24px;overflow:hidden;background:linear-gradient(135deg,rgba(2,10,18,.98),rgba(0,0,0,.99))!important;box-shadow:0 32px 96px rgba(0,0,0,.8),0 0 80px rgba(0,243,255,.2)!important}.playlist-modal.compact{width:min(720px,94vw)!important}.playlist-head{background:linear-gradient(90deg,rgba(0,243,255,.95),rgba(255,204,0,.88))!important;color:#020608!important;display:flex;justify-content:space-between;align-items:center;letter-spacing:3px}.playlist-body{max-height:calc(92dvh - 70px);overflow:auto;color:#eaffff!important;padding:22px!important}.playlist-hero,.playlist-detail-hero{display:flex;align-items:center;gap:18px;padding:22px;border:1px solid rgba(0,243,255,.25);border-radius:22px;background:radial-gradient(circle at top left,rgba(0,243,255,.18),transparent 42%),rgba(255,255,255,.035);margin-bottom:18px}.playlist-hero{justify-content:space-between}.playlist-mosaic,.playlist-art-mosaic,.playlist-orb{display:grid;place-items:center;background:#001114;border:1px solid var(--c-cyan);color:var(--c-yellow);box-shadow:inset 0 0 24px rgba(0,243,255,.18)}.playlist-mosaic{width:92px;height:92px;border-radius:28px;font-size:42px}.playlist-art-mosaic{width:150px;height:150px;border-radius:28px;grid-template-columns:1fr 1fr;font-size:38px}.playlist-orb{width:60px;height:60px;border-radius:20px;font-size:22px}.playlist-kicker{color:var(--c-yellow);font-size:11px;letter-spacing:3px;text-transform:uppercase}.playlist-hero h2{margin:5px 0 0;font-size:clamp(26px,4vw,48px);color:white}.playlist-home-actions{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px}.playlist-card{display:flex;gap:16px;padding:18px;margin:14px 0;border:1px solid rgba(0,243,255,.25);border-radius:20px;background:linear-gradient(120deg,rgba(0,243,255,.12),rgba(255,0,85,.07),rgba(0,0,0,.72));box-shadow:0 14px 40px rgba(0,0,0,.35);transition:.2s}.playlist-card:hover{transform:translateY(-2px);border-color:rgba(0,243,255,.9)}.playlist-card-main{min-width:0;flex:1}.playlist-card h3{margin:0;color:white;font-size:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.playlist-card p{margin:6px 0 12px;color:#9cc;font-size:12px}.playlist-actions,.playlist-detail-actions{display:flex;flex-wrap:wrap;gap:9px}.mini-btn{border:1px solid rgba(0,243,255,.45);background:rgba(0,0,0,.55);color:#dfffff;border-radius:999px;padding:8px 12px;cursor:pointer;font-weight:900;letter-spacing:1px}.mini-btn:hover,.mini-btn:focus{background:var(--c-cyan);color:#001014;outline:2px solid rgba(255,204,0,.45)}.mini-btn.danger,.mini-btn.danger:hover{border-color:var(--c-magenta);color:#fff;background:rgba(255,0,85,.22)}.playlist-empty{padding:46px;text-align:center;border:1px dashed rgba(0,243,255,.28);border-radius:18px;color:#8aa;letter-spacing:4px}.playlist-empty.small{padding:22px}.playlist-create-row{display:grid;grid-template-columns:1fr auto;gap:12px;margin-bottom:18px}.playlist-picker-card{width:100%;display:flex;justify-content:space-between;align-items:center;padding:15px 16px;margin:10px 0;border:1px solid rgba(0,243,255,.24);background:rgba(0,243,255,.07);color:white;border-radius:16px;cursor:pointer}.playlist-pending,.playlist-detail-stats{display:flex;gap:12px;flex-wrap:wrap;color:var(--c-yellow);margin:10px 0 14px}.playlist-track-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto auto auto;gap:10px;align-items:center;padding:12px;border-bottom:1px solid rgba(0,243,255,.16);background:rgba(255,255,255,.025)}.playlist-index{color:var(--c-yellow)}.playlist-track-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:white}#playlist-selection-bar{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:10030}.playlist-selection-inner{display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(0,10,12,.96);border:1px solid var(--c-cyan);border-radius:999px;color:white}.playlist-selection-inner button{border:1px solid rgba(255,204,0,.7);background:#050908;color:#fff;border-radius:999px;padding:7px 10px;font-weight:900}.studio-toolbar{gap:8px!important;align-items:center!important;padding:10px!important;background:linear-gradient(90deg,rgba(0,243,255,.08),rgba(255,204,0,.06),rgba(0,0,0,.8))!important;border-bottom:1px solid rgba(0,243,255,.22)!important}.studio-toolbar .modal-btn,.studio-toolbar label.modal-btn{border-radius:999px!important;min-height:34px!important;line-height:1!important}.studio-preview-wrapper{border:1px solid rgba(0,243,255,.35)!important;border-radius:18px!important;overflow:hidden!important;box-shadow:inset 0 0 45px rgba(0,243,255,.08),0 16px 50px rgba(0,0,0,.45)!important}.studio-props{border-right:1px solid rgba(0,243,255,.18)!important;background:linear-gradient(180deg,rgba(0,243,255,.05),rgba(0,0,0,.78))!important}@media(max-width:720px){.playlist-hero,.playlist-card,.playlist-detail-hero{display:grid}.playlist-create-row,.playlist-track-row{grid-template-columns:1fr}.playlist-actions,.playlist-detail-actions{display:grid;grid-template-columns:1fr 1fr}.mini-btn{width:100%}#playlist-selection-bar{left:10px;right:10px;transform:none}.playlist-selection-inner{border-radius:20px;display:grid;grid-template-columns:1fr 1fr}}`;
  document.head.appendChild(style);
}
