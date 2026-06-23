/* B"H
SearchEngine hears names, kinds, URIs, tags, and metadata keys/values. The bin
cannot relink what it cannot find, so search must include the labels too.
*/
export function createSearchEngine(input = {}) { return { kind:'SearchEngine', indexer:input.indexer || null }; }
export function searchAssets(assets = [], query = '') {
  const q = query.trim().toLowerCase();
  if (!q) return assets;
  return assets.filter(asset => searchableText(asset).includes(q));
}
export function filterOffline(assets = [], offline = true) { return assets.filter(asset => !!asset.offline === offline); }
export function searchableText(asset = {}) {
  const metadata = asset.metadata || {};
  return [asset.name, asset.mediaKind, asset.uri, ...(asset.tags || []), ...Object.keys(metadata), ...Object.values(metadata)].join(' ').toLowerCase();
}
