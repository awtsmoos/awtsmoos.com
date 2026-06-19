// B"H
export class SaveUtils {
  static resave(event, state, app) {
    const seq = state.get('activeSequence');
    if (!seq) return;
    const idx = seq.events ? seq.events.findIndex(e => e === event) : -1;
    if (idx > -1) seq.events[idx] = event;
    state.set('activeSequence', { ...seq });
    if (app && app.timeline) app.timeline.refreshTracks();
  }
}