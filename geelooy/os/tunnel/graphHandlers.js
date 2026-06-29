// B"H
import { ok } from "./response.js";
import { currentGraph, currentOs } from "./osAccess.js";

export function graphHandlers() {
  return {
    graph:() => ok("graph", { graph:currentOs().graphSnapshot?.() || {} }),
    graphSearch:p => ok("graphSearch", { results:graph().search?.(p.query || p.q || "") || [] }),
    graphHistory:p => ok("graphHistory", { events:graph().history?.(p) || [] }),
    graphReferences:p => ok("graphReferences", { references:graph().references?.(p.id) || {} }),
    graphDiff:p => ok("graphDiff", { diff:graph().diff?.(p.graph || p.object || p) || {} }),
    graphTraverse:p => ok("graphTraverse", { traversal:graph().traverse?.(p) || {} }),
    graphTransaction:p => ok("graphTransaction", graph().transaction?.(p.operations || []) || { ok:false }),
    graphSubscribe:p => ok("graphSubscribe", { watcher:graph().subscribe?.(p.watcher || p.watch || p) || null }),
    graphUnsubscribe:p => ok("graphUnsubscribe", { watcher:graph().unsubscribe?.(p.watcherId || p.id) || null }),
    graphWatchers:() => ok("graphWatchers", { watchers:graph().watchers?.() || [] }),
    graphWatchPoll:p => ok("graphWatchPoll", { result:graph().drain?.(p.watcherId || p.id, p.limit) || null }),
    objectGet:p => ok("objectGet", { object:graph().get?.(p.id) || null }),
    objectUpsert:p => ok("objectUpsert", { object:graph().upsert?.(p.object || p) || null }),
    objectDelete:p => ok("objectDelete", { deleted:graph().remove?.(p.id) || null }),
    objectPathLookup:p => ok("objectPathLookup", { object:graph().pathLookup?.(p.path || p.url || p.id || p.query || "") || null })
  };
}

function graph() { return currentGraph(); }
/** B"H: graph tunnel handlers now live in their own chamber of listening. */
