
// B"H
import { sendMessageApi } from '../network.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';
import { FX } from './fx.js';

export function renderLoginOverlay(ui, root) {
    ui.html({
        parent: root,
        tag: 'div',
        shaym: 'loginOverlay',
        classList: ['overlay'], // .visible managed by store
        children: [{
            tag: 'div',
            classList: ['modal-card', 'holo-border'],
            style: 'text-align: center; min-height: 350px; display: flex; flex-direction: column; justify-content: center; align-items: center;',
            children: [
                { tag: 'h2', classList: ['modal-title'], textContent: 'Identity Verification' },
                { tag: 'p', style: 'color:#aaa; margin-bottom:20px; font-family:monospace;', textContent: 'The Void requires a name.' },
                { 
                    tag: 'div', 
                    shaym: 'authWrapper',
                    style: 'width: 100%; display: flex; justify-content: center; position: relative; z-index: 100;',
                    ready: (el) => {
                        console.log("Mounting Profile Dropdown...");
                        try {
                            createProfileDropdown(el);
                        } catch(e) {
                            console.error("Dropdown Mount Failed:", e);
                            el.innerHTML = "<div style='color:red'>Signal Lost. Reload.</div>";
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
            classList: ['modal-card', 'holo-border'],
            children: [
                { tag: 'div', style: 'display:flex; justify-content:space-between; margin-bottom:15px;', children: [
                    { tag: 'h2', classList: ['modal-title'], style:'margin:0', textContent: 'New Transmission' },
                    { tag: 'span', classList: ['close-modal'], textContent: '×', events: { click: () => ui.getHtml('composeModal').classList.remove('visible') } }
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
                        { tag: 'textarea', shaym: 'newBody', classList: ['styled-input'], style: 'height:120px; font-family:monospace;', placeholder: 'Initiate data stream...' }
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
                                FX.playSound('sent');
                                await sendMessageApi(to, sub, body);
                                ui.getHtml('composeModal').classList.remove('visible');
                                ui.getHtml('newTo').value = '';
                                ui.getHtml('newBody').value = '';
                                FX.explode(window.innerWidth/2, window.innerHeight/2, '#0f0');
                            }
                        }
                    }
                }
            ]
        }]
    });
}
