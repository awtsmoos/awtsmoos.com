// B"H
'use strict';

/**
 * Chapter 6: The Awtsmoos catches the shard before it cuts the worlds.
 *
 * This helper centralizes the tiny exception protocol currently encoded in MD2
 * scopes: a catch slot name and a catch program counter. It does not invent a
 * new semantics; it names the existing contract so runtime handlers can later
 * stop whispering magic property names through the monolith.
 */
class Mode2ExceptionRuntime {
  /**
   * @param {object} scope - Active lexical scope object.
   * @returns {boolean} true when a catch target is registered.
   */
  hasCatch(scope) {
    return Boolean(scope && scope.__md2Catch);
  }

  /**
   * @param {object} scope - Active lexical scope object.
   * @param {*} error - Thrown value.
   * @returns {{caught:boolean,nextIp:number|null}}
   */
  capture(scope, error) {
    if (!this.hasCatch(scope)) return { caught: false, nextIp: null };
    scope[scope.__md2Catch] = error;
    return { caught: true, nextIp: Number(scope.__md2CatchPc) || 0 };
  }
}

const mode2ExceptionRuntime = new Mode2ExceptionRuntime();

module.exports = { Mode2ExceptionRuntime, mode2ExceptionRuntime };
