// B"H
export function h(tag, props = {}, children = []) { return { tag, props, children: Array.isArray(children) ? children : [children] }; }
export function renderBlueprint(node, doc = document) {
    if (typeof node === 'string') return doc.createTextNode(node);
    const el = doc.createElement(node.tag);
    for (const [key, value] of Object.entries(node.props || {})) {
        if (key === 'class') el.className = value;
        else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
        else if (value !== false && value != null) el.setAttribute(key, value === true ? '' : value);
    }
    for (const child of node.children || []) el.appendChild(renderBlueprint(child, doc));
    return el;
}
