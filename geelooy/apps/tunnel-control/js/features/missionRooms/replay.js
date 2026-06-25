// B"H

/** B"H: Replay is client-side time travel through events already received. */
export function replayEvents(state) {
  const events = [...(state.events || [])].sort((a, b) => String(a.at).localeCompare(String(b.at)));
  const end = state.replayEnabled ? Math.max(0, Math.min(state.replayIndex || 0, events.length - 1)) : events.length - 1;
  return events.slice(0, end + 1);
}

export function replayLabel(state) {
  const total = (state.events || []).length;
  if (!state.replayEnabled) return `Live · ${total} events`;
  return `Replay ${Math.min((state.replayIndex || 0) + 1, total)} / ${total}`;
}

export function replayStep(state, delta) {
  const total = (state.events || []).length;
  state.replayEnabled = true;
  state.replayIndex = Math.max(0, Math.min((state.replayIndex || 0) + delta, Math.max(0, total - 1)));
}

export function replayLive(state) {
  state.replayEnabled = false;
  state.replayPlaying = false;
  state.replayIndex = Math.max(0, (state.events || []).length - 1);
}
