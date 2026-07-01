// B"H
/**
 * @module AwtsmoosMailFolders
 * @description
 * Chapter 704: The inbox becomes a city of gates. Nothing here invents a new
 * server covenant; it only reads fields already returned by the mail river and
 * lets the UI sort the sparks into folders, search, and counts.
 */
export const MAIL_FOLDERS = Object.freeze([
  { id: 'inbox', label: 'Inbox', empty: 'No inbox transmissions.' },
  { id: 'sent', label: 'Sent', empty: 'No sent transmissions yet.' },
  { id: 'drafts', label: 'Drafts', empty: 'No drafts are saved here yet.' },
  { id: 'archive', label: 'Archive', empty: 'No archived transmissions.' },
  { id: 'starred', label: 'Starred', empty: 'No starred transmissions.' },
  { id: 'trash', label: 'Trash', empty: 'No trashed transmissions.' },
  { id: 'requests', label: 'Requests', empty: 'No request transmissions.' },
  { id: 'all', label: 'All Mail', empty: 'No transmissions found.' }
]);

const TEXT_FIELDS = ['correspondent', 'from', 'to', 'subject', 'snippet', 'content', 'title', 'id'];

export function folderLabel(id) {
  return MAIL_FOLDERS.find(folder => folder.id === id)?.label || 'Mailbox';
}

export function folderEmpty(id) {
  return MAIL_FOLDERS.find(folder => folder.id === id)?.empty || 'No transmissions here.';
}

export function folderOf(thread = {}) {
  const raw = String(thread.folder || thread.mailbox || thread.view || thread.status || '').toLowerCase();
  const labels = Array.isArray(thread.labels) ? thread.labels.map(label => String(label).toLowerCase()) : [];
  if (thread.deleted || thread.trashed || raw.includes('trash')) return 'trash';
  if (thread.draft || thread.isDraft || raw.includes('draft')) return 'drafts';
  if (thread.starred || thread.favorite || labels.includes('starred')) return 'starred';
  if (thread.archived || raw.includes('archive')) return 'archive';
  if (thread.sent || raw === 'sent' || raw.includes('sent')) return 'sent';
  if (raw === 'request' || raw === 'requests') return 'requests';
  return 'inbox';
}

export function matchesFolder(thread, folderId) {
  if (folderId === 'all') return true;
  return folderOf(thread) === folderId;
}

export function matchesSearch(thread, query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return TEXT_FIELDS.some(field => String(thread?.[field] || '').toLowerCase().includes(q));
}

export function filterThreads(threads = [], view = 'inbox', query = '') {
  return threads.filter(thread => matchesFolder(thread, view) && matchesSearch(thread, query));
}

export function folderCounts(threads = []) {
  const counts = Object.fromEntries(MAIL_FOLDERS.map(folder => [folder.id, 0]));
  for (const thread of threads) {
    counts.all += 1;
    const folder = folderOf(thread);
    counts[folder] = (counts[folder] || 0) + 1;
  }
  return counts;
}
