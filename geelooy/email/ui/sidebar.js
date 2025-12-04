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

    // 1. Resize Handle (Desktop Only)
    ui.html({
        parent: ui.getHtml('appContainer'),
        tag: 'div',
        classList: ['resize-handle'],
        events: {
            mousedown: (e) => initResize(e)
        }
    });

    // Header with Heartbeat
    ui.html({
        parent,
        tag: 'div',
        shaym: 'sideHeader',
        classList: ['sidebar-header', 'pulse-green'],
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

    // Simulate Network Jitter for Heartbeat
    setInterval(() => {
        const h = ui.getHtml('sideHeader');
        if(Math.random() > 0.9) {
            h.classList.remove('pulse-green');
            h.classList.add('pulse-amber');
            setTimeout(() => {
                h.classList.add('pulse-green');
                h.classList.remove('pulse-amber');
            }, 2000);
        }
    }, 5000);

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

// Resize Logic
function initResize(e) {
    e.preventDefault();
    const handle = e.target;
    handle.classList.add('active');
    
    const move = (e) => {
        const w = e.clientX;
        if(w > 200 && w < 600) {
            document.documentElement.style.setProperty('--sidebar-w', w + 'px');
        }
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
    _uiRef.getHtml('tabInbox').classList.toggle('active', view === 'inbox');
    _uiRef.getHtml('tabRequests').classList.toggle('active', view === 'requests');
    renderThreadList();
}

// Quantum Avatar Generator
function getQuantumColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const hex = "00000".substring(0, 6 - c.length) + c;
    return `linear-gradient(135deg, #${hex}44, #${hex}aa)`;
}

// Favicon Badge Painter
function updateFavicon(count) {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Draw Base
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(16, 16, 16, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#ffb700";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A", 16, 16);

    if (count > 0) {
        ctx.fillStyle = "#ff0000";
        ctx.beginPath(); ctx.arc(24, 8, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(count > 9 ? "9+" : count, 24, 8);
    }
    
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName('head')[0].appendChild(link);
}

export function renderThreadList() {
    if (!_uiRef) return;
    const list = _uiRef.getHtml('threadList');
    list.innerHTML = '';

    let totalUnread = 0;

    const threads = state.snippets.filter(t => {
        const isRequest = false; 
        return state.view === 'requests' ? isRequest : !isRequest;
    });

    if (threads.length === 0) {
        _uiRef.html({ parent: list, tag: 'div', style: 'padding:20px; text-align:center; color:#555;', textContent: 'Void.' });
        updateFavicon(0);
        return;
    }

    threads.forEach(t => {
        const name = t.correspondent.replace(/_at_/g, '@');
        const itemClasses = ['thread-item'];
        if (state.activeThread === t.correspondent) itemClasses.push('active');
        if (t.unreadCount) totalUnread += t.unreadCount;

        // Quantum Background
        const bgStyle = getQuantumColor(name);

        _uiRef.html({
            parent: list,
            tag: 'div',
            classList: itemClasses,
            events: {
                click: () => switchChat(_uiRef, t.correspondent, name)
            },
            children: [
                { 
                    tag: 'div', 
                    classList: ['avatar-circle'], 
                    style: `background: ${bgStyle}`,
                    textContent: name[0].toUpperCase() 
                },
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

    updateFavicon(totalUnread);
}