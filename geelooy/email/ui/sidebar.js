
// B"H
import { state, subscribe } from '../store.js';
import { formatTime } from '../helpers.js';
import { FX } from './fx.js';
import { switchChat } from './chat.js';

let _uiRef = null;

export function renderSidebar(ui, parent) {
    _uiRef = ui;
    
    // Subscribe to updates (Decoupled from network.js)
    subscribe((key, val) => {
        if (key === 'snippets') renderThreadList();
    });

    // Header
    ui.html({
        parent,
        tag: 'div',
        classList: ['sidebar-header'],
        children: [
            { tag: 'div', classList: ['brand-title'], textContent: 'Awtsmoos Mail' },
            { 
                tag: 'div', classList: ['user-badge'], 
                children: [
                    { tag: 'span', classList: ['status-dot'] },
                    { tag: 'span', textContent: 'SECURE' } 
                ] 
            }
        ]
    });

    // Compose Button
    ui.html({
        parent,
        tag: 'button',
        classList: ['fab-compose'],
        textContent: '+ NEW TRANSMISSION',
        events: {
            click: () => {
                const modal = ui.getHtml('composeModal');
                if(modal) {
                     modal.classList.remove('hidden');
                     setTimeout(() => modal.classList.add('visible'), 10);
                     if(FX.playSound) FX.playSound('hover');
                }
            }
        }
    });

    // Tabs - UPDATED
    ui.html({
        parent,
        tag: 'div', classList: ['tabs-container'],
        children: [
            { tag: 'button', classList: ['nav-tab', 'active'], textContent: 'Inbox', events: { click: (e) => updateTabs(e, 'inbox') } },
            { tag: 'button', classList: ['nav-tab'], textContent: 'Requests', events: { click: (e) => updateTabs(e, 'requests') } }
        ]
    });

    // Thread List Container
    ui.html({ parent, tag: 'div', shaym: 'threadList', classList: ['thread-list'] });
}

function updateTabs(e, view) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    setView(view);
}

function setView(view) {
    state.view = view;
    renderThreadList();
}

function getQuantumColor(name) {
    let hash = 0;
    if(!name) name = "?";
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return `linear-gradient(135deg, #${("00000" + c).substr(-6)}44, #${("00000" + c).substr(-6)}aa)`;
}

export function renderThreadList() {
    if (!_uiRef) return;
    const list = _uiRef.getHtml('threadList');
    list.innerHTML = '';

    const threads = state.snippets ? state.snippets.filter(t => {
        if(state.view === 'requests') return t.status === 'request';
        // Inbox: Show if not a request (so status is inbox, undefined, or null)
        return (!t.status || t.status === 'inbox');
    }) : [];

    if (threads.length === 0) {
        _uiRef.html({ parent: list, tag: 'div', style: 'padding:20px; text-align:center; color:#555;', textContent: 'Void.' });
        return;
    }

    threads.forEach(t => {
        const name = t.correspondent ? t.correspondent.replace(/_at_/g, '@') : "Unknown";
        const bg = getQuantumColor(name);
        const isActive = state.activeThread === t.correspondent;
        
        _uiRef.html({
            parent: list,
            tag: 'div',
            classList: ['thread-item', isActive ? 'active' : null].filter(Boolean),
            events: {
                click: () => { 
                    if(FX.playSound) FX.playSound('hover'); 
                    switchChat(_uiRef, t.correspondent, name);
                    renderThreadList(); 
                }
            },
            children: [
                { tag: 'div', classList: ['avatar-circle'], style: `background: ${bg}`, textContent: name[0].toUpperCase() },
                {
                    tag: 'div', classList: ['thread-content'],
                    children: [
                        {
                            tag: 'div', classList: ['thread-top'],
                            children: [{tag:'span', classList:['thread-name'], textContent:name}, {tag:'span', classList:['thread-time'], textContent:formatTime(t.timeSent)}]
                        },
                        { tag: 'div', classList: ['thread-snippet'], textContent: (t.snippet || "...").substring(0, 40) }
                    ]
                }
            ]
        });
    });
}
