// B"H
import { state } from '../store.js';
import { refreshSnippets } from '../network.js';
import { switchChat } from './chat.js';
import { formatTime } from '../helpers.js';
import { FX } from './fx.js';

let _uiRef = null;

export function renderSidebar(ui, parent) {
    _uiRef = ui;
    
    // Header
    ui.html({
        parent,
        tag: 'div',
        shaym: 'sideHeader',
        classList: ['sidebar-header', 'pulse-green'],
        children: [
            { tag: 'div', classList: ['brand-title'], textContent: 'Awtsmoos Mail' },
            { 
                tag: 'div', classList: ['user-badge'], 
                children: [
                    { tag: 'span', classList: ['status-dot'] },
                    { tag: 'span', shaym: 'userStatusText', textContent: 'Connecting...' } 
                ] 
            }
        ]
    });

    // Resize Handle
    ui.html({
        parent: ui.getHtml('appContainer'),
        tag: 'div', classList: ['resize-handle'],
        events: { mousedown: initResize }
    });

    // Tabs
    ui.html({
        parent,
        tag: 'div', classList: ['tabs-container'],
        children: [
            { tag: 'button', classList: ['nav-tab', 'active'], textContent: 'Inbox', events: { click: () => setView('inbox') } },
            { tag: 'button', classList: ['nav-tab'], textContent: 'Requests', events: { click: () => setView('requests') } }
        ]
    });

    // Thread List
    ui.html({ parent, tag: 'div', shaym: 'threadList', classList: ['thread-list'] });
}

function initResize(e) {
    e.preventDefault();
    const handle = e.target;
    handle.classList.add('active');
    const move = (e) => {
        const w = e.clientX;
        if(w > 200 && w < 600) document.documentElement.style.setProperty('--sidebar-w', w + 'px');
    };
    const stop = () => {
        handle.classList.remove('active');
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', stop);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
}

function setView(view) {
    state.view = view;
    renderThreadList();
}

function getQuantumColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return `linear-gradient(135deg, #${("00000" + c).substr(-6)}44, #${("00000" + c).substr(-6)}aa)`;
}

export function renderThreadList() {
    if (!_uiRef) return;
    const list = _uiRef.getHtml('threadList');
    list.innerHTML = '';

    const threads = state.snippets.filter(t => state.view === 'requests' ? false : true); // Logic placeholder

    if (threads.length === 0) {
        _uiRef.html({ parent: list, tag: 'div', style: 'padding:20px; text-align:center; color:#555;', textContent: 'Void.' });
        return;
    }

    threads.forEach(t => {
        const name = t.correspondent.replace(/_at_/g, '@');
        const bg = getQuantumColor(name);
        
        _uiRef.html({
            parent: list,
            tag: 'div',
            classList: ['thread-item', state.activeThread === t.correspondent ? 'active' : ''].filter(Boolean),
            events: {
                click: () => { 
                    FX.playSound('hover'); 
                    switchChat(_uiRef, t.correspondent, name);
                },
                mousemove: (e) => FX.applyTilt(e.currentTarget, e),
                mouseleave: (e) => FX.resetTilt(e.currentTarget)
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
                        { tag: 'div', classList: ['thread-snippet'], textContent: t.snippet||"..." }
                    ]
                }
            ]
        });
    });
}