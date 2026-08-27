
// B"H
export function normalizePath(path = '/') {
    const text = String(path || '/').replaceAll('\\', '/').replace(/\/+/g, '/');
    return text.startsWith('/') ? text : `/${text}`;
}

export function joinPath(base = '/', name = '') {
    const left = normalizePath(base).replace(/\/+$/, '');
    return normalizePath(`${left}/${name}`);
}

export function parentPath(path = '/') {
    const clean = normalizePath(path);
    if (clean === '/') return '/';
    return clean.slice(0, clean.lastIndexOf('/')) || '/';
}
