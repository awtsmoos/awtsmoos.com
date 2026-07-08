// B"H
/**
 * @module AwtsmoosMailFolders
 * @description Folders, sender categories, sender groups, and search filters built on confirmed GET mail data.
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
export const SENDER_CATEGORIES = Object.freeze([
  { id: 'all', label: '✨ All Senders' }, { id: 'awtsmoos', label: '🪐 Awtsmoos' },
  { id: 'external', label: '🌍 External' }, { id: 'priority', label: '⭐ Priority' },
  { id: 'unread', label: '📩 Unread' }, { id: 'attachments', label: '🔖 Files' }
]);
const TEXT_FIELDS = ['correspondent', 'from', 'to', 'subject', 'snippet', 'content', 'title', 'id'];
export function folderLabel(id) { return MAIL_FOLDERS.find(folder => folder.id === id)?.label || 'Mailbox'; }
export function folderEmpty(id) { return MAIL_FOLDERS.find(folder => folder.id === id)?.empty || 'No transmissions here.'; }
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
export function senderKey(thread = {}) { return String(thread.correspondent || thread.from || thread.to || 'unknown').replace(/@/g, '_at_'); }
export function senderCategoryOf(thread = {}) {
  const text = `${senderKey(thread)} ${thread.from || ''} ${thread.to || ''}`.toLowerCase();
  if (thread.unread || thread.isUnread || thread.read === false) return 'unread';
  if (thread.hasAttachment || thread.attachments?.length || thread.media?.length) return 'attachments';
  if (thread.starred || thread.favorite || folderOf(thread) === 'requests') return 'priority';
  if (text.includes('_at_') || text.includes('@')) return text.includes('awtsmoos') ? 'awtsmoos' : 'external';
  return 'awtsmoos';
}
export function matchesFolder(thread, folderId) { return folderId === 'all' || folderOf(thread) === folderId; }
export function matchesSenderCategory(thread, category = 'all') { return category === 'all' || senderCategoryOf(thread) === category; }
export function matchesSearch(thread, query = '') {
  const q = String(query || '').trim().toLowerCase();
  return !q || TEXT_FIELDS.some(field => String(thread?.[field] || '').toLowerCase().includes(q));
}
export function filterThreads(threads = [], view = 'inbox', query = '', category = 'all') {
  return threads.filter(thread => matchesFolder(thread, view) && matchesSenderCategory(thread, category) && matchesSearch(thread, query));
}
export function folderCounts(threads = []) {
  const counts = Object.fromEntries(MAIL_FOLDERS.map(folder => [folder.id, 0]));
  for (const thread of threads) { counts.all += 1; const folder = folderOf(thread); counts[folder] = (counts[folder] || 0) + 1; }
  return counts;
}
export function categoryCounts(threads = []) {
  const counts = Object.fromEntries(SENDER_CATEGORIES.map(cat => [cat.id, 0]));
  for (const thread of threads) { counts.all += 1; const cat = senderCategoryOf(thread); counts[cat] = (counts[cat] || 0) + 1; }
  return counts;
}
export function groupThreadsBySender(threads = []) {
  const map = new Map();
  for (const thread of threads) { const key = senderKey(thread); if (!map.has(key)) map.set(key, []); map.get(key).push(thread); }
  return [...map.entries()].map(([sender, items]) => ({ sender, items: items.sort((a, b) => (b.timeSent || 0) - (a.timeSent || 0)), latest: Math.max(...items.map(item => item.timeSent || 0)) })).sort((a, b) => b.latest - a.latest);
}
