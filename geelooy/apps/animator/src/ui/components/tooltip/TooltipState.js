// B"H
/**
 * @class TooltipState
 * @description
 * Holds the transient memory of what is currently being hovered over,
 * decoupling the data from the DOM.
 */
export class TooltipState {
  static activeText = null;
  static activeTarget = null;
  static isVisible = false;
  static timeoutId = null;
}