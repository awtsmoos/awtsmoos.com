// B"H
/**
 * @file RuntimePath.js
 * @brief Tiny path helpers for virtual provider paths.
 */
export function joinVirtualPath(base = '/', child = '') {
    const left = String(base || '/').replace(/\/+$/, '') || '/';
    const right = String(child || '').replace(/^\/+/, '');
    if (!right) return left;
    return left === '/' ? `/${right}` : `${left}/${right}`;
}

export function parentVirtualPath(path = '/') {
    const clean = String(path || '/').replace(/\/+$/, '') || '/';
    const idx = clean.lastIndexOf('/');
    if (idx <= 0) return '/';
    return clean.slice(0, idx);
}
