// B\"H
/** Streams only the near coils of the path, while distant life waits calmly. */
export function createSnakePathStreamer({ segments = [], ahead = 3, behind = 1 } = {}) {
  const active = new Set();
  function update(playerZ = 0) {
    const current = Math.max(0, segments.findIndex(s => playerZ >= s.z0 && playerZ < s.z1));
    const wanted = new Set();
    for (let i = Math.max(0, current - behind); i <= Math.min(segments.length - 1, current + ahead); i++) wanted.add(segments[i].id);
    const activate = segments.filter(s => wanted.has(s.id) && !active.has(s.id));
    const deactivate = [...active].filter(id => !wanted.has(id));
    deactivate.forEach(id => active.delete(id));
    activate.forEach(s => active.add(s.id));
    return { current, activate, deactivate, active: [...active] };
  }
  return { update, active: () => [...active] };
}
