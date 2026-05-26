
// B"H
import { sendMessageApi } from '../network.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';
import { FX } from './fx.js';
import { notify } from '../store.js';

export function renderLoginOverlay(ui, root) {
    ui.html({
        parent: root,
        tag: 'div',
        shaym: 'loginOverlay',
        classList: ['overlay'], // .visible managed by store
        children: [{
            tag: 'div',
            classList: ['modal-card', 'holo-border', 'identity-modal-card'],
            children: [
                { tag: 'h2', classList: ['modal-title'], textContent: 'Identity Verification' },
                { tag: 'p', classList: ['identity-modal-copy'], textContent: 'The Void requires a name.' },
                { 
                    tag: 'div', 
                    shaym: 'authWrapper',
                    classList: ['identity-dropdown-mount'],
                    ready: (el) => {
                        try {
                            createProfileDropdown(el);
                        } catch(e) {
                            console.error("Dropdown Mount Failed:", e);
                            const err = document.createElement('div');
                            err.className = 'mail-error-text';
                            err.textContent = 'Signal Lost. Reload.';
                            el.replaceChildren(err);
                        }
                    }
                }
            ]
        }]
    });
}

export function renderComposeModal(ui, root) {
    ui.html({
        parent: root,
        tag: 'div',
        shaym: 'composeModal',
        classList: ['overlay'],
        children: [{
            tag: 'div',
            classList: ['modal-card', 'holo-border', 'compose-modal-card'],
            children: [
                { tag: 'div', classList: ['compose-modal-top'], children: [
                    { tag: 'h2', classList: ['modal-title', 'compose-modal-title'], textContent: 'New Transmission' },
                    { 
                        tag: 'span', classList: ['close-modal'], textContent: '×', 
                        events: { 
                            click: () => {
                                const modal = ui.getHtml('composeModal');
                                if(modal) {
                                    modal.classList.remove('visible');
                                    setTimeout(() => modal.classList.add('hidden'), 300);
                                }
                            }
                        } 
                    }
                ]},
                
                {
                    tag: 'div', classList: ['input-group'],
                    children: [
                        { tag: 'label', classList: ['input-label'], textContent: 'Recipient' },
                        { tag: 'input', shaym: 'newTo', classList: ['styled-input'], placeholder: 'alias OR email@example.com' }
                    ]
                },
                {
                    tag: 'div', classList: ['input-group'],
                    children: [
                        { tag: 'label', classList: ['input-label'], textContent: 'Subject' },
                        { tag: 'input', shaym: 'newSub', classList: ['styled-input'], placeholder: 'Topic Protocol...' }
                    ]
                },
                {
                    tag: 'div', classList: ['input-group'],
                    children: [
                        { tag: 'label', classList: ['input-label'], textContent: 'Message Payload' },
                        { tag: 'textarea', shaym: 'newBody', classList: ['styled-input', 'compose-body-input'], placeholder: 'Initiate data stream...' }
                    ]
                },
                {
                    tag: 'button',
                    classList: ['btn-primary'],
                    textContent: 'Transmit',
                    events: {
                        click: async () => {
                            const to = ui.getHtml('newTo').value;
                            const sub = ui.getHtml('newSub').value;
                            const body = ui.getHtml('newBody').value;
                            if(to && body) {
                                if(FX.playSound) FX.playSound('sent');
                                await sendMessageApi(to, sub, body);
                                const modal = ui.getHtml('composeModal');
                                if(modal) {
                                    modal.classList.remove('visible');
                                    setTimeout(() => modal.classList.add('hidden'), 300);
                                }
                                ui.getHtml('newTo').value = '';
                                ui.getHtml('newBody').value = '';
                                if(FX.explode) FX.explode(window.innerWidth/2, window.innerHeight/2, '#0f0');
                            }
                        }
                    }
                }
            ]
        }]
    });
}

export function renderContextMenu(ui, x, y, msg, row) {
    const existing = document.querySelectorAll('.context-menu');
    existing.forEach(e => e.remove());

    if(FX.playSound) FX.playSound('hover');

    const menuW = 200;
    const menuH = 140; // Reduced height
    
    let posX = x;
    let posY = y;
    
    if (posX + menuW > window.innerWidth) posX = window.innerWidth - menuW - 10;
    if (posY + menuH > window.innerHeight) posY = window.innerHeight - menuH - 10;

    ui.html({
        parent: document.body,
        tag: 'div',
        classList: ['context-menu'],
        style: `left: ${posX}px; top: ${posY}px;`,
        children: [
            {
                tag: 'div', classList: ['ctx-item'], textContent: 'Copy Text',
                events: { click: () => {
                    navigator.clipboard.writeText(msg.content || "");
                    closeMenu();
                }}
            },
            { tag: 'div', classList: ['ctx-separator'] },
            {
                tag: 'div', classList: ['ctx-item'], textContent: 'Reply',
                events: { click: () => {
                    const quote = (msg.content || "").substring(0, 50).replace(/\n/g, ' ');
                    notify('triggerReply', { msg, name: msg.fromName || "User", quote });
                    closeMenu();
                }}
            },
            { tag: 'div', classList: ['ctx-separator'] },
            {
                tag: 'div', classList: ['ctx-item', 'ctx-danger'], textContent: 'Vanish (Local)',
                events: { click: () => {
                    if(row) {
                        row.style.transition = 'all 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
                        row.style.transform = 'scale(0) rotate(45deg) skewX(20deg)';
                        row.style.opacity = '0';
                        row.style.filter = 'blur(10px)';
                        setTimeout(() => row.remove(), 550);
                    }
                    closeMenu();
                }}
            }
        ],
        ready: (el) => {
            setTimeout(() => {
                const close = (e) => {
                    if (!el.contains(e.target)) {
                        closeMenu();
                        window.removeEventListener('pointerdown', close);
                    }
                };
                window.addEventListener('pointerdown', close);
            }, 50);
        }
    });

    function closeMenu() {
        const menu = document.querySelector('.context-menu');
        if(menu) {
            menu.style.opacity = '0';
            menu.style.transform = 'scale(0.95)';
            setTimeout(() => menu.remove(), 200);
        }
    }
}
