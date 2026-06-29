// B"H
import { action } from './action.js';

/**
 * B"H
 * Virtual OS actions name the graph and VFS gates already alive in the browser
 * OS. The catalog does not create power; it reveals the existing covenant so
 * humans and AI can ask permissioned questions through one surface.
 */
export const VIRTUAL_OS_ACTIONS = Object.freeze([
  action('virtualOsGraphSample', 'Virtual OS graph sample', 'Show the unified desktop object graph sample.', 'Virtual OS', ['graph','object'], {}),
  action('virtualOsGraphStatus', 'Virtual OS graph status', 'Inspect server-side virtual OS graph state.', 'Virtual OS', ['graph','status'], {}),
  action('virtualOsGraphUpsert', 'Virtual OS graph upsert', 'Create/update a desktop object such as drive/window/preview/process.', 'Virtual OS', ['graph','write'], { object:{ id:'preview:demo', type:'preview', title:'Demo Preview' } }),
  action('virtualOsGraphGet', 'Virtual OS graph get', 'Fetch one object by id.', 'Virtual OS', ['graph','read'], { id:'desktop:main' }),
  action('virtualOsGraphSearch', 'Virtual OS graph search', 'Search desktop objects.', 'Virtual OS', ['graph','search'], { query:'preview' }),
  action('virtualOsGraphReset', 'Virtual OS graph reset', 'Reset one server-side graph namespace.', 'Virtual OS', ['graph','danger-safe'], { graphId:'default' }),
  action('virtualOsGraphDelete', 'Virtual OS graph delete', 'Delete one object while recording graph history.', 'Virtual OS', ['graph','delete'], { id:'preview:demo' }),
  action('virtualOsGraphHistory', 'Virtual OS graph history', 'Read the graph event log with optional id/type filters.', 'Virtual OS', ['graph','history'], { limit:100 }),
  action('virtualOsGraphReferences', 'Virtual OS graph references', 'Show refs, children, and reverse refs for one object.', 'Virtual OS', ['graph','refs'], { id:'desktop:main' }),
  action('virtualOsGraphDiff', 'Virtual OS graph diff', 'Compare supplied objects/graph against current graph state.', 'Virtual OS', ['graph','diff'], { objects:[] }),
  action('virtualOsGraphTraverse', 'Virtual OS graph traverse', 'Walk outbound or inbound graph references to a bounded depth.', 'Virtual OS', ['graph','traverse'], { id:'desktop:main', direction:'out', depth:2 }),
  action('virtualOsGraphPathLookup', 'Virtual OS graph path lookup', 'Resolve object by id, URL, path, title, or fuzzy query.', 'Virtual OS', ['graph','lookup'], { path:'/desktop' }),
  action('virtualOsGraphTransaction', 'Virtual OS graph transaction', 'Apply upsert/delete operations with rollback-on-error.', 'Virtual OS', ['graph','transaction'], { operations:[{ op:'upsert', object:{ id:'preview:demo', type:'preview', title:'Demo Preview' } }] }),
  action('virtualOsGraphSubscribe', 'Virtual OS graph subscribe', 'Create a server-side graph watcher with id/type filters.', 'Virtual OS', ['graph','watch'], { watcher:{ filter:{ objectType:'preview' } } }),
  action('virtualOsGraphUnsubscribe', 'Virtual OS graph unsubscribe', 'Remove a server-side graph watcher.', 'Virtual OS', ['graph','watch'], { watcherId:'' }),
  action('virtualOsGraphWatchers', 'Virtual OS graph watchers', 'List active graph watchers and queued event counts.', 'Virtual OS', ['graph','watch','status'], {}),
  action('virtualOsGraphWatchPoll', 'Virtual OS graph watch poll', 'Drain queued events from a graph watcher.', 'Virtual OS', ['graph','watch','events'], { watcherId:'', limit:100 }),
  action('vfsWrite', 'Virtual FS write', 'Write content through the browser OS VFS permission and adapter gates.', 'Virtual OS', ['vfs','write'], { path:'/notes.txt', content:'B\"H', principal:{ id:'control-panel' } }),
  action('vfsMkdir', 'Virtual FS mkdir', 'Create a directory through the browser OS VFS permission gate.', 'Virtual OS', ['vfs','write'], { path:'/folder', principal:{ id:'control-panel' } }),
  action('vfsRemove', 'Virtual FS remove', 'Remove a VFS path only after adapter and permission checks pass.', 'Virtual OS', ['vfs','danger-safe'], { path:'/notes.txt', principal:{ id:'control-panel' } }),
  action('vfsCan', 'Virtual FS permission check', 'Inspect whether a principal may perform one VFS action on a path.', 'Virtual OS', ['vfs','permission'], { path:'/', action:'read', principal:{ id:'control-panel' } }),
  action('vfsMounts', 'Virtual FS mounts', 'List registered browser OS VFS mounts exposed by the unified registry.', 'Virtual OS', ['vfs','status'], {}),
  action('vfsResolve', 'Virtual FS resolve', 'Resolve a VFS path and return its permission verdict for one action.', 'Virtual OS', ['vfs','resolve'], { path:'/', action:'read', principal:{ id:'control-panel' } })
]);
