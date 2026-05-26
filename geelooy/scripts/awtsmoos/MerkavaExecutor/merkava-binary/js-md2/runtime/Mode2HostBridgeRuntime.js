// B"H
'use strict';

/**
 * Chapter 11: The Awtsmoos teaches a host callback to wear a human face.
 *
 * MD2 functions are compact bytecode vessels, not native JavaScript functions.
 * Browser and Node hosts expect callable values for events, timers, streams and
 * emitters. This bridge wraps MD2 function records into tiny host functions so
 * the outside world can knock on the bytecode door without eval or JSON IR.
 */
class Mode2HostBridgeRuntime {
  /**
   * @param {*} value Candidate callback or ordinary value.
   * @param {(fn:object,args:Array<*>,thisArg:*)=>*} callMd2 MD2 caller.
   * @returns {*} Host-callable wrapper for MD2 functions, otherwise value.
   */
  wrapCallback(value, callMd2) {
    if (!value?.__md2fn) return value;
    return function md2HostCallback(...args) {
      return callMd2(value, args, this);
    };
  }

  /**
   * @param {Array<*>} args Raw argument list leaving the MD2 world.
   * @param {(fn:object,args:Array<*>,thisArg:*)=>*} callMd2 MD2 caller.
   * @returns {Array<*>} Argument list with callback records wrapped.
   */
  wrapArgs(args, callMd2) {
    return Array.from(args || [], arg => this.wrapCallback(arg, callMd2));
  }

  /**
   * @param {*} value Return value from host or MD2.
   * @returns {*} Currently identity; reserved for future DOM node proxies.
   */
  unwrapReturn(value) {
    return value;
  }
}

const mode2HostBridgeRuntime = new Mode2HostBridgeRuntime();

module.exports = { Mode2HostBridgeRuntime, mode2HostBridgeRuntime };
