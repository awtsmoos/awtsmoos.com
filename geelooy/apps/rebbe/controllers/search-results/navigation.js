//B"H

/**
 * B"H
 * Navigation chamber. A search result becomes a browser URL with year, folder,
 * track, and autoplay, opening the archive corridor without controller clutter.
 * @param {object} item Result or event item.
 * @returns {Promise<void>}
 */
export async function openResult(item) {
  if (!item?.year || !item?.folder) return;
  const url = new URL(location);
  url.searchParams.set('year', String(item.year));
  url.searchParams.set('folder', item.folder);
  url.searchParams.set('track', item.trackIndex || '0');
  url.searchParams.set('autoplay', '1');
  location.href = url.toString();
}
