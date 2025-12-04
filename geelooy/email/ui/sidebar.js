// B"H
import { state } from '../store.js';
import { refreshSnippets } from '../network.js';
import { switchChat } from './chat.js';
import { formatTime } from '../helpers.js';

let _uiRef = null;
let _container = null;

export function renderSidebar(ui, parent) {
    _uiRef = ui;
    _container = parent;

    // Header
    ui.html({
        parent,
        tag: 'div',
        classList: ['sidebar-header'],
        children: [
            { tag: 'div', classList: ['brand-title'], textContent: 'Awtsmoos Mail' },
            { 
                tag: 'div', 
                classList: ['user-badge'], 
                children: [
                    { tag: 'span', classList: ['status-dot'] },
                    { tag: 'span', shaym: 'userStatusText', textContent: 'Connecting...' } 
                ] 
            }
        ]
    });

    // Compose Button
    ui.html({
        parent,
        tag: 'button',
        classList: ['fab-compose'],
        textContent: '+ New Transmission',
        events: {
            click: () => ui.getHtml('composeModal').classList.add('visible')
        }
    });

    // Tabs
    ui.html({
        parent,
        tag: 'div',
        classList: ['tabs-container'],
        style: 'margin: 0 16px;',
        children: [
            { 
                tag: 'button', 
                classList: ['nav-tab', 'active'], 
                textContent: 'Inbox',
                shaym: 'tabInbox',
                events: { click: () => setView('inbox') }
            },
            { 
                tag: 'button', 
                classList: ['nav-tab'], 
                textContent: 'Requests',
                shaym: 'tabRequests',
                events: { click: () => setView('requests') }
            }
        ]
    });

    // Thread List Container
    ui.html({
        parent,
        tag: 'div',
        shaym: 'threadList',
        classList: ['thread-list']
    });
}

function setView(view) {
    state.view = view;
    _uiRef.getHtml('tabInbox').classList.toggle('active', view === 'inbox');
    _uiRef.getHtml('tabRequests').classList.toggle('active', view === 'requests');
    renderThreadList();
}

export function renderThreadList() {
    if (!_uiRef) return;
    const list = _uiRef.getHtml('threadList');
    list.innerHTML = '';

    const threads = state.snippets.filter(t => {
        // Simple filter logic for demo
        const isRequest = false; // Implement approved logic
        return state.view === 'requests' ? isRequest : !isRequest;
    });

    if (threads.length === 0) {
        _uiRef.html({ parent: list, tag: 'div', style: 'padding:20px; text-align:center; color:#555;', textContent: 'Void.' });
        return;
    }

    threads.forEach(t => {
        const name = t.correspondent.replace(/_at_/g, '@');
        _uiRef.html({
            parent: list,
            tag: 'div',
            classList: ['thread-item', state.activeThread === t.correspondent ? 'active' : ''],
            events: {
                click: () => switchChat(_uiRef, t.correspondent, name)
            },
            children: [
                { tag: 'div', classList: ['avatar-circle'], textContent: name[0].toUpperCase() },
                {
                    tag: 'div',
                    classList: ['thread-content'],
                    children: [
                        {
                            tag: 'div', classList: ['thread-header'],
                            children: [
                                { tag: 'span', classList: ['thread-name'], textContent: name },
                                { tag: 'span', classList: ['thread-time'], textContent: formatTime(t.timeSent) }
                            ]
                        },
                        { tag: 'div', classList: ['thread-snippet'], textContent: t.snippet || t.subject || "..." }
                    ]
                },
                t.unreadCount > 0 ? { tag: 'div', classList: ['unread-dot'], textContent: t.unreadCount } : null
            ]
        });
    });
}