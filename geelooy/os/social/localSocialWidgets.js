// B"H

function safeText(value) {
  return String(value ?? '');
}

function setText(parent, tag, text) {
  const node = document.createElement(tag);
  node.textContent = safeText(text);
  parent.append(node);
  return node;
}

export function currentAlias() {
  const stored = localStorage.getItem('awtsmoos_social_inbox_alias') ||
    localStorage.getItem('awtsmoosAlias') ||
    window.awtsmoosAlias || '';
  return safeText(stored).replace(/^@/, '');
}

export async function json(url) {
  const response = await fetch(url);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export function status(text) {
  const paragraph = document.createElement('p');
  paragraph.className = 'g-social-status';
  paragraph.setAttribute('aria-live', 'polite');
  paragraph.textContent = text;
  return paragraph;
}

export function card([id, title, href]) {
  const anchor = document.createElement('a');
  anchor.className = 'geelooy-os-social-panel__card';
  anchor.href = href;
  anchor.dataset.osSocialApp = id;
  setText(anchor, 'strong', title);
  setText(anchor, 'p', 'Open full route');
  return anchor;
}

export function inlineMessaging({ aliases = [], defaultAlias = '', onClose = () => {} } = {}) {
  const form = document.createElement('form');
  form.className = 'geelooy-os-social-panel__card geelooy-os-message';
  setText(form, 'strong', 'Quick Message');
  const aliasLabel = setText(form, 'label', 'Alias');
  const aliasInput = document.createElement('input');
  aliasInput.name = 'alias';
  aliasInput.autocomplete = 'nickname';
  aliasInput.value = defaultAlias || aliases[0] || '';
  aliasLabel.append(aliasInput);
  const messageLabel = setText(form, 'label', 'Message');
  const message = document.createElement('textarea');
  message.name = 'message';
  message.rows = 4;
  message.placeholder = 'Write a signal of good.';
  messageLabel.append(message);
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Open mail composer';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close';
  close.addEventListener('click', onClose);
  form.append(submit, close);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const query = new URLSearchParams({ to: aliasInput.value.trim(), body: message.value.trim() });
    location.href = `/email?${query.toString()}`;
  });
  return form;
}

export function thanksFallback({ href = '/heichelos' } = {}) {
  const box = document.createElement('article');
  box.className = 'geelooy-os-social-panel__card geelooy-os-thanks';
  setText(box, 'strong', 'Thanks vessel ready');
  setText(box, 'p', 'The OS can open the confirmed thanks path without unconfirmed APIs.');
  const link = document.createElement('a');
  link.href = href;
  link.textContent = 'Open Heichelos';
  box.append(link);
  return box;
}
