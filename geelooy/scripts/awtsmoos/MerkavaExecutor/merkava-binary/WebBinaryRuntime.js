// B"H
const { decodeWebBinary } = require('./WebBinaryCodec.js');
const { querySelectorAllStub, specificity } = require('./CssSelectorEngine.js');

function makeElement(tag, ownerDocument) {
  return {
    tagName: String(tag || 'div').toUpperCase(), id: '', className: '', attributes: {}, dataset: {}, style: {}, __styleMeta: {}, textContent: '', children: [], parentNode: null, events: {}, ownerDocument,
    appendChild(el) { if (!el) return el; el.parentNode = this; this.children.push(el); if (el.id) this.ownerDocument?.byId?.set(el.id, el); return el; },
    removeChild(el) { const i = this.children.indexOf(el); if (i >= 0) this.children.splice(i, 1); if (el) el.parentNode = null; return el; },
    setAttribute(name, value) { const k = String(name); this.attributes[k] = String(value); if (k === 'id') { this.id = String(value); this.ownerDocument?.byId?.set(this.id, this); } if (k === 'class') this.className = String(value); if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value); },
    getAttribute(name) { return this.attributes[String(name)] ?? null; },
    addEventListener(name, handler) { this.events[name] = handler; },
    dispatchEvent(event) { const fn = this.events[event?.type || event]; if (fn) fn(event); return !!fn; }
  };
}
function createDocumentStub() {
  const byId = new Map(); const document = { body: null, byId,
    createElement(tag) { return makeElement(tag, document); }, getElementById(id) { return byId.get(id) || null; },
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }, querySelectorAll(selector) { return querySelectorAllStub(document, selector); }
  }; document.body = makeElement('body', document); return document;
}
function setStyle(el, prop, value, score, order) {
  const old = el.__styleMeta[prop];
  if (!old || score > old.score || (score === old.score && order >= old.order)) { el.style[prop] = value; el.__styleMeta[prop] = { score, order }; }
}
function runWebBinary(buffer, options = {}) {
  const decoded = decodeWebBinary(buffer); const document = options.document || createDocumentStub(); const journal = [], events = [];
  let order = 0;
  const lookup = id => id ? document.getElementById(id) : document.body;
  const targets = sel => lookup(sel) ? [lookup(sel)] : document.querySelectorAll(sel);
  for (const item of decoded.ops) {
    if (item.op === 'END') break;
    if (item.op === 'CREATE_NODE') { const el = document.createElement(item.tag); el.id = item.id; el.textContent = item.text; if (item.id) document.byId?.set(item.id, el); (lookup(item.parent) || document.body).appendChild(el); journal.push(item); }
    else if (item.op === 'SET_ATTR') { for (const el of targets(item.target)) if (el?.setAttribute) el.setAttribute(item.attr, item.value === true ? '' : item.value); journal.push(item); }
    else if (item.op === 'SET_STYLE') { const score = specificity(item.target); for (const el of targets(item.target)) setStyle(el, item.prop, item.value, score, order++); journal.push(item); }
    else if (item.op === 'SET_STYLE_BLOCK') { const score = specificity(item.target); for (const el of targets(item.target)) for (const [prop, value] of item.pairs) setStyle(el, prop, value, score, order++); journal.push(item); }
    else if (item.op === 'BIND_EVENT') { const el = lookup(item.target); if (el) el.events[item.on] = () => { for (const action of item.actions) { if (action.op === 'setText') { const target = lookup(action.target); if (target) target.textContent = action.value; } else if (action.op === 'emit') events.push({ name: action.name, value: action.value }); } }; journal.push(item); }
  }
  return { ok: true, decoded, document, journal, events };
}
function triggerWebEvent(runtime, id, eventName) { const el = runtime.document.getElementById(id); if (!el || !el.events[eventName]) return false; el.events[eventName]({ type: eventName, target: el }); return true; }
module.exports = { runWebBinary, triggerWebEvent, createDocumentStub, makeElement, querySelectorAllStub };
