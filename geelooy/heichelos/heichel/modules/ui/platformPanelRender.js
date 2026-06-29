// B"H
/**
 * @module platformPanelRender
 * @description Small DOM render vessels for the Awtsmoos platform panel.
 */

export function failAction(ctx, title, message) {
  renderFailure(ctx, title, message);
  setStatus(ctx, title.toLowerCase());
  return false;
}

export function renderFailure(ctx, title, message) {
  const output = ctx.panel.querySelector('[data-platform-output]');
  output.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = title;
  const body = document.createElement('p');
  body.className = 'awtsmoos-platform-error';
  body.textContent = message;
  output.appendChild(heading);
  output.appendChild(body);
}

export function renderList(ctx, title, items) {
  const output = ctx.panel.querySelector('[data-platform-output]');
  output.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = `${title} (${items.length})`;
  output.appendChild(heading);
  const list = document.createElement('div');
  list.className = 'awtsmoos-platform-list';
  if (!items.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Nothing to show yet.';
    list.appendChild(empty);
  }
  items.slice(0, 20).forEach(item => {
    const card = document.createElement('article');
    card.className = 'awtsmoos-platform-card';
    card.textContent = item.title || item.id || item.postId || item.type || JSON.stringify(item).slice(0, 160);
    list.appendChild(card);
  });
  output.appendChild(list);
}

export function renderDb(ctx, stats, snapshot) {
  const items = stats.map(stat => ({ title: `${stat.shard}: ${stat.records} records / ${stat.logicalKeys} keys` }));
  items.push({ title: `manifests: ${snapshot.manifests || 0}` });
  items.push({ title: `migrations: ${snapshot.migrations || 0}` });
  renderList(ctx, 'DB sharing', items);
}

export function renderOps(ctx, queues, migration) {
  const queueCount = Array.isArray(queues) ? queues.length : Object.keys(queues || {}).length;
  const found = migration?.found ?? migration?.total ?? migration?.items?.length ?? 0;
  renderList(ctx, 'Ops', [
    { title: `moderation queues: ${queueCount}` },
    { title: `migration dry-run candidates: ${found}` }
  ]);
}

export function setStatus(ctx, text) {
  const status = ctx.panel.querySelector('[data-platform-status]');
  if (status) status.textContent = text;
}

export function namedItems(label, items = []) {
  return (items || []).map(item => ({
    ...item,
    title: `${label}: ${item.title || item.id || item.postId || item.type || JSON.stringify(item).slice(0, 100)}`
  }));
}
