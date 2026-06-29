// B"H
const TYPES = Object.freeze({ write:'file.write', mkdir:'file.mkdir', remove:'file.remove', copy:'file.copy', move:'file.move', mount:'mount.mount', unmount:'mount.unmount' });
export function emitVfsMutation(graph, event = {}) {
  const type = TYPES[event.action] || 'vfs.mutated';
  const payload = { ...event, type, id:`vfs:${event.action}:${event.path}` };
  graph?.emit?.(type, payload); graph?.upsert?.({ id:payload.id, type:'vfs-event', title:`${event.action} ${event.path}`, path:event.path, data:payload });
  return payload;
}
/** B"H: every mutation now names its exact graph event, not only a generic tremor. */
