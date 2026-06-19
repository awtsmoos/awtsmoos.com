
/* B”H */
export class ActionModifier {
  static updateAction(event, key, value) {
    if (!event.actions) event.actions = [];
    event.actions.push({ at: 0, key, value });
  }
}
