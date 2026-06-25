// B"H
/**
 * @module platformPanelRender
 * @description DOM render vessels for the AwtsmoosDB platform panel.
 */

export function failAction(ctx, title, message) {
  renderFailure(ctx, title, message);
  setStatus(ctx, title.toLowerCase());
  return false;
}

export function renderFailure(ctx, title, message) {
  const output = outputOf(ctx);
  output.replaceChildren();
  output.appendChild(el('h3', {}, title));
  output.appendChild(el('p', { className: 'awtsmoos-platform-error' }, message));
}

export function renderList(ctx, title, items = []) {
  const output = outputOf(ctx);
  output.replaceChildren();
  output.appendChild(el('h3', {}, `${title} (${items.length})`));
  const list = el('div', { className: 'awtsmoos-platform-list' });
  if (!items.length) list.appendChild(el('p', { className: 'awtsmoos-platform-empty' }, 'Nothing to show yet.'));
  items.slice(0, 20).forEach(item => list.appendChild(renderCard(item)));
  output.appendChild(list);
}

export function renderCivilization(ctx, { state = {}, feed = [], subscriptions = [], entity = null } = {}) {
  const output = outputOf(ctx);
  output.replaceChildren();
  output.appendChild(el('h3', {}, 'Civilization pulse'));
  const metrics = el('div', { className: 'awtsmoos-platform-metrics' });
  metrics.appendChild(metric('events', state.eventCount ?? state.events ?? feed.length));
  metrics.appendChild(metric('subscriptions', state.subscriptionCount ?? subscriptions.length));
  metrics.appendChild(metric('entity events', entity?.eventCount ?? 0));
  metrics.appendChild(metric('engine', state.engine || 'AwtsmoosDB'));
  output.appendChild(metrics);
  const note = el('p', { className: 'awtsmoos-platform-intro' }, 'The frontend is now reading the real civilization routes: state, alias feed, subscriptions, and entity state.');
  output.appendChild(note);
  const grid = el('div', { className: 'awtsmoos-platform-sections' });
  grid.appendChild(section('Feed', feed));
  grid.appendChild(section('Subscriptions', subscriptions));
  grid.appendChild(section('Entity state', entity ? [entity.lastEvent || entity] : []));
  output.appendChild(grid);
}

export function renderDb(ctx, stats, snapshot) {
  const items = stats.map(stat => ({
    title: `${stat.shard}: ${stat.records} records / ${stat.logicalKeys} keys`,
    kind: stat.engine || 'AwtsmoosDB',
    meta: stat.byType || {}
  }));
  items.push({ title: `manifests: ${snapshot.manifests || 0}`, kind: 'meta' });
  items.push({ title: `migrations: ${snapshot.migrations || 0}`, kind: 'meta' });
  renderList(ctx, 'AwtsmoosDB shards', items);
}

export function renderOps(ctx, queues, migration) {
  const queueCount = Array.isArray(queues) ? queues.length : Object.keys(queues || {}).length;
  const found = migration?.found ?? migration?.total ?? migration?.items?.length ?? 0;
  renderList(ctx, 'Ops', [
    { title: `moderation queues: ${queueCount}`, kind: 'moderation' },
    { title: `migration dry-run candidates: ${found}`, kind: 'migration' }
  ]);
}

export function setStatus(ctx, text) {
  const status = ctx.panel.querySelector('[data-platform-status]');
  if (status) status.textContent = text;
}

export function namedItems(label, items = []) {
  return (items || []).map(item => ({
    ...item,
    kind: label,
    title: `${label}: ${item.title || item.id || item.postId || item.type || stringify(item, 100)}`
  }));
}

function section(title, items = []) {
  const block = el('section', { className: 'awtsmoos-platform-section' });
  block.appendChild(el('h4', {}, `${title} (${items.length})`));
  const list = el('div', { className: 'awtsmoos-platform-list' });
  if (!items.length) list.appendChild(el('p', { className: 'awtsmoos-platform-empty' }, 'No records yet.'));
  items.slice(0, 8).forEach(item => list.appendChild(renderCard(item)));
  block.appendChild(list);
  return block;
}

function renderCard(item = {}) {
  const card = el('article', { className: 'awtsmoos-platform-card' });
  const title = item.title || item.id || item.postId || item.type || item.subject || stringify(item, 120);
  card.appendChild(el('strong', {}, title));
  const tags = compactTags(item);
  if (tags.length) {
    const row = el('div', { className: 'awtsmoos-platform-tags' });
    tags.forEach(tag => row.appendChild(el('span', {}, tag)));
    card.appendChild(row);
  }
  const detail = detailText(item);
  if (detail) card.appendChild(el('small', {}, detail));
  return card;
}

function compactTags(item) {
  return [item.kind, item.recordType, item.type, item.engine, item.label]
    .filter(Boolean)
    .map(value => String(value).slice(0, 32))
    .slice(0, 4);
}

function detailText(item) {
  const meta = item.meta || item.payload || item.entity || item.target || null;
  if (!meta) return '';
  return stringify(meta, 180);
}

function metric(label, value) {
  const box = el('div', { className: 'awtsmoos-platform-metric' });
  box.appendChild(el('strong', {}, String(value ?? 0)));
  box.appendChild(el('span', {}, label));
  return box;
}

function outputOf(ctx) {
  return ctx.panel.querySelector('[data-platform-output]');
}

function el(tag, props = {}, text = '') {
  const node = document.createElement(tag);
  Object.assign(node, props);
  if (text !== '') node.textContent = text;
  return node;
}

function stringify(value, limit) {
  try { return JSON.stringify(value).slice(0, limit); } catch { return String(value).slice(0, limit); }
}
