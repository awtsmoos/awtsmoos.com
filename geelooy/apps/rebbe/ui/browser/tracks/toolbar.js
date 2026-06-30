//B"H
import { openAddToPlaylist, playlistTrackItem, selectedPlaylistItems } from '../../playlists.js';
import { createCommandButton } from './commands.js';
import { openSelectedPlaylistPicker, selectAllVisible } from './selection.js';

/**
 * B"H
 * Event toolbar. Six gates, not a tangled swarm: select, add, playlist, export,
 * cache, save. The Awtsmoos gives each action a name the hand can trust.
 * @param {string} folderTitle Event title.
 * @param {Array<object>} tracks Event tracks.
 * @param {Function} onAction Controller callback.
 * @returns {HTMLDivElement} Toolbar node.
 */
export function renderEventToolbar(folderTitle, tracks = [], onAction) {
  const bar = document.createElement('div');
  bar.className = 'event-toolbar premium-event-toolbar';
  bar.appendChild(copyBlock(folderTitle, tracks.length));
  bar.appendChild(actionDeck(folderTitle, tracks, onAction));
  return bar;
}

function copyBlock(folderTitle, count) {
  const block = document.createElement('div');
  block.className = 'event-toolbar-copy';
  block.innerHTML = `<span class="toolbar-kicker">offline event library</span><strong></strong><div class="toolbar-sub"><b class="picked-event-count">0</b> selected · ${count} track${count === 1 ? '' : 's'}</div>`;
  block.querySelector('strong').textContent = folderTitle || 'EVENT';
  return block;
}

function actionDeck(folderTitle, tracks, onAction) {
  const deck = document.createElement('div');
  deck.className = 'event-toolbar-actions';
  buttons(folderTitle, tracks, onAction).forEach(button => deck.appendChild(button));
  deck.querySelector('.mini-select-all-tracks').onclick = event => { event.stopPropagation(); selectAllVisible(true); };
  deck.querySelector('.mini-playlist-selected-tracks').onclick = event => { event.stopPropagation(); openSelectedPlaylistPicker(); };
  deck.querySelector('.mini-playlist-event').onclick = event => { event.stopPropagation(); openWholeEvent(folderTitle, tracks); };
  return deck;
}

function buttons(folderTitle, tracks, onAction) {
  const single = tracks.length === 1;
  return [
    createCommandButton({ icon: '☑', label: 'Select', title: 'Select all tracks', action: 'select-all-tracks', onAction }),
    createCommandButton({ icon: '+', label: 'Add', title: 'Add selected tracks', action: 'playlist-selected-tracks', onAction, disabled: !selectedPlaylistItems().length }),
    createCommandButton({ icon: '♫', label: 'Playlist', title: 'Add event to playlist', action: 'playlist-event', onAction }),
    createCommandButton({ icon: '⬇', label: single ? 'Download' : 'Export', title: single ? 'Download this event file' : 'Export this event as ZIP', action: 'download-event', onAction }),
    createCommandButton({ icon: '⚡', label: 'Cache', title: 'Cache this event', action: 'cache-event', onAction }),
    createCommandButton({ icon: '☆', label: 'Save', title: 'Bookmark this event', action: 'bookmark-folder', onAction })
  ];
}

function openWholeEvent(folderTitle, tracks) {
  const items = tracks.map(track => playlistTrackItem(track, { folder: folderTitle, title: folderTitle }));
  openAddToPlaylist(items);
}
