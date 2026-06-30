//B"H

/**
 * B"H
 * Cache mark illuminator. A cached file receives a cyan dot, a tiny sign that
 * the sound has descended from remote cloud into local vessel.
 * @param {object} track Track row.
 * @param {HTMLElement} item Track DOM node.
 * @param {Function} checkStatus Async cache status checker.
 * @returns {void}
 */
export function markCacheStatus(track, item, checkStatus) {
  checkStatus(track.path).then(cached => {
    const status = item.querySelector('.status-slot');
    const cache = item.querySelector('.mini-cache');
    if (status) status.innerHTML = cached ? '<span class="cached-dot">●</span>' : '';
    if (cache && cached) cache.classList.add('saved');
  });
}
