// B"H
const { createPuppeteerCompat } = require("./puppeteer.js");
const { createPlaywrightCompat } = require("./playwright.js");

/**
 * B"H
 * Chapter 424: The Element Learned To Leave.
 *
 * Browser compatibility is not only page and browser words. It is also the
 * small DOM mercies: remove(), before(), after(), and replaceWith(), so dynamic
 * tests can break and rebuild the tree like living pages do.
 */
function installCompat(context, window) {
  installDomMutationCompat(window);
  const puppeteer = createPuppeteerCompat(window, context);
  const playwright = createPlaywrightCompat(window, context);
  context.__nodeDomPage = playwright.page;
  context.puppeteer = puppeteer;
  context.playwright = playwright;
  context.chromium = playwright.chromium;
  context.window.__nodeDomPage = playwright.page;
}

function installDomMutationCompat(window) {
  const sample = window?.document?.createElement?.("div");
  const proto = sample && Object.getPrototypeOf(sample);
  if (!proto) return;
  if (typeof proto.remove !== "function") proto.remove = function remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  };
  if (typeof proto.replaceWith !== "function") proto.replaceWith = function replaceWith(...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    for (const node of nodes) parent.insertBefore(asNode(window, node), this);
    parent.removeChild(this);
  };
  if (typeof proto.before !== "function") proto.before = function before(...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    for (const node of nodes) parent.insertBefore(asNode(window, node), this);
  };
  if (typeof proto.after !== "function") proto.after = function after(...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    let ref = this.nextSibling;
    for (const node of nodes) {
      const child = asNode(window, node);
      parent.insertBefore(child, ref);
      ref = child.nextSibling;
    }
  };
}

function asNode(window, value) {
  if (value && typeof value === "object" && "nodeType" in value) return value;
  return window.document.createTextNode(String(value));
}

module.exports = { installCompat, installDomMutationCompat };
