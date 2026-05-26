
// B"H
import { state, subscribe } from '../store.js';
import { formatTime } from '../helpers.js';
import { FX } from './fx.js';
import { switchChat } from './chat.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';

let _uiRef = null;

export function renderSidebar(ui, parent) {
    _uiRef = ui;
    
    // Subscribe to updates
    subscribe((key, val) => {
        if (key === 'snippets') renderThreadList();
    });

    // Header
    ui.html({
        parent,
        tag: 'div',
        classList: ['sidebar-header', 'mail-sidebar-header'],
        children: [
            { 
                tag: 'div', 
                classList: ['mail-sidebar-identity'],
                children: [
                    { tag: 'div', classList: ['brand-title'], textContent: 'Awtsmoos Mail' },
                    // Mount Point for Profile Dropdown
                    { 
                        tag: 'div', 
                        shaym: 'sidebarProfileMount',
                        classList: ['mail-sidebar-profile-mount'],
                        ready: (el) => {
                            try {
                                createProfileDropdown(el);
                            } catch(e) { console.error("Profile Mount Error", e); }
                        }
                    }
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

    // Tabs
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

function formatHandle(str) {
    if(!str) return "Unknown";
    
    // 1. Basic Decode
    let formatted = str.replace(/_at_/g, '@');
    
    // 2. Remove redundant default domain suffix
    // Example: coby@gmail.com@awtsmoos.com -> coby@gmail.com
    const defaultDomain = "@awtsmoos.com"; // Adjust if your domain differs
    
    if (formatted.endsWith(defaultDomain)) {
        const withoutSuffix = formatted.slice(0, -defaultDomain.length);
        // Only strip if what remains is still a valid-ish handle (contains @ or at least 1 char)
        if (withoutSuffix.length > 0) {
            // If the remaining part is an email (has @), we definitely strip the federated suffix
            if (withoutSuffix.includes('@')) {
                formatted = withoutSuffix;
            }
            // If it's just a username "awtsmoos@awtsmoos.com", we might keep it or strip it depending on preference.
            // Let's strip it to be clean: "awtsmoos"
            else {
               // Optional: formatted = withoutSuffix; 
            }
        }
    }

    return formatted;
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
        return (!t.status || t.status === 'inbox');
    }) : [];

    if (threads.length === 0) {
        _uiRef.html({ parent: list, tag: 'div', classList: ['thread-empty-state'], textContent: 'Void.' });
        return;
    }

    threads.forEach(t => {
        const rawName = t.correspondent || "Unknown";
        const displayName = formatHandle(rawName);
        const bg = getQuantumColor(displayName);
        const isActive = state.activeThread === t.correspondent;
        
        _uiRef.html({
            parent: list,
            tag: 'div',
            classList: ['thread-item', isActive ? 'active' : null].filter(Boolean),
            events: {
                click: () => { 
                    if(FX.playSound) FX.playSound('hover'); 
                    switchChat(_uiRef, t.correspondent, displayName);
                    renderThreadList(); 
                }
            },
            children: [
                { tag: 'div', classList: ['avatar-circle'], style: `background: ${bg}`, textContent: displayName[0].toUpperCase() },
                {
                    tag: 'div', classList: ['thread-content'],
                    children: [
                        {
                            tag: 'div', classList: ['thread-top'],
                            children: [
                                {tag:'span', classList:['thread-name'], textContent: displayName }, 
                                {tag:'span', classList:['thread-time'], textContent: formatTime(t.timeSent) }
                            ]
                        },
                        { tag: 'div', classList: ['thread-snippet'], textContent: (t.snippet || "...").substring(0, 40) }
                    ]
                }
            ]
        });
    });
}
