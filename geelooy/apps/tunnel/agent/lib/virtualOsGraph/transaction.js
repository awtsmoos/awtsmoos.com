// B"H
function transaction(graph, operations = []) {
  const backup = graph.rawEntries();
  const eventBackup = graph.rawEvents();
  const watcherBackup = graph.watchStore.backup();
  const results = [];
  try {
    for (const op of operations) results.push(apply(graph, op));
    graph.emit('transaction.committed', { count:operations.length });
    return { ok:true, results, graph:graph.snapshot() };
  } catch (error) {
    graph.restoreRaw(backup, eventBackup);
    graph.watchStore.restore(watcherBackup);
    return { ok:false, error:error.message, graph:graph.snapshot() };
  }
}
function apply(graph, op) { if (op.op === 'delete' || op.op === 'remove') return graph.remove(op.id); if (op.op === 'upsert' || !op.op) return graph.upsert(op.object || op); throw new Error(`Unsupported graph transaction op: ${op.op}`); }
module.exports = { transaction };
/** B"H: server transactions hold rollback rope and watcher memory together. */
