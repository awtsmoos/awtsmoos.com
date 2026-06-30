//B"H
import { art, esc } from './format.js';
import { playlistItemKey } from '../../store.js';

/**
 * B"H
 * HTML inscriptions for playlist chambers. These are static vessel shapes only;
 * behavior is bound by home/detail/picker so markup does not become a maze.
 */
export function playlistModalHtml() { return `<div class="modal hidden playlist-modal" id="modal-playlists" role="dialog" aria-modal="true"><div class="modal-head playlist-head"><span>CUSTOM PLAYLISTS</span><button class="modal-close" aria-label="Close playlists">×</button></div><div class="modal-body playlist-body"><div class="playlist-hero"><div class="playlist-mosaic">♫</div><div><div class="playlist-kicker">offline / export / ordered playback</div><h2>Your Sicho Rivers</h2></div><button type="button" class="btn-action playlist-new-btn">NEW PLAYLIST</button></div><div id="playlist-home"></div></div></div>`; }
export function addModalHtml() { return `<div class="modal hidden playlist-modal compact" id="modal-playlist-add" role="dialog" aria-modal="true"><div class="modal-head playlist-head"><span>ADD TO PLAYLIST</span><button class="modal-close" aria-label="Close add to playlist">×</button></div><div class="modal-body playlist-body"><div class="playlist-create-row"><input class="cyber-input" id="playlist-new-name" placeholder="New playlist name"><button type="button" class="btn-action" id="playlist-create-now">CREATE + ADD</button></div><div id="playlist-picker"></div></div></div>`; }
export function emptyHtml() { return '<div class="playlist-empty">NO CUSTOM PLAYLISTS YET<br><small>Create one from search results, events, or selected tracks.</small></div>'; }

/** @param {object} pl Playlist row. @param {number} index Sort index. @returns {string} Card markup. */
export function playlistCard(pl, index) {
  return `<article class="playlist-card"><div class="playlist-orb">${art(pl)}</div><div class="playlist-card-main"><h3>${esc(pl.title)}</h3><p data-card-stats="${esc(pl.id)}">${(pl.items || []).length} item(s)</p><div class="playlist-actions"><button type="button" class="mini-btn" data-play-playlist="${esc(pl.id)}">PLAY</button><button type="button" class="mini-btn" data-shuffle-playlist="${esc(pl.id)}">SHUFFLE</button><button type="button" class="mini-btn" data-open-playlist="${esc(pl.id)}">DETAILS</button><button type="button" class="mini-btn" data-download-playlist="${esc(pl.id)}">EXPORT</button><button type="button" class="mini-btn" data-cache-playlist="${esc(pl.id)}">CACHE</button><button type="button" class="mini-btn" data-duplicate-playlist="${esc(pl.id)}">COPY</button><button type="button" class="mini-btn" data-move-list="${index}" data-delta="-1">↑</button><button type="button" class="mini-btn" data-move-list="${index}" data-delta="1">↓</button><button type="button" class="mini-btn danger" data-delete-playlist="${esc(pl.id)}">DELETE</button></div></div></article>`;
}

/** @param {object} pl Playlist. @returns {string} Detail markup. */
export function detailHtml(pl) {
  const items = pl.items || [];
  return `<button type="button" class="mini-btn" id="playlist-back">← ALL PLAYLISTS</button><div class="playlist-detail-hero"><div class="playlist-art-mosaic">${items.slice(0, 4).map(item => `<span>${esc((item.title || '?').slice(0, 1))}</span>`).join('') || '<span>♫</span>'}</div><div class="playlist-edit-grid"><input class="cyber-input" id="playlist-title-edit" value="${esc(pl.title)}"><input class="cyber-input" id="playlist-desc-edit" value="${esc(pl.description || '')}" placeholder="Description"><input class="cyber-input" id="playlist-art-edit" value="${esc(pl.artwork || '')}" placeholder="Artwork URL or note"><button type="button" class="btn-action" id="playlist-save-title">SAVE</button></div></div><div id="playlist-detail-stats" class="playlist-detail-stats">Loading stats...</div><div class="playlist-detail-actions"><button type="button" class="mini-btn" id="playlist-play">PLAY</button><button type="button" class="mini-btn" id="playlist-shuffle">SHUFFLE</button><button type="button" class="mini-btn" id="playlist-loop-list">LOOP LIST</button><button type="button" class="mini-btn" id="playlist-loop-track">LOOP TRACK</button><button type="button" class="mini-btn" id="playlist-cache-missing">CACHE</button><button type="button" class="mini-btn" id="playlist-refresh-cache">REFRESH</button><button type="button" class="mini-btn" id="playlist-zip">EXPORT</button><button type="button" class="mini-btn" id="playlist-merge">MERGE</button><button type="button" class="mini-btn danger" id="playlist-remove-cache">REMOVE CACHE</button></div><div class="playlist-track-list">${items.map(trackRow).join('') || '<div class="playlist-empty small">This playlist is empty.</div>'}</div>`;
}

/** @param {object} item Playlist item. @param {number} index Item index. @returns {string} Row markup. */
export function trackRow(item, index) {
  const key = playlistItemKey(item);
  return `<div class="playlist-track-row"><span class="playlist-index">${String(index + 1).padStart(2, '0')}</span><span class="playlist-track-title">${esc(item.title || item.path || 'Untitled')}</span><button type="button" class="mini-btn" data-play-from="${index}">PLAY</button><button type="button" class="mini-btn" data-move-up="${index}">↑</button><button type="button" class="mini-btn" data-move-down="${index}">↓</button><button type="button" class="mini-btn danger" data-remove-key="${esc(key)}">DELETE</button></div>`;
}

/** @param {object} pl Playlist. @returns {string} Picker card. */
export function pickerCard(pl) { return `<button type="button" class="playlist-picker-card" data-add-existing="${esc(pl.id)}"><b>${esc(pl.title)}</b><span>${(pl.items || []).length} items</span></button>`; }
