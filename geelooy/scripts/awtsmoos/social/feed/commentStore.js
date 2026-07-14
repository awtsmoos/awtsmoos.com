// B"H
/** Local fallback comments shaped like the real rich comment tree. */
const KEY = 'geelooy-feed-viewer-comments';
export function readComments(objectId, storage = localStorage) {
  const state = readState(storage);
  return state[objectId] || sampleComments(objectId);
}
export function addComment(objectId, text, storage = localStorage, meta = {}) {
  const state = readState(storage);
  const comment = { id:`local-${Date.now()}`, author:'You', text:String(text || '').trim(), created:'now', verseSection:meta.verseSection || 'root', subsectionId:meta.subsectionId || '', parentId:meta.parentId || '', parentSectionId:meta.parentSectionId || '' };
  if (!comment.text) return readComments(objectId, storage);
  state[objectId] = [...readComments(objectId, storage), comment];
  storage.setItem(KEY, JSON.stringify(state));
  return state[objectId];
}
function readState(storage) { try { return JSON.parse(storage.getItem(KEY) || '{}'); } catch { return {}; } }
function sampleComments(objectId) {
  return [
    { id:`${objectId}-c1`, author:'Campus Bot', text:'Following this. Drop updates here.', created:'2m', verseSection:'root' },
    { id:`${objectId}-c2`, author:'Study Buddy', text:'Can someone pin the exact room or time?', created:'1m', verseSection:'verse-1' }
  ];
}
