// B"H
import { sendMessageApi } from '../network.js';

export function renderLoginOverlay(ui, root) {
    ui.html({
        parent: root,
        tag: 'div',
        shaym: 'loginOverlay',
        classList: ['overlay'], // .visible added by store
        children: [{
            tag: 'div',
            classList: ['modal-card'],
            children: [
                { tag: 'h2', classList: ['modal-title'], textContent: 'Access Restricted' },
                { tag: 'p', style: 'color:#aaa; margin-bottom:20px;', textContent: 'Please log in to access the Quantum Network.' },
                { 
                    tag: 'a', 
                    classList: ['btn-primary'], 
                    style: 'text-align:center; display:block; text-decoration:none;',
                    textContent: 'Login / Select Alias',
                    attributes: { href: '/login' }
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
            classList: ['modal-card'],
            children: [
                { tag: 'span', classList: ['close-modal'], textContent: '×', events: { click: () => ui.getHtml('composeModal').classList.remove('visible') } },
                { tag: 'h2', classList: ['modal-title'], textContent: 'New Transmission' },
                
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
                        { tag: 'input', shaym: 'newSub', classList: ['styled-input'], placeholder: 'Topic...' }
                    ]
                },
                {
                    tag: 'div', classList: ['input-group'],
                    children: [
                        { tag: 'label', classList: ['input-label'], textContent: 'Message' },
                        { tag: 'textarea', shaym: 'newBody', classList: ['styled-input'], style: 'height:120px;', placeholder: 'Write...' }
                    ]
                },
                {
                    tag: 'button',
                    classList: ['btn-primary'],
                    textContent: 'Send',
                    events: {
                        click: async () => {
                            const to = ui.getHtml('newTo').value;
                            const sub = ui.getHtml('newSub').value;
                            const body = ui.getHtml('newBody').value;
                            if(to && body) {
                                await sendMessageApi(to, sub, body);
                                ui.getHtml('composeModal').classList.remove('visible');
                                ui.getHtml('newTo').value = '';
                                ui.getHtml('newBody').value = '';
                            }
                        }
                    }
                }
            ]
        }]
    });
}