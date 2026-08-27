
// B"H
/**
 * @file GlobalFlagsInit.js
 * @description Assigns overarching behavioral directives to the system.
 */
export class GlobalFlagsInit {
  static apply(state) {
    state.register('isTalking', true);
    state.register('isWalking', true);
  }
}
