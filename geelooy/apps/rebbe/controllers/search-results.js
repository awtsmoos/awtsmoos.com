//B"H
import { bookmarkResult, bookmarkTrack } from './search-results/bookmarks.js';
import { cacheEvent, cacheTrack } from './search-results/cache.js';
import { downloadAllResults, downloadEvent, downloadSelectedTracks, downloadTrack } from './search-results/downloads.js';
import { loadTracks } from './search-results/loader.js';
import { openResult } from './search-results/navigation.js';
import { addEventToPlaylist, cachePlaylist, downloadPlaylist, removeCachedPlaylist } from './search-results/playlists.js';

/**
 * B"H
 * Public search-result action factory. All old callback keys remain, but each
 * system now lives in its own chamber: loader, navigation, downloads, cache,
 * bookmarks, and playlist bridges.
 * @param {object} app Optional app callbacks for playback and picker flows.
 * @returns {object} Stable callback map consumed by renderers.
 */
export function createSearchResultHandlers(app = {}) {
  return {
    onOpen: openResult,
    onLoadTracks: loadTracks,
    onDownloadAllResults: downloadAllResults,
    onDownloadSelectedTracks: downloadSelectedTracks,
    onDownloadEvent: downloadEvent,
    onCacheEvent: cacheEvent,
    onBookmark: bookmarkResult,
    onDownloadTrack: downloadTrack,
    onCacheTrack: cacheTrack,
    onBookmarkTrack: bookmarkTrack,
    onAddToPlaylist: items => app.onAddToPlaylist?.(items),
    onAddEventToPlaylist: item => app.onAddEventToPlaylist?.(item) || addEventToPlaylist(item, app),
    onPlayEvent: item => app.onPlayEvent?.(item) || openResult(item),
    onPlayTrack: (track, item) => openResult({ ...item, track }),
    onDownloadPlaylist: downloadPlaylist,
    onCachePlaylist: cachePlaylist,
    onRefreshCachedPlaylist: cachePlaylist,
    onRemoveCachedPlaylist: removeCachedPlaylist
  };
}
