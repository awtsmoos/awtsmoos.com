//B"H
import { addModalHtml, playlistModalHtml } from './html.js';

/**
 * B"H
 * Shell mount. The playlist palace is placed into the overlay once, and the top
 * toolbar receives a plain readable gate into the custom playlist river.
 * @param {object} deps Button callbacks.
 * @returns {void}
 */
export function mountPlaylistShell(deps = {}) {
  mountToolbarButton();
  mountModals();
  bindGlobalButtons(deps);
}

/** @param {string} id Modal id to reveal. @returns {void} */
export function openPlaylistModal(id) {
  document.getElementById('overlay-layer')?.classList.remove('hidden');
  document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
  const modal = document.getElementById(id);
  modal?.classList.remove('hidden');
  modal?.querySelector('button,input')?.focus();
}

function mountToolbarButton() {
  const tools = document.querySelector('.tools');
  if (!tools || document.getElementById('btn-playlists')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tool-btn';
  button.id = 'btn-playlists';
  button.title = 'Custom Playlists';
  button.innerHTML = '<span class="tool-emoji">♫</span><span class="sr-only">Playlists</span>';
  tools.insertBefore(button, tools.children[2] || null);
}

function mountModals() {
  const overlay = document.getElementById('overlay-layer');
  if (!overlay) return;
  if (!document.getElementById('modal-playlists')) overlay.insertAdjacentHTML('beforeend', playlistModalHtml());
  if (!document.getElementById('modal-playlist-add')) overlay.insertAdjacentHTML('beforeend', addModalHtml());
}

function bindGlobalButtons({ openPlaylists, createEmptyPlaylist, createAndAddPending } = {}) {
  document.getElementById('btn-playlists')?.addEventListener('click', () => openPlaylists?.());
  document.querySelectorAll('.playlist-new-btn').forEach(btn => { btn.onclick = () => createEmptyPlaylist?.(); });
  const create = document.getElementById('playlist-create-now');
  if (create) create.onclick = () => createAndAddPending?.();
}
