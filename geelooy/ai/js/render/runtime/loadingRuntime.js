//B"H

/**
 * B"H — Loading ghosts may vanish, but event vessels are real messages.
 * Never remove a record that contains thinking, status, raw, OAuth, or tool data.
 */
export function removeIfEmptyLoading(renderer, record) {
  if (!record.loading) return false;
  if (record.text || record.events?.length) return false;
  record.shell?.remove();
  renderer.byId.delete(record.id);
  return true;
}
