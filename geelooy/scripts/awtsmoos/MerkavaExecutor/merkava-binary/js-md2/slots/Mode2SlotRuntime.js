// B"H
'use strict';

/**
 * Chapter 11: The Awtsmoos lays local vessels in a numbered arena.
 *
 * Slot runtime helpers are intentionally small and side-effect-light. They let
 * the MD2 VM attach optional numeric local arenas to scopes without replacing
 * the existing object-scope semantics until each compiled slot path is proven.
 */
class Mode2SlotRuntime {
  /**
   * @param {Array<string>} names - Slot names in numeric order.
   * @param {object|null} parent - Parent lexical scope.
   * @returns {object} scope with slot arena metadata.
   */
  createScope(names = [], parent = null) {
    const scope = Object.create(parent || null);
    Object.defineProperty(scope, '__md2Slots', { value: new Array(names.length), enumerable: false, configurable: true });
    Object.defineProperty(scope, '__md2SlotNames', { value: names.slice(), enumerable: false, configurable: true });
    Object.defineProperty(scope, '__md2SlotIds', { value: Object.create(null), enumerable: false, configurable: true });
    names.forEach((name, id) => { scope.__md2SlotIds[name] = id; });
    return scope;
  }

  /** @param {object} scope @param {number} id @returns {*} */
  load(scope, id) { return scope.__md2Slots?.[id]; }

  /** @param {object} scope @param {number} id @param {*} value @returns {*} */
  store(scope, id, value) { if (!scope.__md2Slots) return value; scope.__md2Slots[id] = value; return value; }
}

const mode2SlotRuntime = new Mode2SlotRuntime();

module.exports = { Mode2SlotRuntime, mode2SlotRuntime };
