// B"H
import { trim } from './dom.js';

const nativeTypes = new Set(['post', 'comment', 'alias', 'heichel', 'event']);
const snapshot = { mode: 'forYou', objects: [], metrics: {}, selected: null, updatedAt: '' };

export function syncFeedObjects(mode, objects = []) {
  snapshot.mode = mode;
  snapshot.objects = objects.map(toGraphObject);
  snapshot.updatedAt = new Date().toISOString();
  const graph = graphTarget();
  upsert(graph, rootObject());
  upsert(graph, feedObject(mode));
  snapshot.objects.forEach(object => upsert(graph, object));
  exposeSnapshot();
}

export function syncMetrics(metrics = {}) {
  snapshot.metrics = metrics;
  snapshot.updatedAt = new Date().toISOString();
  upsert(graphTarget(), {
    id: 'metric:geelooy-home-live',
    type: 'metric',
    title: 'Geelooy Home Metrics',
    parentId: 'civilization:geelooy-home',
    refs: [`feed:${snapshot.mode}`],
    data: { ...metrics }
  });
  exposeSnapshot();
}

export function syncSelectedObject(object) {
  snapshot.selected = object ? toGraphObject(object) : null;
  upsert(graphTarget(), {
    id: 'inspector:geelooy-home',
    type: 'inspector',
    title: 'Geelooy Home Inspector',
    parentId: 'civilization:geelooy-home',
    refs: snapshot.selected ? [snapshot.selected.id] : [],
    data: { selectedKey: snapshot.selected?.id || '' }
  });
  exposeSnapshot();
}

function toGraphObject(object) {
  const type = nativeTypes.has(object.type) ? object.type : 'object';
  return {
    id: `${type}:${safeId(object.id)}`,
    type,
    title: object.title,
    path: object.href,
    parentId: `feed:${object.mode}`,
    refs: relatedRefs(object),
    data: { mode: object.mode, author: object.author, summary: trim(object.summary, 220) }
  };
}

function relatedRefs(object) {
  const raw = object.raw || {}, refs = [];
  if (raw.heichelId) refs.push(`heichel:${safeId(raw.heichelId)}`);
  if (raw.aliasId) refs.push(`alias:${safeId(raw.aliasId)}`);
  if (raw.postId) refs.push(`post:${safeId(raw.postId)}`);
  return refs;
}

function rootObject() { return { id:'civilization:geelooy-home', type:'civilization', title:'Geelooy Home', path:'/' }; }
function feedObject(mode) { return { id:`feed:${mode}`, type:'feed', title:`Geelooy ${mode} Feed`, parentId:'civilization:geelooy-home' }; }
function graphTarget() { return typeof window !== 'undefined' ? window.os?.graph : null; }
function upsert(graph, object) { try { graph?.upsert?.(object); } catch (error) { console.warn('B"H graph bridge skipped', error); } }
function exposeSnapshot() { if (typeof window !== 'undefined') window.__geelooyHomeGraph = { ...snapshot, objects:[...snapshot.objects] }; }
function safeId(value) { return String(value || 'unknown').replace(/[^a-zA-Z0-9:_-]/g, '-').slice(0, 96); }
