// B"H
/**
 * @module EntityUniverseView
 * @description
 * Chapter 197: A universal viewer for every entity type, now styled as a clear
 * operating-system chamber: recursive content, children, edges, DNA, snapshot,
 * fork, comments, and Node OS travel in one immense interface.
 */

const params = new URLSearchParams(location.search);
const state = { type: params.get('type') || 'post', id: params.get('id') || '', entity: null, children: [], edges: [], dna: null, error: '' };

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

async function getJson(url) {
  const response = await fetch(url);
  const json = await response.json();
  if (!json.success) throw new Error(json.error?.message || JSON.stringify(json));
  return json.success;
}

function nodeView(node) {
  return el('article', { className: 'entity-node' }, [
    el('h3', { text: node.title || node.id }),
    el('p', { text: node.content || node.html || 'A silent node waiting for words.' }),
    el('div', { className: 'entity-pill-row' }, [node.type, node.id, ...(node.assets || []).map(asset => asset.type || asset.id || 'asset')].filter(Boolean).map(value => el('span', { className: 'entity-pill', text: value }))),
    el('div', { className: 'entity-node-children' }, (node.children || []).map(nodeView))
  ]);
}

function entityCard(entity) {
  return el('section', { className: 'entity-card' }, [
    el('p', { className: 'entity-pill-row' }, [el('span', { className: 'entity-pill', text: entity.type }), el('span', { className: 'entity-pill', text: entity.mode }), el('span', { className: 'entity-pill', text: entity.aliasId || 'no alias' })]),
    el('h2', { text: entity.title || entity.id }),
    el('p', { text: entity.summary || entity.rootContent || 'This entity is mostly structure.' }),
    ...((entity.nodes || []).map(nodeView))
  ]);
}

function rowCard(row) {
  const title = row.title || row.id || row.kind || row.type || row.entityId || 'Edge';
  const subtitle = row.path || row.note || row.content || JSON.stringify(row.from || row.to || row).slice(0, 180);
  return el('div', { className: 'entity-graph-row' }, [el('span', { className: 'entity-graph-dot', text: String(title).slice(0, 1).toUpperCase() }), el('span', {}, [el('span', { className: 'entity-graph-title', text: title }), el('span', { className: 'entity-graph-sub', text: subtitle })])]);
}

function listCard(title, rows) {
  return el('section', { className: 'entity-card' }, [
    el('p', { className: 'entity-pill-row' }, [el('span', { className: 'entity-pill', text: `${rows.length} items` })]),
    el('h2', { text: title }),
    el('div', { className: 'entity-grid' }, rows.length ? rows.map(rowCard) : [el('p', { text: 'Nothing here yet.' })])
  ]);
}

function dnaCard() {
  return el('section', { className: 'entity-card' }, [
    el('p', { className: 'entity-pill-row' }, [el('span', { className: 'entity-pill', text: 'DNA' })]),
    el('h2', { text: 'Entity DNA' }),
    el('pre', { text: JSON.stringify(state.dna || {}, null, 2) })
  ]);
}

function hero() {
  const entity = state.entity;
  return el('section', { className: 'entity-hero' }, [
    el('p', { text: 'B"H ENTITY UNIVERSE' }),
    el('h1', { text: entity?.title || `${state.type}/${state.id}` }),
    el('p', { text: 'Every object can be a post, question, answer, asset, mail thread, project, or world with children, edges, comments, snapshots, and forks.' }),
    el('div', { className: 'entity-actions' }, [
      el('button', { text: 'Snapshot', on: { click: snapshot } }),
      el('button', { text: 'Fork', on: { click: fork } }),
      el('a', { text: 'Comments', attrs: { href: `/comment-thread/?heichel=${encodeURIComponent(entity?.heichelId || '')}&post=${encodeURIComponent(entity?.id || state.id)}` } }),
      el('a', { text: 'Node OS', attrs: { href: `/node-os/?path=${encodeURIComponent(`/Heichelos/${entity?.heichelId || 'global'}/Series/${entity?.seriesId || 'root'}/Entities/${entity?.type || state.type}/${entity?.id || state.id}`)}` } })
    ])
  ]);
}

async function snapshot() {
  await fetch(`/api/social/entities/universe/${state.type}/${state.id}/snapshot`, { method: 'POST', body: new URLSearchParams({ label: 'UI snapshot' }) });
  await load();
}

async function fork() {
  const title = prompt('Fork title?', `${state.entity.title} Fork`) || `${state.entity.title} Fork`;
  await fetch(`/api/social/entities/universe/${state.type}/${state.id}/fork`, { method: 'POST', body: new URLSearchParams({ title, aliasId: state.entity.aliasId || '' }) });
  await load();
}

async function load() {
  state.error = '';
  if (!state.id) {
    const entities = await getJson('/api/social/entities/universe?type=post');
    state.entity = entities[0] || null;
    if (state.entity) { state.type = state.entity.type; state.id = state.entity.id; }
  }
  if (state.id) {
    state.entity = await getJson(`/api/social/entities/universe/${state.type}/${state.id}`);
    state.children = await getJson(`/api/social/entities/universe/${state.type}/${state.id}/children`);
    state.edges = await getJson(`/api/social/entities/universe/${state.type}/${state.id}/edges`);
    state.dna = await getJson(`/api/social/entities/universe/${state.type}/${state.id}/dna`);
  }
  render();
}

function render() {
  const root = document.querySelector('#entity-root');
  if (state.error) return root.replaceChildren(el('main', { className: 'entity-shell' }, [el('section', { className: 'entity-empty', text: state.error })]));
  if (!state.entity) return root.replaceChildren(el('main', { className: 'entity-shell' }, [el('section', { className: 'entity-hero', html: '<h1>No entity yet</h1>' })]));
  root.replaceChildren(el('main', { className: 'entity-shell' }, [hero(), el('section', { className: 'entity-layout' }, [el('div', { className: 'entity-grid' }, [entityCard(state.entity), listCard('Children', state.children), listCard('Edges', state.edges)]), dnaCard()]) ]));
}

load().catch(error => { state.error = error.message; render(); });
