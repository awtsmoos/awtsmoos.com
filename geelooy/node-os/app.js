// B"H
/**
 * @module NodeOsApp
 * @description
 * Chapter 196: The filesystem browser becomes a polished social operating
 * system view: breadcrumb travel, asset previews, child cards, metadata panels,
 * and a warm mobile-first palace for every mounted social node.
 */

const params = new URLSearchParams(location.search);
const state = { path: params.get('path') || '/', node: null, children: [], error: '' };

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  Object.entries(options.attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
  Object.entries(options.on || {}).forEach(([key, value]) => node.addEventListener(key, value));
  children.filter(Boolean).forEach(child => node.append(child));
  return node;
}

async function json(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!data.success) throw new Error(data.error?.message || JSON.stringify(data));
  return data.success;
}

function pathParts(path) {
  const parts = String(path || '/').split('/').filter(Boolean);
  return ['/', ...parts.map((_, index) => '/' + parts.slice(0, index + 1).join('/'))];
}

async function openPath(path) {
  state.error = '';
  state.path = path || '/';
  state.node = await json(`/api/social/node-os/path?path=${encodeURIComponent(state.path)}`);
  try { state.children = await json(`/api/social/node-os/nodes/${encodeURIComponent(state.node.id)}/children`); }
  catch { state.children = []; }
  history.replaceState(null, '', `/node-os/?path=${encodeURIComponent(state.path)}`);
  render();
}

function breadcrumbs() {
  return el('div', { className: 'node-breadcrumbs' }, pathParts(state.path).map(path => el('button', { text: path === '/' ? 'root' : path.split('/').pop(), on: { click: () => openPath(path).catch(showError) } })));
}

function childCard(child) {
  const label = (child.kind || 'n').slice(0, 1).toUpperCase();
  return el('a', { className: 'node-child', attrs: { href: `/node-os/?path=${encodeURIComponent(child.path || '')}` }, on: { click: event => { event.preventDefault(); if (child.path) openPath(child.path).catch(showError); } } }, [
    el('span', { className: 'node-icon', text: label }),
    el('span', {}, [el('span', { className: 'node-child-title', text: child.title || child.id || 'Node' }), el('span', { className: 'node-child-path', text: child.path || child.kind || '' })]),
    el('span', { className: 'node-child-arrow', text: '›' })
  ]);
}

function detail(label, value) {
  return el('div', { className: 'node-detail' }, [el('b', { text: label }), el('span', { text: value || '—' })]);
}

function preview(node) {
  if (!node.publicPath) return null;
  const isImage = (node.mime || '').startsWith('image') || /\.(png|jpe?g|gif|webp|svg)$/i.test(node.publicPath);
  return el('div', { className: 'node-preview' }, [isImage ? el('img', { attrs: { src: node.publicPath, alt: node.title || node.id, loading: 'lazy' } }) : el('a', { text: 'Open asset', attrs: { href: node.publicPath } })]);
}

function nodeCard() {
  const node = state.node;
  return el('section', { className: 'node-card' }, [
    el('p', { className: 'node-os-kicker', text: node.kind || 'node' }),
    el('h2', { text: node.title || node.id }),
    el('div', { className: 'node-meta' }, [node.kind, node.mime, node.source?.entityType, node.source?.aliasId].filter(Boolean).map(value => el('span', { className: 'node-pill', text: value }))),
    el('p', { text: node.content || node.publicPath || 'This node is a chamber of structure more than plain text.' }),
    preview(node),
    el('div', { className: 'node-detail-grid' }, [detail('Path', node.path), detail('Node ID', node.id), detail('Source', sourceLabel(node)), detail('Size', node.size ? `${node.size} bytes` : '')])
  ]);
}

function sourceLabel(node) {
  const source = node.source || {};
  return source.entityId ? `${source.entityType}/${source.entityId}` : source.assetId ? `asset/${source.assetId}` : source.legacy ? `legacy/${source.heichelId}/${source.postId}` : '';
}

function sideCard() {
  return el('aside', { className: 'node-card' }, [
    el('p', { className: 'node-os-kicker', text: 'Current vessel' }),
    el('h2', { text: 'Metadata' }),
    el('div', { className: 'node-json', text: JSON.stringify(state.node?.meta || state.node || {}, null, 2) })
  ]);
}

function hero() {
  return el('section', { className: 'node-os-hero' }, [
    el('p', { className: 'node-os-kicker', text: 'B"H NODE OS' }),
    el('h1', { text: 'Social Filesystem' }),
    el('p', { text: 'Open Heichelos, posts, verses, assets, comments, and legacy shadows as one mounted operating system.' }),
    pathbar(),
    breadcrumbs(),
    el('div', { className: 'node-os-actions' }, [
      el('a', { text: 'Entity View', attrs: { href: '/entity-view/' } }),
      el('a', { text: 'Comments', attrs: { href: '/comment-thread/' } })
    ])
  ]);
}

function render() {
  document.querySelector('#node-os-root').replaceChildren(el('main', { className: 'node-os-shell' }, [
    hero(),
    state.error ? el('section', { className: 'node-os-empty', text: state.error }) : null,
    el('section', { className: 'node-os-layout' }, [
      el('div', { className: 'node-os-stack' }, [state.node ? nodeCard() : el('section', { className: 'node-card', text: 'Open a path to reveal the node.' }), childrenCard()]),
      state.node ? sideCard() : null
    ])
  ]));
}

function childrenCard() {
  return el('section', { className: 'node-card' }, [el('p', { className: 'node-os-kicker', text: 'Children' }), el('h2', { text: `${state.children.length} mounted branches` }), state.children.length ? el('div', { className: 'node-children' }, state.children.map(childCard)) : el('div', { className: 'node-os-empty', text: 'No children mounted yet.' })]);
}

function pathbar() {
  const input = el('input', { attrs: { value: state.path, placeholder: '/Heichelos/...' } });
  return el('form', { className: 'node-os-pathbar', on: { submit: event => { event.preventDefault(); openPath(input.value).catch(showError); } } }, [input, el('button', { text: 'Open' })]);
}

function showError(error) { state.error = error.message; render(); }

render();
if (state.path !== '/') openPath(state.path).catch(showError);
