// B"H
/**
 * @module TinyPlatformDom
 * @description
 * A deliberately small DOM vessel: not a fake universe, only enough clay for
 * the Awtsmoos platform panel to reveal whether its real browser code can
 * mount, click, submit, and render without Chrome.
 */
export class TinyElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.dataset = {};
    this.style = {};
    this.hidden = false;
    this.onclick = null;
    this.onsubmit = null;
    this.name = '';
    this.value = '';
    this._className = '';
    this._textContent = '';
  }

  set className(value) { this._className = String(value || ''); }
  get className() { return this._className; }

  set textContent(value) {
    this.children = [];
    this._textContent = String(value ?? '');
  }
  get textContent() {
    return this._textContent + this.children.map(child => child.textContent).join('');
  }

  set innerHTML(value) {
    this.children = [];
    this._textContent = '';
    if (String(value).includes('awtsmoos-platform-toggle')) buildPlatformPanelShell(this);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = [];
    for (const child of children) this.appendChild(child);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'class') this.className = value;
    if (name.startsWith('data-')) this.dataset[dataKey(name)] = String(value);
    if (name === 'name') this.name = String(value);
  }

  getAttribute(name) { return this.attributes.get(name) ?? null; }

  querySelector(selector) { return walk(this).find(el => matches(el, selector)) || null; }
  querySelectorAll(selector) { return walk(this).filter(el => matches(el, selector)); }
}

export class TinyDocument {
  constructor() { this.body = this.createElement('body'); }
  createElement(tagName) { return new TinyElement(tagName, this); }
  querySelector(selector) { return this.body.querySelector(selector); }
  querySelectorAll(selector) { return this.body.querySelectorAll(selector); }
}

export class TinyFormData {
  constructor(form) { this.form = form; }
  get(name) { return this.form?.querySelector(`[name="${name}"]`)?.value ?? ''; }
}

function buildPlatformPanelShell(panel) {
  const document = panel.ownerDocument;
  const toggle = document.createElement('button');
  toggle.className = 'awtsmoos-platform-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'AwtsmoosDB';
  panel.appendChild(toggle);

  const body = document.createElement('section');
  body.className = 'awtsmoos-platform-body';
  body.hidden = true;
  panel.appendChild(body);

  const status = document.createElement('small');
  status.setAttribute('data-platform-status', '');
  status.textContent = 'awakening';
  body.appendChild(status);

  const form = document.createElement('form');
  form.className = 'awtsmoos-platform-search';
  const input = document.createElement('input');
  input.name = 'q';
  form.appendChild(input);
  body.appendChild(form);

  const actions = document.createElement('div');
  actions.className = 'awtsmoos-platform-actions';
  for (const action of ['civilization', 'db', 'feed', 'presence', 'graph', 'searchIndex', 'digest', 'thread', 'relationships', 'media', 'cache', 'sync', 'jobs', 'permissions', 'ops']) {
    const button = document.createElement('button');
    button.setAttribute('data-platform-action', action);
    button.dataset.platformAction = action;
    button.textContent = action;
    actions.appendChild(button);
  }
  body.appendChild(actions);

  const output = document.createElement('div');
  output.className = 'awtsmoos-platform-output';
  output.setAttribute('data-platform-output', '');
  body.appendChild(output);
}

function dataKey(name) {
  return name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function walk(root) {
  return [root, ...root.children.flatMap(child => walk(child))];
}

function matches(el, selector) {
  if (selector.startsWith('.')) return el.className.split(/\s+/).includes(selector.slice(1));
  const data = selector.match(/^\[data-([^=\]]+)(?:="([^"]*)")?\]$/);
  if (data) {
    const key = dataKey(`data-${data[1]}`);
    return Object.hasOwn(el.dataset, key) && (data[2] === undefined || el.dataset[key] === data[2]);
  }
  const name = selector.match(/^\[name="([^"]+)"\]$/);
  if (name) return el.name === name[1];
  return el.tagName.toLowerCase() === selector.toLowerCase();
}
