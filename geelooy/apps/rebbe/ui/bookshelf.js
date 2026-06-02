//B"H

/**
 * B"H
 * The bookshelf is a small glowing aron: tracks and folders the listener refuses
 * to let drift back into the sea. It renders only DOM already saved in IndexedDB.
 * @param {object[]} bookmarks Saved entries.
 * @param {object} handlers UI callbacks.
 */
export function renderBookshelf(bookmarks = [], handlers = {}) {
  const root = document.getElementById('bookshelf-list');
  if (!root) return;
  root.innerHTML = '';
  root.appendChild(styles());
  if (!bookmarks.length) {
    root.innerHTML += '<div class="bookshelf-empty">NO BOOKMARKS YET</div>';
    return;
  }
  const groups = groupBookmarks(bookmarks);
  Object.entries(groups).forEach(([type, items]) => root.appendChild(section(type, items, handlers)));
}

function section(type, items, handlers) {
  const wrap = document.createElement('section');
  wrap.className = 'book-shelf-section';
  wrap.innerHTML = `<h3>${type === 'folder' ? 'FOLDERS' : 'SICHOS'}</h3>`;
  const rail = document.createElement('div');
  rail.className = 'book-rail';
  items.forEach(item => rail.appendChild(card(item, handlers)));
  wrap.appendChild(rail);
  return wrap;
}

function card(item, handlers) {
  const button = document.createElement('article');
  button.className = `book-card book-${item.type}`;
  button.innerHTML = `
    <div class="book-spine">${item.type === 'folder' ? '📁' : '🔖'}</div>
    <div class="book-body">
      <div class="book-year">${item.year || '----'}</div>
      <div class="book-title"></div>
      <div class="book-meta"></div>
      <div class="book-actions">
        <button class="modal-btn book-open">OPEN</button>
        <button class="modal-btn danger book-remove">REMOVE</button>
      </div>
    </div>`;
  button.querySelector('.book-title').textContent = item.title || item.folder || 'Untitled';
  button.querySelector('.book-meta').textContent = item.folder || item.path || '';
  button.querySelector('.book-open').onclick = () => handlers.onOpen?.(item);
  button.querySelector('.book-remove').onclick = () => handlers.onRemove?.(item.id);
  return button;
}

function groupBookmarks(bookmarks) {
  return bookmarks.reduce((groups, item) => {
    const key = item.type === 'folder' ? 'folder' : 'track';
    groups[key] ||= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function styles() {
  const style = document.createElement('style');
  style.textContent = `.book-shelf-section{margin-bottom:22px}.book-shelf-section h3{color:var(--c-cyan);letter-spacing:4px;border-bottom:1px solid #244;padding-bottom:8px}.book-rail{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}.book-card{min-height:190px;border:1px solid #244;background:linear-gradient(135deg,rgba(0,243,255,.16),rgba(0,0,0,.9));box-shadow:0 0 20px rgba(0,243,255,.08);display:flex;overflow:hidden}.book-folder{background:linear-gradient(135deg,rgba(255,204,0,.18),rgba(0,0,0,.9))}.book-spine{width:42px;background:#020808;border-right:1px solid #244;display:flex;align-items:center;justify-content:center;font-size:24px}.book-body{padding:14px;display:flex;flex-direction:column;gap:8px;min-width:0;flex:1}.book-year{color:var(--c-yellow);font-weight:900}.book-title{font-weight:900;color:#fff;line-height:1.25}.book-meta{font-size:12px;color:#9ab;line-height:1.3;word-break:break-word}.book-actions{margin-top:auto;display:flex;gap:8px;flex-wrap:wrap}.book-actions .modal-btn{padding:8px 10px;font-size:11px}.bookshelf-empty{padding:40px;text-align:center;color:#778;letter-spacing:4px;font-weight:900;border:1px dashed #244}`;
  return style;
}
