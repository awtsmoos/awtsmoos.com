
// B"H
export class HistoryStateLink {
  static bind(state, onChangeCallback) {
    // Intercept standard state notifications to trigger a history refresh
    state.subscribe('activeSequence', () => onChangeCallback());
    state.subscribe('characters', () => onChangeCallback());
    state.subscribe('scene', () => onChangeCallback());
  }
}
