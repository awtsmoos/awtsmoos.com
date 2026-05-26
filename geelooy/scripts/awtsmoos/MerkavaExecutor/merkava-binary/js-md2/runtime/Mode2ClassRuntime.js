// B"H
'use strict';

/**
 * Chapter 9: The Awtsmoos forges inheritance in a quiet iron crown.
 *
 * MD2 classes are compact objects with a `__md2class` seal. This helper keeps
 * construction and `super()` invocation outside the main executor body while
 * preserving the current direct-execution semantics: no eval, no JSON IR, no
 * SANG runtime, only already-decoded MD2 function bodies and ordinary JS host
 * constructors when present.
 */
class Mode2ClassRuntime {
  /**
   * Invokes a superclass constructor against an existing `this` object.
   *
   * @param {object} superClass MD2 class object or host constructor carrier.
   * @param {Array<*>} args Constructor arguments.
   * @param {object} thisArg Receiver already allocated by the caller.
   * @param {(fn:object,args:Array<*>,thisArg:object)=>*} callMd2 MD2 function caller.
   * @returns {object} The same receiver, after constructor side effects.
   */
  callSuper(superClass, args, thisArg, callMd2) {
    const init = superClass?.constructor;
    if (init?.__md2fn) callMd2(init, args, thisArg);
    else if (typeof init === 'function' && init !== Object.prototype.constructor) init.apply(thisArg, args);
    return thisArg;
  }

  /**
   * Creates an instance from the compact MD2 class object.
   *
   * @param {object} ctor MD2 class object with methods on itself.
   * @param {Array<*>} args Constructor arguments.
   * @param {(fn:object,args:Array<*>,thisArg:object)=>*} callMd2 MD2 function caller.
   * @returns {object} Newly allocated instance.
   */
  constructMd2Class(ctor, args, callMd2) {
    const instance = Object.create(ctor);
    const init = ctor.constructor;
    if (init?.__md2fn) callMd2(init, args, instance);
    else if (typeof init === 'function' && init !== Object.prototype.constructor) init.apply(instance, args);
    return instance;
  }
}

const mode2ClassRuntime = new Mode2ClassRuntime();

module.exports = { Mode2ClassRuntime, mode2ClassRuntime };
