//B"H
// ui/browser/folders.js
import { cleanArchiveName } from '../../modules/network/archive.js';

/**
 * B"H
 * Folders are events, not merely doors. Each row now offers the same whole-event
 * powers as search: download as zip, cache all files, and save to bookshelf.
 */
export function renderFolders(folders, onSelect, onAction) {
  const list = document.getElementById('list-folders');
  if (!list) return;
  list.innerHTML = '';
  Object.entries(folders).forEach(([id, folder]) => list.appendChild(folderRow(id, folder, onSelect, onAction)));
}

function folderRow(id, folder, onSelect, onAction) {
  const item = document.createElement('div');
  item.className = 'item folder-item';
  const rawTitle = typeof folder === 'object' && folder.title ? folder.title : folder;
  const title = cleanArchiveName(rawTitle) || rawTitle;
  item.appendChild(label(title));
  item.appendChild(actions(id, rawTitle, title, onAction));
  item.onclick = () => {
    document.querySelectorAll('.folder-item').forEach(row => row.classList.remove('active'));
    item.classList.add('active');
    onSelect(id);
  };
  return item;
}

function label(title) {
  const wrap = document.createElement('div');
  wrap.className = 'folder-label';
  const icon = document.createElement('span');
  icon.className = 'icon';
  icon.textContent = '📂';
  const text = document.createElement('span');
  text.className = 'item-text';
  text.textContent = title;
  text.style.fontFamily = 'monospace';
  wrap.append(icon, document.createTextNode(' '), text);
  return wrap;
}

function actions(id, rawTitle, title, onAction) {
  const wrap = document.createElement('div');
  wrap.className = 'item-actions folder-actions';
  wrap.appendChild(mini('⬇', 'Download this event as ZIP', 'download-event', id, rawTitle, title, onAction));
  wrap.appendChild(mini('⚡', 'Cache all files in this event', 'cache-event', id, rawTitle, title, onAction));
  wrap.appendChild(mini('☆', 'Save this event to bookshelf', 'bookmark-folder', id, rawTitle, title, onAction));
  return wrap;
}

function mini(text, title, action, id, rawTitle, cleanTitle, onAction) {
  const button = document.createElement('button');
  button.className = 'mini-btn';
  button.title = title;
  button.textContent = text;
  button.onclick = event => {
    event.stopPropagation();
    onAction?.(action, { id, rawTitle, title: cleanTitle });
  };
  return button;
}
