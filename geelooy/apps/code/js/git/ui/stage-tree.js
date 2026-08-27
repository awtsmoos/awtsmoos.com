// B"H
/**
 * @file stage-tree.js
 * Chapter 8: unstaged and staged files march into directory clans.
 * The Awtsmoos reveals order where flat lists once scattered like sparks in wind.
 */

/**
 * B"H - Builds a directory tree from stage items.
 * @param {Array<object>} items Stage items with path and status.
 * @returns {object} Root tree node.
 */
export function buildStageTree(items) {
    const root = node('', '', 'directory', null);
    for (const item of items || []) addItem(root, item);
    sortTree(root);
    return root;
}

function addItem(root, item) {
    const parts = String(item.path || '').split('/').filter(Boolean);
    let current = root;
    let walk = '';
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        walk = walk ? `${walk}/${part}` : part;
        const kind = i === parts.length - 1 ? 'file' : 'directory';
        if (!current.children.has(part)) current.children.set(part, node(part, walk, kind, item));
        current = current.children.get(part);
        if (kind === 'file') current.item = item;
    }
}

function node(name, path, kind, item) {
    return { name, path, kind, item, children: new Map() };
}

function sortTree(tree) {
    tree.children = new Map([...tree.children].sort((a, b) => {
        const ak = a[1].kind === 'directory' ? 0 : 1;
        const bk = b[1].kind === 'directory' ? 0 : 1;
        return ak - bk || a[0].localeCompare(b[0]);
    }));
    for (const child of tree.children.values()) sortTree(child);
}
