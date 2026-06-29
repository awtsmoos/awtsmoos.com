// B"H
export function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== '' && text !== null && text !== undefined) node.textContent = String(text);
  return node;
}

export function link(text, href) {
  const node = element('a', '', text);
  node.href = href || '/heichelos';
  return node;
}

export function button(text, onClick) {
  const node = element('button', '', text);
  node.type = 'button';
  node.addEventListener('click', event => {
    event.stopPropagation();
    onClick?.(event);
  });
  return node;
}

export function pill(text) {
  return element('span', 'object-pill', String(text || 'object'));
}

export function textNode(text) {
  const node = element('p');
  node.textContent = text || '';
  return node;
}

export function preNode(value) {
  return element('pre', '', stringify(value, 1400));
}

export function stringify(value, limit = 1200) {
  try { return JSON.stringify(value, null, 2).slice(0, limit); }
  catch { return String(value).slice(0, limit); }
}

export function trim(value, limit = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

export function stableKey(value) {
  const text = stringify(value, 180);
  try { return btoa(unescape(encodeURIComponent(text))).replace(/[^a-z0-9]/gi, '').slice(0, 18); }
  catch { return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`; }
}

/** B"H: small DOM letters, no second framework. */
