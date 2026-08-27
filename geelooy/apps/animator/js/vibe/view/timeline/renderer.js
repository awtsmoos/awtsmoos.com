// B"H
import { Tabs } from '../../../tabs/index.js';

/** Builds one safely text-bound timeline card for legacy Vibe history. */
export const TimelineRenderer = {
  renderRecord(rec, tab, self) {
    const card = document.createElement('div');
    card.className = 'vibe-manifest-card';
    Object.assign(card.style, { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' });

    const fileCount = rec.changes ? rec.changes.length : 0;
    const header = document.createElement('div');
    Object.assign(header.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' });

    const summary = document.createElement('div');
    const toggle = document.createElement('button');
    toggle.className = 'tl-toggle-files secondary-btn';
    toggle.textContent = `${fileCount} Files Modified ▼`;
    const meta = document.createElement('div');
    meta.textContent = `${new Date(rec.timestamp).toLocaleString()} | ${self._formatBytes(rec.sizeBytes)}`;
    summary.append(toggle, meta);

    const del = document.createElement('button');
    del.className = 'tl-delete icon-button';
    del.title = 'Delete Record';
    del.textContent = '🗑';
    header.append(summary, del);

    const actions = document.createElement('div');
    Object.assign(actions.style, { display: 'flex', gap: '8px' });
    const undo = document.createElement('button');
    undo.className = 'tl-undo secondary-btn';
    undo.textContent = '↶ Revert To Here';
    const redo = document.createElement('button');
    redo.className = 'tl-redo secondary-btn';
    redo.textContent = '↷ Re-apply Changes';
    actions.append(undo, redo);

    const files = document.createElement('div');
    files.className = 'tl-files-list hidden';
    (rec.changes || []).forEach((change, index) => files.appendChild(this._fileRow(change, index)));

    card.append(header, actions, files);
    this._bind(card, rec, tab, self);
    return card;
  },

  _fileRow(change, index) {
    const row = document.createElement('div');
    row.className = 'tl-file-row';
    const name = document.createElement('span');
    name.textContent = change.path?.split('/').pop() || 'file';
    const button = document.createElement('button');
    button.className = 'secondary-btn tl-preview-btn';
    button.dataset.index = String(index);
    button.textContent = 'Preview File';
    row.append(name, button);
    return row;
  },

  _bind(card, rec, tab, self) {
    card.querySelector('.tl-toggle-files').onclick = () => card.querySelector('.tl-files-list').classList.toggle('hidden');
    card.querySelectorAll('.tl-preview-btn').forEach(btn => btn.onclick = event => {
      const c = rec.changes[event.target.dataset.index];
      Tabs.create({ name: `[Preview] ${c.path.split('/').pop()}`, path: c.path, kind: 'file', type: 'temp', workspaceId: tab.item.workspaceId, content: c.newContent || '// Deleted in this state' }, false, false, true);
    });
    card.querySelector('.tl-undo').onclick = () => self.handleUndo(rec, tab);
    card.querySelector('.tl-redo').onclick = () => self.handleRedo(rec, tab);
    card.querySelector('.tl-delete').onclick = () => self.handleDelete(rec, tab);
  }
};
