// B"H
import { getCivilizationEntityState } from './api.js';
import { element, link, pill, preNode, stringify, textNode, trim } from './dom.js';
import { syncSelectedObject } from './graphBridge.js';

export function inspectObject(object) {
  const root = document.querySelector('[data-object-inspector]');
  const body = document.querySelector('[data-object-inspector-body]');
  if (!root || !body || !object) return;
  syncSelectedObject(object);
  root.querySelector('h2').textContent = trim(object.title, 82);
  const intro = root.querySelector('p:not(.home-kicker)');
  if (intro) intro.textContent = `${object.type} · ${object.id}`;
  body.replaceChildren(routeSection(object), graphSection(object), stateSection(object), rawSection(object));
  civilizationProbe(object, body);
  root.scrollIntoView({ block:'nearest', behavior:'smooth' });
}

function routeSection(object) {
  const section = shell('Route');
  section.append(textNode(object.href), link('Open this route', object.href));
  return section;
}

function graphSection(object) {
  const section = shell('Graph hints');
  const row = element('div', 'object-meta-grid');
  row.append(pill(`type:${object.type}`), pill(`id:${object.id}`), pill(`mode:${object.mode}`));
  section.append(row, preNode({ refs:graphRefs(object), parentId:`feed:${object.mode}` }));
  return section;
}

function stateSection(object) {
  const section = shell('Civilization state');
  section.dataset.civilizationState = 'loading';
  section.append(textNode('Loading state from the civilization route...'));
  return section;
}

function rawSection(object) {
  const section = shell('Raw metadata');
  section.append(preNode(object.raw || object));
  return section;
}

async function civilizationProbe(object, body) {
  const section = body.querySelector('[data-civilization-state]');
  const state = await getCivilizationEntityState({ type:object.type, id:object.id });
  if (!section) return;
  section.replaceChildren(element('h3', '', 'Civilization state'), preNode(state || { ok:false, message:'No state returned yet.' }));
}

function graphRefs(object) {
  const raw = object.raw || {}, refs = [];
  if (raw.heichelId) refs.push(`heichel:${raw.heichelId}`);
  if (raw.aliasId) refs.push(`alias:${raw.aliasId}`);
  if (raw.postId) refs.push(`post:${raw.postId}`);
  return refs;
}

function shell(title) {
  const section = element('section', 'object-inspector-section');
  section.append(element('h3', '', title));
  return section;
}

/** B"H: the inspector reads route, graph, state, and raw letters. */
