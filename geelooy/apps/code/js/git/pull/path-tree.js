// B"H
/**
 * @file path-tree.js
 * Chapter 4: paths gather like sparks into branches, branches into a tree.
 * The Awtsmoos lets each directory become a gate that can open for its children.
 */

/**
 * B"H - Creates a collapsible-ready tree from changed file paths.
 * @param {object} summary Added, modified, deleted path arrays.
 * @returns {object} Root node containing nested directories and files.
 */
export function buildChangeTree(summary) {
    const root = makeNode('', '', 'directory', 'root');
    for (const status of ['added', 'modified', 'deleted']) {
        for (const path of summary[status] || []) addPath(root, path, status);
    }
    sortNode(root);
    return root;
}

function addPath(root, path, status) {
    const parts = String(path || '').split('/').filter(Boolean);
    let node = root;
    let walk = '';
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        walk = walk ? `${walk}/${part}` : part;
        const kind = i === parts.length - 1 ? 'file' : 'directory';
        if (!node.children.has(part)) node.children.set(part, makeNode(part, walk, kind, status));
        node = node.children.get(part);
        if (kind === 'file') node.status = status;
    }
}

function makeNode(name, path, kind, status) {
    return { name, path, kind, status, children: new Map() };
}

function sortNode(node) {
    node.children = new Map([...node.children].sort((a, b) => {
        const ak = a[1].kind === 'directory' ? 0 : 1;
        const bk = b[1].kind === 'directory' ? 0 : 1;
        return ak - bk || a[0].localeCompare(b[0]);
    }));
    for (const child of node.children.values()) sortNode(child);
}

/**
 * B"H - Flattens selected checked inputs into exact file paths.
 * @param {HTMLElement} rootElement Element containing pull checkboxes.
 * @returns {Set<string>} Selected file paths.
 */
export function collectSelectedPullPaths(rootElement) {
    const paths = new Set();
    rootElement.querySelectorAll('input[data-pull-file]:checked').forEach(input => {
        paths.add(input.dataset.pullFile);
    });
    return paths;
}
