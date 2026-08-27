//B"H
// modules/playlist/model.js

export function normalizePlaylistItem(item = {}) {
  const track = item.track || (item.type === 'track' ? item : null);
  const year = text(item.year ?? track?.year);
  const folder = text(item.folder ?? track?.folder);
  const title = text(item.title || item.name || track?.title || folder || year || 'Untitled');
  const path = text(item.path || track?.path);
  const url = text(item.url || track?.url);
  const fallbackUrls = unique([...(asArray(item.fallbackUrls)), ...(asArray(track?.fallbackUrls)), url].filter(Boolean));
  const oldFolderOnly = !path && !url && Boolean(year || folder);
  return {
    type: text(item.type || (oldFolderOnly ? 'folder' : 'track')),
    title,
    year,
    folder,
    path,
    url,
    fallbackUrls,
    duration: Math.max(0, Number(item.duration ?? track?.duration ?? 0) || 0),
    artwork: text(item.artwork || track?.artwork),
    metadata: {
      ...(item.metadata || {}),
      addedAt: item.addedAt || item.metadata?.addedAt || Date.now(),
      track: track || item.metadata?.track || null,
      event: item.event || item.metadata?.event || null,
      recovery: oldFolderOnly ? { needsExpansion: true, year, folder } : item.metadata?.recovery || null
    }
  };
}

export function normalizePlaylistItems(items = []) {
  return items.filter(Boolean).map(normalizePlaylistItem);
}

export function playlistItemKey(item = {}) {
  return item.path || item.url || `${item.type || 'track'}:${item.year || ''}:${item.folder || ''}:${item.title || ''}`;
}

export function playlistStatsSnapshot(playlist = {}) {
  const items = playlist.items || [];
  return {
    itemCount: items.length,
    duration: items.reduce((sum, item) => sum + (Number(item.duration) || 0), 0),
    recoverableCount: items.filter(item => item.metadata?.recovery?.needsExpansion).length,
    playableCount: items.filter(item => item.path || item.url || item.fallbackUrls?.length).length
  };
}

export function unique(items = []) {
  return [...new Set(items.filter(Boolean).map(String))];
}

function text(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function asArray(value) { return Array.isArray(value) ? value : value ? [value] : []; }
