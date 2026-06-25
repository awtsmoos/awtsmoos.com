// B"H
/**
 * @module AwtsmoosOsCommands
 * @description Tiny command galaxy helpers; no endpoint assumptions, only UI routing.
 */
const ROUTES = {
  create: '/heichelos/submit', graph: '#awtsmoos-civilization', search: '#awtsmoos-os-command',
  moderate: '#platform-panel', migrate: '#platform-panel', inspect: '#awtsmoos-object-context'
};

export function filterCommands(query = '') {
  const q = query.toLowerCase().trim();
  return Object.entries(ROUTES)
    .filter(([name]) => !q || name.includes(q))
    .map(([name, href]) => ({ name, href, title: titleCase(name) }));
}

export function renderCommandPalette(node, query = '') {
  if (!node) return;
  const items = filterCommands(query);
  node.replaceChildren(...items.map(item => optionNode(node.ownerDocument, item)));
  node.classList.toggle('hidden', !query && !items.length);
}

export function runCommand(name) {
  const href = ROUTES[name];
  if (!href) return false;
  if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  else window.location.href = href;
  return true;
}

function optionNode(document, item) {
  const a = document.createElement('a');
  a.href = item.href;
  a.textContent = item.title;
  a.setAttribute('role', 'option');
  return a;
}

function titleCase(value) { return value.slice(0, 1).toUpperCase() + value.slice(1); }
