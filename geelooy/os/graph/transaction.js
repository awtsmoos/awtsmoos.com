// B"H
export function runTransaction(graph, operations = []) {
  const backup = graph.list();
  const eventBackup = graph.events.list();
  const watcherBackup = graph.watchStore.backup();
  const results = [];
  try {
    for (const op of operations) results.push(applyOperation(graph, op));
    graph.emit("transaction.committed", { count:operations.length });
    return { ok:true, results, graph:graph.snapshot() };
  } catch (error) {
    graph.map.clear();
    backup.forEach(object => graph.map.set(object.id, object));
    graph.events.events = eventBackup;
    graph.watchStore.restore(watcherBackup);
    return { ok:false, error:error.message, graph:graph.snapshot() };
  }
}

function applyOperation(graph, op) {
  if (op.op === "delete" || op.op === "remove") return graph.remove(op.id);
  if (op.op === "upsert" || !op.op) return graph.upsert(op.object || op);
  throw new Error(`Unsupported graph transaction op: ${op.op}`);
}

/** B"H: transaction is a promise with a rollback rope tied to the shore. */
