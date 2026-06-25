// B"H
/**
 * @module HeichelOsWorldPanel
 * @description
 * Phase 6: every Heichel becomes a small operating system. This module renders
 * the living districts without owning storage: Overview, Timeline, Series,
 * Knowledge, People, Assets, Events, Moderation, Graph, and Storage.
 */
const DISTRICTS = [
  ['overview', 'Overview'], ['timeline', 'Timeline'], ['series', 'Series'],
  ['knowledge', 'Knowledge'], ['people', 'People'], ['assets', 'Assets'],
  ['events', 'Events'], ['moderation', 'Moderation'], ['graph', 'Graph'], ['storage', 'Storage']
];

export function heichelWorldPanel(actions = {}) {
  return {
    tag: 'section',
    attr: { class: 'heichel-os-world-panel', 'aria-label': 'Heichel operating system districts' },
    children: [districtDock(actions), statusGrid(), districtViewport()]
  };
}

export function renderHeichelWorldState({ heichel = {}, content = {}, ownsIt = false, currentSeries = 'root' } = {}) {
  const root = document.querySelector('[data-heichel-os-world]');
  if (!root) return;
  const counts = {
    posts: count(content.posts),
    series: count(content.subSeries),
    mode: ownsIt ? 'owner' : 'visitor',
    currentSeries
  };
  root.querySelector('[data-heichel-os-name]').textContent = heichel.name || heichel.title || 'Living Heichel';
  root.querySelector('[data-heichel-os-desc]').textContent = heichel.description || 'Objects, graph, events, and projections are loading from the live runtime.';
  root.querySelector('[data-heichel-os-count="posts"]').textContent = counts.posts;
  root.querySelector('[data-heichel-os-count="series"]').textContent = counts.series;
  root.querySelector('[data-heichel-os-count="mode"]').textContent = counts.mode;
  root.querySelector('[data-heichel-os-count="currentSeries"]').textContent = counts.currentSeries;
}

export function activateDistrict(name = 'overview') {
  const root = document.querySelector('[data-heichel-os-world]');
  if (!root) return;
  root.querySelectorAll('[data-heichel-district]').forEach(button => {
    button.classList.toggle('active', button.dataset.heichelDistrict === name);
  });
  const title = root.querySelector('[data-heichel-district-title]');
  const body = root.querySelector('[data-heichel-district-body]');
  if (!title || !body) return;
  title.textContent = districtTitle(name);
  body.replaceChildren(...districtCopy(name).map(line => paragraph(line)));
}

function districtDock(actions) {
  return {
    tag: 'div',
    attr: { class: 'heichel-os-district-dock', 'data-heichel-os-world': 'true' },
    children: [
      { tag: 'div', attr: { class: 'heichel-os-world-heading' }, children: [
        { tag: 'p', attr: { class: 'hero-kicker' }, children: ['Heichel OS'] },
        { tag: 'h2', attr: { 'data-heichel-os-name': 'true' }, children: ['Living Heichel'] },
        { tag: 'p', attr: { 'data-heichel-os-desc': 'true' }, children: ['Objects, graph, events, and projections are loading.'] }
      ] },
      { tag: 'div', attr: { class: 'heichel-os-district-buttons' }, children: DISTRICTS.map(([id, label], index) => ({
        tag: 'button',
        attr: { type: 'button', class: index === 0 ? 'active' : '', 'data-heichel-district': id },
        children: [label],
        events: { click: () => (actions.activateHeichelDistrict || activateDistrict)(id) }
      })) }
    ]
  };
}

function statusGrid() {
  return {
    tag: 'div', attr: { class: 'heichel-os-status-grid' }, children: [
      statusCard('posts', 'Posts'), statusCard('series', 'Series'), statusCard('mode', 'Access'), statusCard('currentSeries', 'Series path')
    ]
  };
}

function statusCard(key, label) {
  return { tag: 'article', attr: { class: 'heichel-os-status-card' }, children: [
    { tag: 'strong', attr: { 'data-heichel-os-count': key }, children: ['0'] }, { tag: 'small', children: [label] }
  ] };
}

function districtViewport() {
  return { tag: 'article', attr: { class: 'heichel-os-district-viewport' }, children: [
    { tag: 'h3', attr: { 'data-heichel-district-title': 'true' }, children: ['Overview'] },
    { tag: 'div', attr: { 'data-heichel-district-body': 'true' }, children: districtCopy('overview').map(line => ({ tag: 'p', children: [line] })) }
  ] };
}

function districtTitle(name) {
  return (DISTRICTS.find(([id]) => id === name)?.[1] || 'Overview');
}

function districtCopy(name) {
  return {
    overview: ['The Heichel is the city shell: live posts, nested series, permissions, and graph context in one operating surface.'],
    timeline: ['Timeline watches current posts and future civilization events as one river.'],
    series: ['Series are districts: each nested path can become a knowledge street, curriculum, archive, or world.'],
    knowledge: ['Knowledge will gather references, citations, quotes, semantic summaries, and linked thoughts.'],
    people: ['People will reveal editors, owners, followers, contributors, aliases, and live presence.'],
    assets: ['Assets will expose media, thumbnails, attachments, drafts, and upload state.'],
    events: ['Events will stream civilization pulses, object changes, comments, graph edges, and notifications.'],
    moderation: ['Moderation will gather submissions, roles, reports, queues, and permission compilation.'],
    graph: ['Graph will reveal parent-child links, references, reposts, mentions, incoming edges, and outgoing edges.'],
    storage: ['Storage will show AwtsmoosDB-backed projections, packed compatibility stats, and shard health.']
  }[name] || ['This district is waiting to receive its live route.'];
}

function paragraph(text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function count(value) { return Array.isArray(value) ? value.length : 0; }
