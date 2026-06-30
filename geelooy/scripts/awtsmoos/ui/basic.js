//B"H
export function createElement(ob = {}) {
  if (isNode(ob)) return ob;
  if (typeof ob === 'string') return document.createTextNode(ob);
  const tag = ob.tag || 'div';
  const element = document.createElement(tag);
  const attrs = ob.attr || ob.attributes || {};
  if (ob.html != null) element.innerHTML = String(ob.html);
  if (ob.text != null) element.textContent = String(ob.text);
  setAttributes(element, attrs);
  appendChildren(element, ob.children);
  bindEvents(element, ob.on || ob.events);
  assignSafeProperties(element, ob);
  return element;
}
export function appendElements(parent, elements = []) { elements.flat().filter(Boolean).forEach(el => parent.appendChild(isNode(el) ? el : createElement(el))); }
function appendChildren(element, children) { if (!Array.isArray(children)) return; children.flat().filter(Boolean).forEach(child => element.appendChild(isNode(child) || typeof child === 'string' ? createElement(child) : createElement(child))); }
function setAttributes(element, attrs = {}) { Object.entries(attrs).forEach(([key, value]) => { if (!validAttribute(key) || value == null || value === false) return; if (key === 'className') key = 'class'; if (value === true) element.setAttribute(key, ''); else element.setAttribute(key, String(value)); }); }
function bindEvents(element, ev = {}) { Object.entries(ev).forEach(([key, fn]) => { if (typeof fn === 'function' && /^[a-z][\w:-]*$/i.test(key)) element.addEventListener(key, fn); }); }
function assignSafeProperties(element, ob = {}) { ['value','checked','disabled','hidden','title','tabIndex','ariaLabel'].forEach(key => { if (key in ob) try { element[key] = ob[key]; } catch {} }); }
function validAttribute(key) { return typeof key === 'string' && /^[A-Za-z_:][A-Za-z0-9_.:-]*$/.test(key); }
function isNode(value) { return typeof Node !== 'undefined' && value instanceof Node; }
/**
 * B"H
 * The helper no longer mistakes a living DOM node for a config object. The
 * numeric phantom attribute is banished; children, attrs, and events each walk
 * their own path without swallowing one another.
 */
