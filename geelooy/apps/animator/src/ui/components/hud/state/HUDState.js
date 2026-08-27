
// B"H
export class HUDState {
  static showMessage(state, text, duration) {
    state.set('hud_message', text);
    setTimeout(() => {
      if (state.get('hud_message') === text) {
        state.set('hud_message', '');
      }
    }, duration);
  }
}
