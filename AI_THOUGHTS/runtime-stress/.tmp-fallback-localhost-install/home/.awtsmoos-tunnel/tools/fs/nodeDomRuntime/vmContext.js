// B"H
const vm = require("vm");

/**
 * B"H
 * Creates one Node VM sky above the Merkava window. Browser globals are copied
 * both as `window.x` and bare `x`, so real public pages can speak as they do in
 * Chrome without begging Node for permission.
 */
function createVmContext(globals) {
  const bag = { ...globals };
  bag.globalThis = bag;
  bag.window = globals.window;
  bag.self = globals.window;
  bag.document = globals.document;
  bag.console = globals.console;
  installCoreConstructors(bag, globals);
  installWindowMethods(bag, globals.window);
  return vm.createContext(bag);
}

function installCoreConstructors(bag, globals) {
  Object.assign(bag, { Promise, Array, Object, JSON, Math, Date, RegExp, Error, TypeError, URL });
  for (const name of ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "fetch", "requestAnimationFrame", "cancelAnimationFrame"]) {
    if (globals[name]) bag[name] = globals[name];
  }
}

function installWindowMethods(bag, window) {
  for (const name of ["addEventListener", "removeEventListener", "dispatchEvent", "alert", "confirm", "prompt", "open", "close", "scrollTo", "scrollBy", "matchMedia"]) {
    if (typeof window?.[name] === "function") bag[name] = window[name].bind(window);
  }
}

function installNamedElements(context) {
  installWindowMethods(context, context.window);
  const all = context.document?.querySelectorAll?.("[id]") || [];
  for (const el of all) {
    if (el.id && !(el.id in context)) context[el.id] = el;
    if (el.id && context.window && !(el.id in context.window)) context.window[el.id] = el;
  }
}
module.exports = { createVmContext, installNamedElements, installWindowMethods };
