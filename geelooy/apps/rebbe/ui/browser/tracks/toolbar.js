//B"H
import { openAddToPlaylist, playlistTrackItem, selectedPlaylistItems } from '../../playlists.js';
import { createCommandButton } from './commands.js';
import { openSelectedPlaylistPicker, selectAllVisible } from './selection.js';

/**
 * B"H
 * Event toolbar. The Awtsmoos gives every action its honest garment: one file
 * says Download, many files say ZIP, and playlists receive tracks without
 * cramped or misleading speech.
 * @param {string} folderTitle Event title.
 * @param {Array<object>} tracks Event tracks.
 * @param {Function} onAction Controller callback.
 * @returns {HTMLDivElement} Toolbar node.
 */
export function renderEventToolbar(folderTitle, tracks = [], onAction) {
  const bar = document.createElement('div');
  bar.className = 'event-toolbar premium-event-toolbar';
  bar.append(copyBlock(folderTitle, tracks.length), actionDeck(folderTitle, tracks, onAction));
  return bar;
}

function copyBlock(folderTitle, count) {
  const block = document.createElement('div');
  block.className = 'event-toolbar-copy';
  block.innerHTML = `<span class="toolbar-kicker">offline event library</span><strong></strong><div class="toolbar-sub"><b class="picked-event-count">0</b> selected · ${count} file${count === 1 ? '' : 's'}</div>`;
  block.querySelector('strong').textContent = folderTitle || 'EVENT';
  return block;
}

function actionDeck(folderTitle, tracks, onAction) {
  const deck = document.createElement('div');
  deck.className = 'event-toolbar-actions command-deck';
  buttons(tracks, onAction).forEach(button => deck.appendChild(button));
  deck.querySelector('.mini-select-all-tracks').onclick = event => { event.stopPropagation(); selectAllVisible(true); };
  deck.querySelector('.mini-playlist-selected-tracks').onclick = event => { event.stopPropagation(); openSelectedPlaylistPicker(); };
  deck.querySelector('.mini-playlist-event').onclick = event => { event.stopPropagation(); openWholeEvent(folderTitle, tracks); };
  return deck;
}

function buttons(tracks, onAction) {
  const single = tracks.length === 1;
  return [
    createCommandButton({ icon: '☑', label: 'Select', title: 'Select all visible files', action: 'select-all-tracks', onAction, variant: 'neutral' }),
    createCommandButton({ icon: '+', label: 'Add', title: 'Add selected files to playlist', action: 'playlist-selected-tracks', onAction, disabled: !selectedPlaylistItems().length, variant: 'accent' }),
    createCommandButton({ icon: '♫', label: 'Playlist', title: 'Add whole event to playlist', action: 'playlist-event', onAction, variant: 'accent' }),
    createCommandButton({ icon: '⬇', label: single ? 'Download' : 'ZIP', title: single ? 'Download this file' : 'Download this event as a newest-first ZIP', action: 'download-event', onAction, variant: 'primary' }),
    createCommandButton({ icon: '⚡', label: 'Cache', title: 'Cache this event offline', action: 'cache-event', onAction, variant: 'cache' }),
    createCommandButton({ icon: '☆', label: 'Save', title: 'Save event to bookshelf', action: 'bookmark-folder', onAction, variant: 'accent' })
  ];
}

function openWholeEvent(folderTitle, tracks) {
  openAddToPlaylist(tracks.map(track => playlistTrackItem(track, { folder: folderTitle, title: folderTitle })));
}
