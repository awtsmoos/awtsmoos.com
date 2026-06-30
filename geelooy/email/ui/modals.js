// B"H
/**
 * @module AwtsmoosMailModals
 * @description The compose chamber no longer burns the parchment on failure:
 * errors remain inline, the button speaks its state, and the user's draft waits.
 */
import { sendMessageApi } from '../network.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';
import { FX } from './fx.js';
import { notify } from '../store.js';

export function renderLoginOverlay(ui, root) {
    ui.html({ parent: root, tag: 'div', shaym: 'loginOverlay', classList: ['overlay'], children: [{
        tag: 'div', classList: ['modal-card', 'holo-border', 'identity-modal-card'], children: [
            { tag: 'h2', classList: ['modal-title'], textContent: 'Mail Identity' },
            { tag: 'p', classList: ['identity-modal-copy'], textContent: 'Preparing your default alias. You can switch aliases here.' },
            { tag: 'div', shaym: 'authWrapper', classList: ['identity-dropdown-mount'], ready: el => mountDropdown(el) }
        ]
    }] });
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
    ui.html({ parent: root, tag: 'div', shaym: 'composeModal', classList: ['overlay'], children: [{
        tag: 'div', classList: ['modal-card', 'holo-border', 'compose-modal-card'], children: [
            { tag: 'div', classList: ['compose-modal-top'], children: [
                { tag: 'h2', classList: ['modal-title', 'compose-modal-title'], textContent: 'New Transmission' },
                { tag: 'button', classList: ['close-modal'], textContent: '×', events: { click: () => closeModal(ui, 'composeModal') } }
            ] },
            field('Recipient', 'input', 'newTo', 'alias OR email@example.com'),
            field('Subject', 'input', 'newSub', 'Topic Protocol...'),
            field('Message Payload', 'textarea', 'newBody', 'Initiate data stream...', ['compose-body-input']),
            { tag: 'div', shaym: 'composeError', classList: ['mail-compose-error', 'hidden'], attrs: { role: 'alert' } },
            { tag: 'button', shaym: 'composeTransmit', classList: ['btn-primary'], textContent: 'Transmit', events: { click: () => transmit(ui) } }
        ]
    }] });
}

function field(label, tag, shaym, placeholder, extra = []) {
    return { tag: 'div', classList: ['input-group'], children: [
        { tag: 'label', classList: ['input-label'], textContent: label },
        { tag, shaym, classList: ['styled-input', ...extra], placeholder }
    ] };
}

function composeValues(ui) {
    return {
        to: ui.getHtml('newTo')?.value.trim() || '',
        subject: ui.getHtml('newSub')?.value || '',
        body: ui.getHtml('newBody')?.value || ''
    };
}

function setComposeError(ui, message = '') {
    const box = ui.getHtml('composeError');
    if (!box) return;
    box.textContent = message;
    box.classList.toggle('hidden', !message);
}

function resetCompose(ui) {
    ['newTo', 'newSub', 'newBody'].forEach(name => { const el = ui.getHtml(name); if (el) el.value = ''; });
    setComposeError(ui, '');
}

async function transmit(ui) {
    const { to, subject, body } = composeValues(ui);
    const button = ui.getHtml('composeTransmit');
    if (!to || !body.trim()) return setComposeError(ui, 'Recipient and message body are required.');
    if (button?.disabled) return;
    setComposeError(ui, '');
    if (button) { button.disabled = true; button.textContent = 'Transmitting...'; }
    try {
        if (FX.playSound) FX.playSound('sent');
        await sendMessageApi(to, subject, body);
        closeModal(ui, 'composeModal');
        resetCompose(ui);
        if (FX.explode) FX.explode(window.innerWidth / 2, window.innerHeight / 2, '#0f0');
    } catch (error) {
        setComposeError(ui, `Transmission failed: ${error.message || 'Unknown error'}`);
        notify('error', error);
    } finally {
        if (button) { button.disabled = false; button.textContent = 'Transmit'; }
    }
}

function closeModal(ui, shaym) {
    const modal = ui.getHtml(shaym);
    if (!modal) return;
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 180);
}

export function renderContextMenu(ui, x, y, msg, row) {
    document.querySelectorAll('.context-menu').forEach(el => el.remove());
    if (FX.playSound) FX.playSound('hover');
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
    item.className = `ctx-item ${danger}`.trim();
    item.textContent = text;
    item.addEventListener('click', () => { fn(); document.querySelector('.context-menu')?.remove(); });
    return item;
}
