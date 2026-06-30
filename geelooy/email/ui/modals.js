// B"H
/**
 * @module AwtsmoosMailModals
 * @description Modal orchestration: identity, compose transmission, context menu.
 */
import { sendMessageApi } from '../network.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';
import { FX } from './fx.js';
import { notify } from '../store.js';
import { bindModalEscape, closeModal, composeValues, field, resetCompose, setComposeError } from './modalFields.js';

export function renderLoginOverlay(ui, root) {
  ui.html({ parent: root, tag: 'div', shaym: 'loginOverlay', classList: ['overlay'], children: [
    { tag: 'div', classList: ['modal-card', 'holo-border', 'identity-modal-card'], children: [
      { tag: 'h2', classList: ['modal-title'], textContent: 'Mail Identity' },
      { tag: 'p', classList: ['identity-modal-copy'], textContent: 'Preparing your default alias. You can switch aliases here.' },
      { tag: 'div', shaym: 'authWrapper', classList: ['identity-dropdown-mount'], ready: mountDropdown }
    ]}
  ]});
}

function mountDropdown(el) {
  try { createProfileDropdown(el); }
  catch (error) {
    console.error('Dropdown Mount Failed:', error);
    const err = document.createElement('div');
    err.className = 'mail-error-text';
    err.textContent = 'Could not load identity switcher. Reload.';
    el.replaceChildren(err);
  }
}

export function renderComposeModal(ui, root) {
  ui.html({ parent: root, tag: 'div', shaym: 'composeModal', classList: ['overlay'], attributes: { tabindex: '-1' }, children: [
    { tag: 'div', classList: ['modal-card', 'holo-border', 'compose-modal-card'], children: [
      { tag: 'div', classList: ['compose-modal-top'], children: [
        { tag: 'h2', classList: ['modal-title', 'compose-modal-title'], textContent: 'New Transmission' },
        { tag: 'button', classList: ['close-modal'], attributes: { type: 'button', 'aria-label': 'Close compose modal', title: 'Close compose modal' }, textContent: '×', events: { click: () => closeModal(ui, 'composeModal') } }
      ]},
      field('Recipient', 'input', 'newTo', 'alias OR email@example.com'),
      field('Subject', 'input', 'newSub', 'Topic Protocol...'),
      field('Message Payload', 'textarea', 'newBody', 'Initiate data stream...', ['compose-body-input']),
      { tag: 'div', shaym: 'composeError', classList: ['mail-compose-error', 'hidden'], attributes: { role: 'alert' } },
      { tag: 'button', shaym: 'composeTransmit', classList: ['btn-primary'], attributes: { type: 'button' }, textContent: 'Transmit Message', events: { click: () => transmit(ui) } }
    ]}
  ]});
  bindModalEscape(ui, 'composeModal');
}

async function transmit(ui) {
  const { to, subject, body } = composeValues(ui);
  const button = ui.getHtml('composeTransmit');
  if (!to || !body.trim()) return setComposeError(ui, 'Recipient and message body are required.');
  if (button?.disabled) return;
  setComposeError(ui, '');
  if (button) { button.disabled = true; button.textContent = 'Transmitting...'; button.setAttribute('aria-busy', 'true'); }
  try {
    FX.playSound?.('sent');
    await sendMessageApi(to, subject, body);
    closeModal(ui, 'composeModal');
    resetCompose(ui);
    FX.explode?.(window.innerWidth / 2, window.innerHeight / 2, '#0f0');
  } catch (error) {
    setComposeError(ui, `Transmission failed: ${error.message || 'Unknown error'}`);
    notify('error', error);
  } finally {
    if (button) { button.disabled = false; button.textContent = 'Transmit Message'; button.removeAttribute('aria-busy'); }
  }
}

export function renderContextMenu(ui, x, y, msg, row) {
  document.querySelectorAll('.context-menu').forEach(el => el.remove());
  FX.playSound?.('hover');
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = `${Math.min(x, window.innerWidth - 210)}px`;
  menu.style.top = `${Math.min(y, window.innerHeight - 150)}px`;
  menu.append(action('Copy Text', () => navigator.clipboard.writeText(msg.content || '')));
  menu.append(action('Reply', () => notify('triggerReply', { msg, name: msg.fromName || 'User', quote: (msg.content || '').slice(0, 50).replace(/\n/g, ' ') })));
  menu.append(action('Vanish (Local)', () => row?.remove(), 'ctx-danger'));
  document.body.appendChild(menu);
  setTimeout(() => window.addEventListener('pointerdown', event => { if (!menu.contains(event.target)) menu.remove(); }, { once: true }), 50);
}

function action(text, fn, danger = '') {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = `ctx-item ${danger}`.trim();
  item.textContent = text;
  item.addEventListener('click', () => { fn(); document.querySelector('.context-menu')?.remove(); });
  return item;
}
